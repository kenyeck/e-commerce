import express, { Router, Request, Response } from 'express';
import { pool } from '..';
import { convertToCamelCase } from '../utils/convertToCamelCase';
import { Product } from '@e-commerce/types';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - productId
 *         - name
 *         - price
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the product
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: The product price
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: The available stock quantity
 *         categoryId:
 *           type: string
 *           format: uuid
 *           description: The category this product belongs to
 *         sku:
 *           type: string
 *           description: The product SKU (Stock Keeping Unit)
 *         weight:
 *           type: number
 *           format: decimal
 *           description: The product weight
 *         dimensions:
 *           type: object
 *           description: The product dimensions
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp
 *         categoryName:
 *           type: string
 *           description: The category name (when joined)
 *     ProductCreate:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: The product price
 *         stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: The initial stock quantity
 *         categoryId:
 *           type: string
 *           format: uuid
 *           description: The category this product belongs to
 *         sku:
 *           type: string
 *           description: The product SKU (Stock Keeping Unit)
 *         weight:
 *           type: number
 *           format: decimal
 *           description: The product weight
 *         dimensions:
 *           type: object
 *           description: The product dimensions
 *           properties:
 *             length:
 *               type: number
 *             width:
 *               type: number
 *             height:
 *               type: number
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: The product price
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: The stock quantity
 *         categoryId:
 *           type: string
 *           format: uuid
 *           description: The category this product belongs to
 *         sku:
 *           type: string
 *           description: The product SKU (Stock Keeping Unit)
 *         weight:
 *           type: number
 *           format: decimal
 *           description: The product weight
 *         dimensions:
 *           type: object
 *           description: The product dimensions
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of products with optional filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID (alternative parameter name)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: decimal
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Limit the number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */

// Get all products (by category if provided)
router.get('/', async (req: Request, res: Response) => {
   try {
      let categoryId = req.query.category;
      let result = await pool.query<Product>(
         `SELECT * FROM product ${categoryId ? 'WHERE categoryId = $1' : ''}`,
         categoryId ? [categoryId] : []
      );
      res.status(200).send(convertToCamelCase(result.rows));
   } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the product
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const productId = req.params.id;
      let result = await pool.query<Product>('SELECT * FROM product WHERE productId = $1', [productId]);
      if (!result.rows[0]) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product in the system
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *           examples:
 *             product_creation:
 *               summary: Example product creation
 *               value:
 *                 name: "Wireless Headphones"
 *                 description: "High-quality wireless headphones with noise cancellation"
 *                 price: 299.99
 *                 stock: 50
 *                 categoryId: "123e4567-e89b-12d3-a456-426614174000"
 *                 sku: "WH-001"
 *                 weight: 0.25
 *                 dimensions:
 *                   length: 20
 *                   width: 18
 *                   height: 8
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - invalid input or SKU already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalid_input:
 *                   summary: Invalid input
 *                   value: "Invalid input: name and positive price are required, stock cannot be negative"
 *                 sku_exists:
 *                   summary: SKU already exists
 *                   value: "SKU already exists"
 *                 category_not_found:
 *                   summary: Category not found
 *                   value: "Category not found or inactive"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Create a new product
router.post('/', async (req: Request, res: Response) => {
   try {
      const { name, description, price, stock, categoryId } = req.body;
      let result = await pool.query<Product>(
         'INSERT INTO product (name, description, price, stock, categoryId) VALUES ($1, $2, $3, $4, $5) RETURNING *',
         [name, description, price, stock, categoryId]
      );
      res.status(201).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product by ID
 *     description: Update product information by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the product
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Update product
router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { name, description, price, stock, categoryId } = req.body;
      const productId = req.params.id;

      let result = await pool.query<Product>(
         'UPDATE product SET name = $1, description = $2, price = $3, stock = $4, categoryId = $5 WHERE productId = $6 RETURNING *',
         [name, description, price, stock, categoryId, productId]
      );
      if (!result.rows[0]) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     description: Delete a product from the system by its unique identifier
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the product
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const productId = req.params.id;
      let result = await pool.query<Product>('DELETE FROM "product" WHERE productId = $1 RETURNING *', [
         productId
      ]);
      if (!result.rows[0]) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;
