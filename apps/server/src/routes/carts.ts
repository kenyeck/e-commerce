import express, { Router, Request, Response } from 'express';
import { pool } from '..';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         cartItemId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the cart item
 *         productId:
 *           type: string
 *           format: uuid
 *           description: The product identifier
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity in cart
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was added to cart
 *         productName:
 *           type: string
 *           description: The product name
 *         productPrice:
 *           type: number
 *           format: decimal
 *           description: The current product price
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - userId
 *       properties:
 *         cartId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the cart
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user who owns the cart
 *         status:
 *           type: string
 *           enum: [active, checkout, abandoned]
 *           default: active
 *           description: The cart status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The cart creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *           description: The items in the cart
 *     CartUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, checkout, abandoned]
 *           description: The cart status
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user who owns the cart
 *         productId:
 *           type: string
 *           format: uuid
 *           description: Product to add/update in cart
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product
 *     CartItemAdd:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           description: The product to add
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity to add
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Get all carts
 *     description: Retrieve a list of all carts with their items
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: Successfully retrieved carts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
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
            c.cartId, 
            c.userId, 
            c.status,
            c.createdAt,
            c.updatedAt,
            COALESCE(
               json_agg(
                  json_build_object(
                     'cartItemId', ci.cartItemId,
                     'productId', ci.productId,
                     'quantity', ci.quantity,
                     'addedAt', ci.addedAt,
                     'productName', p.name,
                     'productPrice', p.price
                  )
               ) FILTER (WHERE ci.cartItemId IS NOT NULL), 
               '[]'::json
            ) as items
         FROM cart c
         LEFT JOIN cart_item ci ON c.cartId = ci.cartId
         LEFT JOIN product p ON ci.productId = p.productId
         GROUP BY c.cartId
         ORDER BY c.createdAt DESC
      `);
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching carts:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: Get cart by ID
 *     description: Retrieve a specific cart by its unique identifier with all items
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the cart
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cart found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Cart not found
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
      const cartId = req.params.id;
      let result = await pool.query(
         `
         SELECT 
            c.cartId, 
            c.userId, 
            c.status,
            c.createdAt,
            c.updatedAt,
            COALESCE(
               json_agg(
                  json_build_object(
                     'cartItemId', ci.cartItemId,
                     'productId', ci.productId,
                     'quantity', ci.quantity,
                     'addedAt', ci.addedAt,
                     'productName', p.name,
                     'productPrice', p.price
                  )
               ) FILTER (WHERE ci.cartItemId IS NOT NULL), 
               '[]'::json
            ) as items
         FROM cart c
         LEFT JOIN cart_item ci ON c.cartId = ci.cartId
         LEFT JOIN product p ON ci.productId = p.productId
         WHERE c.cartId = $1
         GROUP BY c.cartId
      `,
         [cartId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Cart not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: Create a new cart
 *     description: Create a new shopping cart for a user
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The user who owns the cart
 *     responses:
 *       201:
 *         description: Cart created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - missing userId
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: userId is required
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Create cart
router.post('/', async (req: Request, res: Response) => {
   try {
      const { userId } = req.body;
      if (!userId) {
         return res.status(400).send('userId is required');
      }

      let result = await pool.query(
         'INSERT INTO cart (userId, status) VALUES ($1, $2) RETURNING *',
         [userId, 'active']
      );

      res.status(201).send(result.rows[0]);
   } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/carts/{id}:
 *   put:
 *     summary: Update cart
 *     description: Update cart status or add/update items in the cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the cart
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdate'
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request - insufficient stock
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Insufficient stock
 *       404:
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Cart not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */

// Update cart
router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { status, productId, quantity } = req.body;
      const cartId = req.params.id;

      // Start transaction
      await pool.query('BEGIN');

      try {
         // Validate that cart exists
         if (cartId) {
            let cartResult = await pool.query('SELECT * FROM cart WHERE cartId = $1', [cartId]);
            if (cartResult.rows.length === 0) {
               await pool.query('ROLLBACK');
               return res.status(404).send('Cart not found');
            }
         }

         // ValidateProductAndStock();

         // If productId and quantity are provided, add/update item in cart
         if (productId && quantity) {
            // Validate product and stock
            let productResult = await pool.query(
               'SELECT stock, price FROM product WHERE productId = $1',
               [productId]
            );
            if (productResult.rows.length === 0) {
               await pool.query('ROLLBACK');
               return res.status(400).send('Product not found');
            }

            const { stock } = productResult.rows[0];
            if (stock < quantity) {
               await pool.query('ROLLBACK');
               return res.status(400).send('Insufficient stock');
            }

            // Check if item already exists in cart
            let existingItem = await pool.query(
               'SELECT * FROM cart_item WHERE cartId = $1 AND productId = $2',
               [cartId, productId]
            );

            if (existingItem.rows.length > 0) {
               // Update existing item
               await pool.query(
                  'UPDATE cart_items SET quantity = $1 WHERE cartId = $2 AND productId = $3',
                  [quantity, cartId, productId]
               );
            } else {
               // Add new item
               await pool.query(
                  'INSERT INTO cart_item (cartId, productId, quantity) VALUES ($1, $2, $3)',
                  [cartId, productId, quantity]
               );
            }
         }

         // Update cart status provided
         if (status) {
            await pool.query(
               `UPDATE cart SET status = $1, updatedAt = CURRENT_TIMESTAMP WHERE cartId = $2`,
               [status, cartId]
            );
         }

         // Commit transaction
         await pool.query('COMMIT');

         // Fetch updated cart with items
         let result = await pool.query(
            `
            SELECT 
               c.cartId, 
               c.userId, 
               c.status,
               c.createdAt,
               c.updatedAt,
               COALESCE(
                  json_agg(
                     json_build_object(
                        'cartItemId', ci.cartItemId,
                        'productId', ci.productId,
                        'quantity', ci.quantity,
                        'addedAt', ci.addedAt,
                        'productName', p.name,
                        'productPrice', p.price
                     )
                  ) FILTER (WHERE ci.cartItemId IS NOT NULL), 
                  '[]'::json
               ) as items
            FROM cart c
            LEFT JOIN cart_item ci ON c.cartId = ci.cartId
            LEFT JOIN product p ON ci.productId = p.productId
            WHERE c.cartId = $1
            GROUP BY c.cartId
         `,
            [cartId]
         );

         res.status(200).send(result.rows[0]);
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Delete cart
router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const cartId = req.params.id;
      let result = await pool.query('DELETE FROM cart WHERE cartId = $1 RETURNING *', [cartId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Cart not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error deleting cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Remove specific item from cart
router.delete('/:cartId/items/:itemId', async (req: Request, res: Response) => {
   try {
      const { cartId, itemId } = req.params;

      let result = await pool.query(
         'DELETE FROM cart_item WHERE cartId = $1 AND cartItemId = $2 RETURNING *',
         [cartId, itemId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Cart item not found');
      }

      res.status(200).send({ message: 'Item removed from cart', item: result.rows[0] });
   } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Add item to cart (alternative to PUT for better REST semantics)
router.post('/:id/items', async (req: Request, res: Response) => {
   try {
      const { productId, quantity } = req.body;
      const cartId = req.params.id;

      // Validate product and stock
      let productResult = await pool.query(
         'SELECT stock, price FROM product WHERE productId = $1',
         [productId]
      );
      if (productResult.rows.length === 0) {
         return res.status(400).send('Product not found');
      }

      const { stock } = productResult.rows[0];
      if (stock < quantity) {
         return res.status(400).send('Insufficient stock');
      }

      // Check if item already exists in cart
      let existingItem = await pool.query(
         'SELECT * FROM cart_item WHERE cartId = $1 AND productId = $2',
         [cartId, productId]
      );

      let result;
      if (existingItem.rows.length > 0) {
         // Update existing item
         result = await pool.query(
            'UPDATE cart_item SET quantity = quantity + $1 WHERE cartId = $2 AND productId = $3 RETURNING *',
            [quantity, cartId, productId]
         );
      } else {
         // Add new item
         result = await pool.query(
            'INSERT INTO cart_item (cartId, productId, quantity) VALUES ($1, $2, $3) RETURNING *',
            [cartId, productId, quantity]
         );
      }

      res.status(201).send(result.rows[0]);
   } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;
