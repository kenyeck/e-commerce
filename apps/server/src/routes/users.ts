import express, { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "..";

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - username
 *         - email
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the user
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         passwordHash:
 *           type: string
 *           description: The hashed password (not returned in responses)
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: The last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp
 *     UserRegistration:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: The desired username
 *         password:
 *           type: string
 *           description: The user's password
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phone:
 *           type: string
 *           description: The user's phone number
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users in the system
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query(`
         SELECT 
            userId, username, email, firstName, lastName, phone, 
            isActive, isEmailVerified, lastLoginAt, createdAt, updatedAt
         FROM "user" 
         ORDER BY createdAt DESC
      `);
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their unique identifier
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const userId = req.params.id;
      let result = await pool.query(`
         SELECT 
            userId, username, email, firstName, lastName, phone, 
            isActive, isEmailVerified, lastLoginAt, createdAt, updatedAt
         FROM "user" 
         WHERE userId = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
         return res.status(404).send('User not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update user information by their unique identifier
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { username, email, firstName, lastName, phone, isActive } = req.body;
      const userId = req.params.id;

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (username) {
         updateFields.push(`username = $${paramCount++}`);
         updateValues.push(username);
      }
      if (email) {
         updateFields.push(`email = $${paramCount++}`);
         updateValues.push(email);
      }
      if (firstName) {
         updateFields.push(`firstName = $${paramCount++}`);
         updateValues.push(firstName);
      }
      if (lastName) {
         updateFields.push(`lastName = $${paramCount++}`);
         updateValues.push(lastName);
      }
      if (phone) {
         updateFields.push(`phone = $${paramCount++}`);
         updateValues.push(phone);
      }
      if (isActive !== undefined) {
         updateFields.push(`isActive = $${paramCount++}`);
         updateValues.push(isActive);
      }

      if (updateFields.length === 0) {
         return res.status(400).send('No fields to update');
      }

      updateFields.push(`updatedAt = CURRENT_TIMESTAMP`);
      updateValues.push(userId);

      let result = await pool.query(
         `UPDATE "user" SET ${updateFields.join(', ')} WHERE userId = $${paramCount} RETURNING *`,
         updateValues
      );

      if (result.rows.length === 0) {
         return res.status(404).send('User not found');
      }

      // Remove password hash from response
      const user = result.rows[0];
      delete user.passwordHash;
      
      res.status(200).send(user);
   } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === '23505') { // Unique constraint violation
         res.status(400).send('Username or email already exists');
      } else {
         res.status(500).send('Internal Server Error');
      }
   }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a user from the system by their unique identifier
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the user
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with username, email, and password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             user_registration:
 *               summary: Example user registration
 *               value:
 *                 username: "johndoe"
 *                 email: "john.doe@example.com"
 *                 password: "securepassword123"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 phone: "+1234567890"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - missing required fields or user already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 missing_fields:
 *                   summary: Missing required fields
 *                   value: "username, password, and email are required"
 *                 user_exists:
 *                   summary: User already exists
 *                   value: "User already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.post('/register', async (req: Request, res: Response) => {
   try {
      const { username, password, email, firstName, lastName, phone } = req.body;
      
      if (!username || !password || !email) {
         return res.status(400).send('username, password, and email are required');
      }

      // Check if user already exists by username or email
      let existingUser = await pool.query(
         'SELECT userId FROM "user" WHERE username = $1 OR email = $2', 
         [username, email]
      );
      
      if (existingUser.rows.length > 0) {
         return res.status(400).send('User with this username or email already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let result = await pool.query(
         `INSERT INTO "user" (username, passwordHash, email, firstName, lastName, phone) 
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
         [username, hashedPassword, email, firstName, lastName, phone]
      );

      // Remove password hash from response
      const user = result.rows[0];
      delete user.passwordHash;

      res.status(201).send(user);
   } catch (error: any) {
      console.error('Error registering user:', error);
      if (error.code === '23505') { // Unique constraint violation
         res.status(400).send('Username or email already exists');
      } else {
         res.status(500).send('Internal Server Error');
      }
   }
});

export default router;