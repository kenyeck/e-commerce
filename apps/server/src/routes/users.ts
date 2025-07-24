import express, { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "..";

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query('SELECT * FROM "user"');
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.get('/:id', async (req: Request, res: Response) => {
   try {
      const userId = req.params.id;
      let result = await pool.query('SELECT * FROM "user" WHERE userId = $1', [userId]);
      if (result.rows.length === 0) {
         return res.status(404).send('User not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { username, email, firstname, lastname } = req.body;
      const userId = req.params.id;

      let result = await pool.query('UPDATE "user" SET username = $1, email = $2, firstname = $3, lastname = $4 WHERE userId = $5 RETURNING *',
         [username, email, firstname, lastname, userId]);
      if (result.rows.length === 0) {
         return res.status(404).send('User not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const userId = req.params.id;
      let result = await pool.query('DELETE FROM "user" WHERE userId = $1 RETURNING *', [userId]);
      if (result.rows.length === 0) {
         return res.status(404).send('User not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.post('/register', async (req, res) => {
   try {
      const { username, password } = req.body;
      if (!username || !password) {
         return res.status(400).send('username and password are required');
      }
      let result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
      if (result.rows.length > 0) {
         return res.status(400).send('User already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      result = await pool.query(
         'INSERT INTO "user" (username, password) VALUES ($1, $2) RETURNING *',
         [username, hashedPassword]
      );

      res.status(201).send('User registered');
   } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;