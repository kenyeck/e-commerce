import express, { Router, Request, Response } from 'express';
import { pool } from '..';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - categoryId
 *         - name
 *       properties:
 *         categoryId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the category
 *         name:
 *           type: string
 *           description: The category name
 *         description:
 *           type: string
 *           description: The category description
 *         parentCategoryId:
 *           type: string
 *           format: uuid
 *           description: The parent category ID for subcategories
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp
 *     CategoryCreate:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The category name
 *         description:
 *           type: string
 *           description: The category description
 *         parentCategoryId:
 *           type: string
 *           format: uuid
 *           description: The parent category ID for subcategories
 *     CategoryUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The category name
 *         description:
 *           type: string
 *           description: The category description
 *         parentCategoryId:
 *           type: string
 *           format: uuid
 *           description: The parent category ID for subcategories
 *         isActive:
 *           type: boolean
 *           description: Whether the category is active
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */

// Get all categories
router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query('SELECT * FROM category');
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
   }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its unique identifier
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the category
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Category not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Get category by ID
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const categoryId = req.params.id;
      let result = await pool.query('SELECT * FROM category WHERE categoryId = $1', [categoryId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Category not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).send('Internal Server Error');
   }
});
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreate'
 *           examples:
 *             category_creation:
 *               summary: Example category creation
 *               value:
 *                 name: "Electronics"
 *                 description: "Electronic devices and accessories"
 *                 parentCategoryId: null
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Create a new category
router.post('/', async (req: Request, res: Response) => {
   try {
      const { name, description } = req.body;
      let result = await pool.query(
         'INSERT INTO category (name, description) VALUES ($1, $2) RETURNING *',
         [name, description]
      );
      res.status(201).send(result.rows[0]);
   } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).send('Internal Server Error');
   }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category by ID
 *     description: Update category information by its unique identifier
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the category
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdate'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Category not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Update category
router.put('/:id', async (req: Request, res: Response) => {
   try {
      const categoryId = req.params.id;
      const { name, description } = req.body;

      let result = await pool.query(
         'UPDATE category SET name = $1, description = $2 WHERE categoryId = $3 RETURNING *',
         [name, description, categoryId]
      );
      if (result.rows.length === 0) {
         return res.status(404).send('Category not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).send('Internal Server Error');
   }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     description: Delete a category from the system by its unique identifier
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the category
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Category not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Delete category
router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const categoryId = req.params.id;
      let result = await pool.query('DELETE FROM category WHERE categoryId = $1 RETURNING *', [
         categoryId
      ]);
      if (result.rows.length === 0) {
         return res.status(404).send('Category not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;
