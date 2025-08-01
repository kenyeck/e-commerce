import express, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { convertToCamelCase } from './utils/convertToCamelCase';
import users from './routes/users';
import products from './routes/products';
import orders from './routes/orders';
import carts from './routes/carts';
import categories from './routes/categories';

import dotenv from 'dotenv';
dotenv.config({
   path: `./.env.${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : 'development'}`
});

export const pool = new Pool({
   // Use connection string for Supabase (preferred method)
   connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
   // SSL configuration for all environments with Supabase
   ssl: {
      rejectUnauthorized: false
   },
   // Connection pool settings optimized for serverless
   max: process.env.NODE_ENV === 'production' ? 1 : 10, // Limit connections in serverless
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 10000
});

// Test database connection on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
   console.log('🔌 Attempting database connection...');
   console.log(
      'Connection string being used:',
      process.env.POSTGRES_URL_NON_POOLING ? 'NON_POOLING' : 'POOLING'
   );

   pool.connect((err, client, release) => {
      if (err) {
         console.error('❌ Error connecting to database:', err.message);
         console.error('Connection details:', {
            hasNonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
            hasPoolingUrl: !!process.env.POSTGRES_URL,
            usingConnection: process.env.POSTGRES_URL_NON_POOLING ? 'NON_POOLING' : 'POOLING',
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            user: process.env.POSTGRES_USER?.substring(0, 5) + '***', // Hide sensitive data
            port: process.env.POSTGRES_PORT
         });
      } else {
         console.log('✅ Database connected successfully');
         if (release) release();
      }
   });
} else {
   console.log('🔌 Production mode - database connection will be established on first request');
}

const app: Express = express();

const options = {
   swaggerDefinition: {
      openapi: '3.0.0',
      info: {
         title: 'E-Commerce API',
         version: '1.0.0'
      }
   },
   apis: ['./src/routes/*.ts']
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

//app.use(cors({ origin: process.env.CORS_ORIGIN!, credentials: true }));
const corsOptions = {
   origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
   ) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) {
         return callback(null, true);
      }

      // Parse multiple origins from environment variable
      const allowedOrigins = process.env.CORS_ORIGIN
         ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
         : ['http://localhost:3000', 'http://localhost:3001'];

      console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
      if (allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
   },
   credentials: true, // Essential for sessions and cookies
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
   ],
   exposedHeaders: ['Set-Cookie'],
   optionsSuccessStatus: 200, // For legacy browser support
   preflightContinue: false // Let cors handle preflight completely
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Additional manual preflight handling for Vercel compatibility
app.options('*', (req: Request, res: Response) => {
   const origin = req.get('Origin');
   const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];

   console.log(`Manual OPTIONS preflight - Origin: ${origin}`);

   if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header(
         'Access-Control-Allow-Headers',
         'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
      );
      res.header('Access-Control-Max-Age', '86400'); // 24 hours
      console.log(`Manual OPTIONS: Headers set for origin ${origin}`);
      return res.status(200).end();
   } else {
      console.log(`Manual OPTIONS: Origin ${origin} not allowed`);
      return res.status(403).end();
   }
});

app.use(cors(corsOptions));

app.use(
   session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
         secure: process.env.NODE_ENV === 'production', // Only secure in production
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24, // 24 hours
         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies in production
      }
   })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user: any, done) {
   //console.log('Serializing user:', convertToCamelCase(user).userId);
   done(null, convertToCamelCase(user).userId);
});

passport.deserializeUser(function (id: string, done) {
   //console.log('Deserializing user with ID:', id);
   pool.query('SELECT * FROM "user" WHERE user_id = $1', [id], (err, result) => {
      if (err) {
         console.error('Error deserializing user:', err);
         return done(err);
      }
      if (result.rows.length === 0) {
         console.error('User not found during deserialization:', id);
         return done(null, false);
      }
      //console.log('User deserialized successfully');
      done(null, convertToCamelCase(result.rows[0]));
   });
});

passport.use(
   new LocalStrategy(async (username, password, done) => {
      try {
         console.log('Login attempt for username:', username);
         console.log('Password provided:', password ? 'Yes' : 'No');

         if (!username || !password) {
            console.log('Missing username or password');
            return done(null, false, { message: 'Username and password are required.' });
         }

         const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
         if (result.rows.length === 0) {
            console.log('User not found:', username);
            return done(null, false, { message: 'Incorrect username.' });
         }

         const user = convertToCamelCase(result.rows[0]);
         //console.log('User found:', user.username);
         //console.log('User passwordHash exists:', user.passwordHash ? 'Yes' : 'No');
         // console.log(
         //    'PasswordHash length:',
         //    user.passwordHash ? user.passwordHash.length : 'undefined'
         // );

         // Check if passwordHash exists
         if (!user.passwordHash) {
            console.error('No password hash found for user:', username);
            return done(null, false, { message: 'Account configuration error.' });
         }

         // Fix: use passwordHash instead of password
         const isMatch = await bcrypt.compare(password, user.passwordHash);
         if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return done(null, false, { message: 'Incorrect password.' });
         }
         //console.log('Login successful for user:', convertToCamelCase(user));
         return done(null, user);
      } catch (error) {
         console.error('Login error:', error);
         return done(error);
      }
   })
);

app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/carts', carts);
app.use('/api/categories', categories);

app.post('/api/login', (req: Request, res: Response, next) => {
   console.log('Login request received');
   passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
         console.error('Login error:', err);
         return res.status(500).json({ error: 'Internal server error' });
      }
      if (!user) {
         console.log('Login failed:', info?.message);
         return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }

      req.logIn(user, (err) => {
         if (err) {
            console.error('Session login error:', err);
            return res.status(500).json({ error: 'Session error' });
         }
         console.log('Login successful, user logged in');
         // Remove sensitive information
         const { passwordHash, ...userWithoutPassword } = user;
         res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword
         });
      });
   })(req, res, next);
});

app.post('/api/logout', (req: Request, res: Response) => {
   console.log('Logout request received');
   req.logout((err) => {
      if (err) {
         console.error('Logout error:', err);
         return res.status(500).json({ error: 'Logout failed' });
      }
      console.log('Logout successful');
      res.status(200).json({ message: 'Logged out successfully' });
   });
});

app.get('/api/health', (req, res) => {
   res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent')
   });
});

// Debug endpoint for CORS testing
app.get('/api/debug/cors', (req: Request, res: Response) => {
   res.status(200).json({
      message: 'CORS is working',
      origin: req.get('Origin'),
      method: req.method,
      headers: req.headers,
      corsOrigin: process.env.CORS_ORIGIN,
      timestamp: new Date().toISOString()
   });
});

const port = 3001;
app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});

export default app;
