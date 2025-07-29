import express, { Express, Request, Response, NextFunction } from 'express';
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
   user: process.env.POSTGRES_USER, // your db user
   host: process.env.POSTGRES_HOST,
   database: process.env.POSTGRES_DB,
   password: process.env.POSTGRES_PASSWORD,
   port: Number(process.env.POSTGRES_PORT)
});

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
   optionsSuccessStatus: 200 // For legacy browser support
};
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
   console.log('Serializing user:', convertToCamelCase(user).userId);
   done(null, convertToCamelCase(user).userId);
});

passport.deserializeUser(function (id: string, done) {
   console.log('Deserializing user with ID:', id);
   pool.query('SELECT * FROM "user" WHERE user_id = $1', [id], (err, result) => {
      if (err) {
         console.error('Error deserializing user:', err);
         return done(err);
      }
      if (result.rows.length === 0) {
         console.error('User not found during deserialization:', id);
         return done(null, false);
      }
      console.log('User deserialized successfully');
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
         console.log('User found:', user.username);
         console.log('User passwordHash exists:', user.passwordHash ? 'Yes' : 'No');
         console.log(
            'PasswordHash length:',
            user.passwordHash ? user.passwordHash.length : 'undefined'
         );

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
         console.log('Login successful for user:', convertToCamelCase(user));
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
         const { passwordhash, ...userWithoutPassword } = user;
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

app.get('/api/profile', ensureAuthenticated, (req: Request, res: Response) => {
   console.log('Profile request received, user:', convertToCamelCase(req.user!));
   if (req.user) {
      const { passwordhash, ...userWithoutPassword } = req.user as any;
      res.status(200).json({ user: userWithoutPassword });
   } else {
      res.status(401).json({ error: 'User not authenticated' });
   }
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

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
   console.log('Auth check - isAuthenticated:', req.isAuthenticated());
   console.log('Auth check - user:', req.user ? 'User exists' : 'No user');

   if (req.isAuthenticated()) {
      return next();
   }
   res.status(401).json({ error: 'Unauthorized - Please log in' });
}
