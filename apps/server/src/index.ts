import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';
import users from './routes/users';

import dotenv from 'dotenv';
import products from './routes/products';
import orders from './routes/orders';
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
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN!, credentials: true }));
app.use(
   session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false
   })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user: Express.User, done) {
  done(null, user.userid);
});

passport.deserializeUser(function(id, done) {
  pool.query('SELECT * FROM "user" WHERE userId = $1', [id], (err, result) => {
    if (err) {
      return done(err);
    }
    done(null, result.rows[0]);
  });
});

passport.use(
   new LocalStrategy(async (username, password, done) => {
      try {
         const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
         if (result.rows.length === 0) {
            return done(null, false, { message: 'Incorrect username.' });
         }
         const user = result.rows[0];
         const isMatch = await bcrypt.compare(password, user.password);
         if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
         }
         return done(null, user);
      } catch (error) {
         return done(error);
      }
   })
);

app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/orders', orders);

app.post('/login', passport.authenticate('local'), (req: Request, res: Response) => {
   res.status(200).send({ user: { ...req.user, password: undefined } });
});

app.post('/logout', (req: Request, res: Response) => {
   req.logout((err) => {
      if (err) {
         return res.status(500).send('Logout failed');
      }
      res.status(200).send('Logged out successfully');
   });
});

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.status(200).send({ user: req.user });
});

app.get('/api/health', (req, res) => {
   res.status(200).send('OK');
});

const port = 3001;
app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});

export default app;


function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) { return next(); }
  res.status(401).send('Unauthorized');
}
