import express, { Router, Request, Response } from 'express';
import { pool } from '..';
import { convertToCamelCase } from '../utils/convertToCamelCase';

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
            c.cart_id, 
            c.user_id, 
            c.session_id,
            c.status,
            c.created_at,
            c.updated_at,
            COALESCE(
               json_agg(
                  json_build_object(
                     'cartItemId', ci.cart_item_id,
                     'productId', ci.product_id,
                     'quantity', ci.quantity,
                     'addedAt', ci.added_at,
                     'productName', p.name,
                     'unitPrice', p.price,
                     'imageUrl', p.image_url
                  )
               ) FILTER (WHERE ci.cart_item_id IS NOT NULL), 
               '[]'::json
            ) as items
         FROM cart c
         LEFT JOIN cart_item ci ON c.cart_id = ci.cart_id
         LEFT JOIN product p ON ci.product_id = p.product_id
         GROUP BY c.cart_id
         ORDER BY c.created_at DESC
      `);
      res.status(200).send(convertToCamelCase(result.rows));
   } catch (error) {
      console.error('Error fetching carts:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Get cart by ID with items
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const cartId = req.params.id;
      let result = await pool.query(
         `
         SELECT
            c.cart_id, 
            c.user_id, 
            c.session_id,
            c.status,
            c.created_at,
            c.updated_at,
            COALESCE(
               json_agg(
                  json_build_object(
                     'cartItemId', ci.cart_item_id,
                     'productId', ci.product_id,
                     'quantity', ci.quantity,
                     'addedAt', ci.added_at,
                     'productName', p.name,
                     'unitPrice', p.price,
                     'imageUrl', p.image_url
                  )
               ) FILTER (WHERE ci.cart_item_id IS NOT NULL), 
               '[]'::json
            ) as items
         FROM cart c
         LEFT JOIN cart_item ci ON c.cart_id = ci.cart_id
         LEFT JOIN product p ON ci.product_id = p.product_id
         WHERE c.cart_id = $1
         GROUP BY c.cart_id
      `,
         [cartId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Cart not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error fetching cart:', error);
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

router.get('/user/:id', async (req: Request, res: Response) => {
   try {
      const userId = req.params.id;
      let result = await pool.query(
         `
         SELECT
            c.cart_id, 
            c.user_id, 
            c.session_id,
            c.status,
            c.created_at,
            c.updated_at,
            COALESCE(
               json_agg(
                  json_build_object(
                     'cartItemId', ci.cart_item_id,
                     'productId', ci.product_id,
                     'quantity', ci.quantity,
                     'addedAt', ci.added_at,
                     'productName', p.name,
                     'unitPrice', p.price,
                     'imageUrl', p.image_url
                  )
               ) FILTER (WHERE ci.cart_item_id IS NOT NULL), 
               '[]'::json
            ) as items
         FROM cart c
         LEFT JOIN cart_item ci ON c.cart_id = ci.cart_id
         LEFT JOIN product p ON ci.product_id = p.product_id
         WHERE c.user_id = $1
         GROUP BY c.cart_id
      `,
         [userId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Cart not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
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
      const { userId, sessionId } = req.body;
      if (!userId && !sessionId) {
         return res.status(400).send('userId or sessionId is required');
      }

      let result = await pool.query(
         'INSERT INTO cart (user_id, session_id, status) VALUES ($1, $2, $3) RETURNING *',
         [userId, sessionId, 'active']
      );

      res.status(201).send(convertToCamelCase(result.rows[0]));
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
            let cartResult = await pool.query('SELECT * FROM cart WHERE cart_id = $1', [cartId]);
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
                  'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
                  [quantity, cartId, productId]
               );
            } else {
               // Add new item
               await pool.query(
                  'INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
                  [cartId, productId, quantity]
               );
            }
         }

         // Update cart status provided
         if (status) {
            await pool.query(
               `UPDATE cart SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2`,
               [status, cartId]
            );
         }

         // Commit transaction
         await pool.query('COMMIT');

         // Fetch updated cart with items
         let result = await pool.query(
            `
            SELECT 
               c.cart_id,
               c.user_id, 
               c.status,
               c.created_at,
               c.updated_at,
               COALESCE(
                  json_agg(
                     json_build_object(
                        'cartItemId', ci.cart_item_id,
                        'productId', ci.product_id,
                        'quantity', ci.quantity,
                        'addedAt', ci.added_at,
                        'productName', p.name,
                        'productPrice', p.price
                     )
                  ) FILTER (WHERE ci.cart_item_id IS NOT NULL), 
                  '[]'::json
               ) as items
            FROM cart c
            LEFT JOIN cart_item ci ON c.cart_id = ci.cart_id
            LEFT JOIN product p ON ci.product_id = p.product_id
            WHERE c.cart_id = $1
            GROUP BY c.cart_id
         `,
            [cartId]
         );

         res.status(200).send(convertToCamelCase(result.rows[0]));
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Merge guest cart with user cart
router.post('/merge/:userId', async (req: Request, res: Response) => {
   try {
      const userId = req.params.userId;
      const { guestCartId } = req.body;

      if (!guestCartId) {
         return res.status(400).send('guestCartId is required');
      }

      // Find guest cart
      let guestCartResult = await pool.query(
         'SELECT * FROM cart WHERE cart_id = $1 AND user_id IS NULL',
         [guestCartId]
      );

      if (guestCartResult.rows.length === 0) {
         return res.status(404).send('Guest cart not found');
      }

      const guestCart = guestCartResult.rows[0];

      // Check if user already has a cart
      let userCartResult = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);

      let userCart;
      if (userCartResult.rows.length > 0) {
         userCart = userCartResult.rows[0];
      } else {
         // Create new cart for user if it doesn't exist
         let newCartResult = await pool.query(
            'INSERT INTO cart (user_id, status) VALUES ($1, $2) RETURNING *',
            [userId, 'active']
         );
         userCart = newCartResult.rows[0];
      }

      console.log(`Merging guest cart ${JSON.stringify(guestCart)}`);
      console.log(`...into user cart ${JSON.stringify(userCart)}`);

      // Move items from guest cart to user's cart
      await pool.query('UPDATE cart_item SET cart_id = $1 WHERE cart_id = $2', [
         userCart.cart_id,
         guestCart.cart_id
      ]);

      // Delete the guest cart
      await pool.query('DELETE FROM cart WHERE cart_id = $1', [guestCart.cart_id]);

      res.status(200).send(convertToCamelCase(userCart));
   } catch (error) {
      console.error('Error merging carts:', error);
      res.status(500).send('Internal Server Error');
   }
});

// Delete cart
router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const cartId = req.params.id;
      let result = await pool.query('DELETE FROM cart WHERE cart_id = $1 RETURNING *', [cartId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Cart not found');
      }
      res.status(200).send(convertToCamelCase(result.rows[0]));
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
         'DELETE FROM cart_item WHERE cart_id = $1 AND cart_item_id = $2 RETURNING *',
         [cartId, itemId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Cart item not found');
      }

      res.status(200).send({
         message: 'Item removed from cart',
         item: convertToCamelCase(result.rows[0])
      });
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
         'SELECT stock, price FROM product WHERE product_id = $1',
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
         'SELECT * FROM cart_item WHERE cart_id = $1 AND product_id = $2',
         [cartId, productId]
      );

      let result;
      if (existingItem.rows.length > 0) {
         // Update existing item
         result = await pool.query(
            'UPDATE cart_item SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
            [quantity, cartId, productId]
         );
      } else {
         // Add new item
         result = await pool.query(
            'INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [cartId, productId, quantity]
         );
      }

      res.status(201).send(convertToCamelCase(result.rows[0]));
   } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;
