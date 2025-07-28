import express, { Router, Request, Response } from 'express';
import { pool } from '..';

const router: Router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         orderItemId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the order item
 *         productId:
 *           type: string
 *           format: uuid
 *           description: The product identifier
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity ordered
 *         priceAtTime:
 *           type: number
 *           format: decimal
 *           description: The price when the order was placed
 *         productName:
 *           type: string
 *           description: The product name
 *         currentPrice:
 *           type: number
 *           format: decimal
 *           description: The current product price
 *     Order:
 *       type: object
 *       required:
 *         - orderId
 *         - userId
 *         - status
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the order
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user who placed the order
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           description: The order status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The order creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: The items in the order
 *     OrderCreate:
 *       type: object
 *       required:
 *         - userId
 *         - orderItems
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user placing the order
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           default: pending
 *           description: The initial order status
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: The product identifier
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: The quantity to order
 *               priceAtTime:
 *                 type: number
 *                 format: decimal
 *                 description: Override price (if not provided, current price will be used)
 *           description: The items to include in the order
 *     OrderUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           description: The order status
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The user who owns the order
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of all orders with their items
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Successfully retrieved orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */

// Get all orders
router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query(`
         SELECT 
            o.orderId, 
            o.userId, 
            o.status,
            o.createdAt,
            o.updatedAt,
            COALESCE(
               json_agg(
                  json_build_object(
                     'orderItemId', oi.orderItemId,
                     'productId', oi.productId,
                     'quantity', oi.quantity,
                     'priceAtTime', oi.priceAtTime,
                     'productName', p.name,
                     'currentPrice', p.price
                  )
               ) FILTER (WHERE oi.orderItemId IS NOT NULL), 
               '[]'::json
            ) as items
         FROM "order" o
         LEFT JOIN order_item oi ON o.orderId = oi.orderId
         LEFT JOIN product p ON oi.productId = p.productId
         GROUP BY o.orderId
         ORDER BY o.createdAt DESC
      `);
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its unique identifier with all items
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
   try {
      const orderId = req.params.id;
      let result = await pool.query(
         `
         SELECT 
            o.orderId, 
            o.userId, 
            o.status,
            o.createdAt,
            o.updatedAt,
            COALESCE(
               json_agg(
                  json_build_object(
                     'orderItemId', oi.orderItemId,
                     'productId', oi.productId,
                     'quantity', oi.quantity,
                     'priceAtTime', oi.priceAtTime,
                     'productName', p.name,
                     'currentPrice', p.price
                  )
               ) FILTER (WHERE oi.orderItemId IS NOT NULL), 
               '[]'::json
            ) as items
         FROM "order" o
         LEFT JOIN order_item oi ON o.orderId = oi.orderId
         LEFT JOIN product p ON oi.productId = p.productId
         WHERE o.orderId = $1
         GROUP BY o.orderId
      `,
         [orderId]
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Order not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with items, validating stock and updating inventory
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreate'
 *           examples:
 *             order_creation:
 *               summary: Example order creation
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 status: "pending"
 *                 orderItems:
 *                   - productId: "456e7890-e89b-12d3-a456-426614174001"
 *                     quantity: 2
 *                   - productId: "789e1234-e89b-12d3-a456-426614174002"
 *                     quantity: 1
 *                     priceAtTime: 99.99
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request - invalid input, user not found, or insufficient stock
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalid_input:
 *                   summary: Invalid input
 *                   value: "Invalid request body. userId and orderItems are required."
 *                 user_not_found:
 *                   summary: User not found
 *                   value: "User not found"
 *                 insufficient_stock:
 *                   summary: Insufficient stock
 *                   value: "Insufficient stock for product. Available: 5, Requested: 10"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */

// Create a new order
router.post('/', async (req: Request, res: Response) => {
   try {
      const { userId, status, orderItems } = req.body;
      if (!userId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
         return res.status(400).send('Invalid request body. userId and orderItems are required.');
      }

      // Start transaction
      await pool.query('BEGIN');

      try {
         // Validate user exists
         let userCheck = await pool.query('SELECT userId FROM "user" WHERE userId = $1', [userId]);
         if (userCheck.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).send('User not found');
         }

         // Create the order
         let orderResult = await pool.query(
            'INSERT INTO "order" (userId, status) VALUES ($1, $2) RETURNING *',
            [userId, status || 'pending']
         );
         const newOrder = orderResult.rows[0];

         // Validate products and get current prices
         for (const item of orderItems) {
            if (!item.productId || !item.quantity || item.quantity <= 0) {
               await pool.query('ROLLBACK');
               return res
                  .status(400)
                  .send('Invalid order item. productId and positive quantity required.');
            }

            // Get product info and validate stock
            let productResult = await pool.query(
               'SELECT productId, price, stock FROM product WHERE productId = $1 AND isActive = true',
               [item.productId]
            );

            if (productResult.rows.length === 0) {
               await pool.query('ROLLBACK');
               return res.status(400).send(`Product ${item.productId} not found or inactive`);
            }

            const product = productResult.rows[0];

            // Check stock availability
            if (product.stock < item.quantity) {
               await pool.query('ROLLBACK');
               return res
                  .status(400)
                  .send(
                     `Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.quantity}`
                  );
            }

            // Use provided priceAtTime or current price
            const priceAtTime = item.priceAtTime || product.price;

            // Insert order item
            await pool.query(
               'INSERT INTO order_item (orderId, productId, quantity, priceAtTime) VALUES ($1, $2, $3, $4)',
               [newOrder.orderId, item.productId, item.quantity, priceAtTime]
            );

            // Update product stock
            await pool.query('UPDATE product SET stock = stock - $1 WHERE productId = $2', [
               item.quantity,
               item.productId
            ]);
         }

         // Commit transaction
         await pool.query('COMMIT');

         // Fetch the complete order with items
         let completeOrderResult = await pool.query(
            `
            SELECT 
               o.orderId, 
               o.userId, 
               o.status,
               o.createdAt,
               o.updatedAt,
               COALESCE(
                  json_agg(
                     json_build_object(
                        'orderItemId', oi.orderItemId,
                        'productId', oi.productId,
                        'quantity', oi.quantity,
                        'priceAtTime', oi.priceAtTime,
                        'productName', p.name
                     )
                  ) FILTER (WHERE oi.orderItemId IS NOT NULL), 
                  '[]'::json
               ) as items
            FROM "order" o
            LEFT JOIN order_item oi ON o.orderId = oi.orderId
            LEFT JOIN product p ON oi.productId = p.productId
            WHERE o.orderId = $1
            GROUP BY o.orderId
         `,
            [newOrder.orderId]
         );

         res.status(201).send(completeOrderResult.rows[0]);
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order by ID
 *     description: Update order information by its unique identifier
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderUpdate'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: No fields to update
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No fields to update
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Update order by ID
router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { status, userId } = req.body;
      const orderId = req.params.id;

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (status) {
         updateFields.push(`status = $${paramCount++}`);
         updateValues.push(status);
      }
      if (userId) {
         updateFields.push(`userId = $${paramCount++}`);
         updateValues.push(userId);
      }

      if (updateFields.length === 0) {
         return res.status(400).send('No fields to update');
      }

      updateFields.push(`updatedAt = CURRENT_TIMESTAMP`);
      updateValues.push(orderId);

      let result = await pool.query(
         `UPDATE "order" SET ${updateFields.join(', ')} WHERE orderId = $${paramCount} RETURNING *`,
         updateValues
      );

      if (result.rows.length === 0) {
         return res.status(404).send('Order not found');
      }

      // Fetch complete order with items
      let completeOrderResult = await pool.query(
         `
         SELECT 
            o.orderId, 
            o.userId, 
            o.status,
            o.createdAt,
            o.updatedAt,
            COALESCE(
               json_agg(
                  json_build_object(
                     'orderItemId', oi.orderItemId,
                     'productId', oi.productId,
                     'quantity', oi.quantity,
                     'priceAtTime', oi.priceAtTime,
                     'productName', p.name
                  )
               ) FILTER (WHERE oi.orderItemId IS NOT NULL), 
               '[]'::json
            ) as items
         FROM "order" o
         LEFT JOIN order_item oi ON o.orderId = oi.orderId
         LEFT JOIN product p ON oi.productId = p.productId
         WHERE o.orderId = $1
         GROUP BY o.orderId
      `,
         [orderId]
      );

      res.status(200).send(completeOrderResult.rows[0]);
   } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order by ID
 *     description: Delete an order and restore stock for all items
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order deleted successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Delete order by ID
router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const orderId = req.params.id;

      // Start transaction to handle stock restoration
      await pool.query('BEGIN');

      try {
         // Get order items to restore stock
         let orderItemsResult = await pool.query(
            'SELECT productId, quantity FROM order_item WHERE orderId = $1',
            [orderId]
         );

         // Restore stock for each item
         for (const item of orderItemsResult.rows) {
            await pool.query('UPDATE product SET stock = stock + $1 WHERE productId = $2', [
               item.quantity,
               item.productId
            ]);
         }

         // Delete the order (order_item will be deleted automatically due to CASCADE)
         let result = await pool.query('DELETE FROM "order" WHERE orderId = $1 RETURNING *', [
            orderId
         ]);

         if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).send('Order not found');
         }

         await pool.query('COMMIT');
         res.status(200).send({ message: 'Order deleted successfully', order: result.rows[0] });
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{id}/items:
 *   get:
 *     summary: Get order items
 *     description: Retrieve all items for a specific order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/OrderItem'
 *                   - type: object
 *                     properties:
 *                       currentStock:
 *                         type: integer
 *                         description: Current stock of the product
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Get order items for a specific order
router.get('/:id/items', async (req: Request, res: Response) => {
   try {
      const orderId = req.params.id;
      let result = await pool.query(
         `
         SELECT 
            oi.orderItemId,
            oi.orderId,
            oi.productId,
            oi.quantity,
            oi.priceAtTime,
            p.name as productName,
            p.price as currentPrice,
            p.stock as currentStock
         FROM order_item oi
         JOIN product p ON oi.productId = p.productId
         WHERE oi.orderId = $1
         ORDER BY oi.orderItemId
      `,
         [orderId]
      );

      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching order items:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}:
 *   put:
 *     summary: Update order item
 *     description: Update a specific item in an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The unique identifier of the order item
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: The new quantity for the item
 *               priceAtTime:
 *                 type: number
 *                 format: decimal
 *                 description: Override the price at time of order
 *     responses:
 *       200:
 *         description: Order item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
 *       400:
 *         description: Bad request - invalid quantity or insufficient stock
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalid_quantity:
 *                   summary: Invalid quantity
 *                   value: "Valid quantity is required"
 *                 insufficient_stock:
 *                   summary: Insufficient stock
 *                   value: "Insufficient stock for quantity increase"
 *       404:
 *         description: Order item not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order item not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Update specific order item
router.put('/:orderId/items/:itemId', async (req: Request, res: Response) => {
   try {
      const { orderId, itemId } = req.params;
      const { quantity, priceAtTime } = req.body;

      if (!quantity || quantity <= 0) {
         return res.status(400).send('Valid quantity is required');
      }

      // Start transaction
      await pool.query('BEGIN');

      try {
         // Get current order item
         let currentItemResult = await pool.query(
            'SELECT * FROM order_item WHERE orderItemId = $1 AND orderId = $2',
            [itemId, orderId]
         );

         if (currentItemResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).send('Order item not found');
         }

         const currentItem = currentItemResult.rows[0];
         const quantityDiff = quantity - currentItem.quantity;

         // Check stock if increasing quantity
         if (quantityDiff > 0) {
            let productResult = await pool.query('SELECT stock FROM product WHERE productId = $1', [
               currentItem.productId
            ]);

            if (productResult.rows[0].stock < quantityDiff) {
               await pool.query('ROLLBACK');
               return res.status(400).send('Insufficient stock for quantity increase');
            }
         }

         // Update order item
         const updateFields = ['quantity = $1'];
         const updateValues = [quantity];
         let paramCount = 2;

         if (priceAtTime !== undefined) {
            updateFields.push(`priceAtTime = $${paramCount++}`);
            updateValues.push(priceAtTime);
         }

         updateValues.push(itemId, orderId);

         let result = await pool.query(
            `UPDATE order_item SET ${updateFields.join(', ')} WHERE orderItemId = $${paramCount} AND orderId = $${paramCount + 1} RETURNING *`,
            updateValues
         );

         // Update product stock
         await pool.query('UPDATE product SET stock = stock - $1 WHERE productId = $2', [
            quantityDiff,
            currentItem.productId
         ]);

         await pool.query('COMMIT');
         res.status(200).send(result.rows[0]);
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error updating order item:', error);
      res.status(500).send('Internal Server Error');
   }
});

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}:
 *   delete:
 *     summary: Delete order item
 *     description: Remove a specific item from an order and restore stock
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: The unique identifier of the order
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The unique identifier of the order item
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order item deleted successfully
 *                 item:
 *                   $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Order item not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order item not found
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
// Delete specific order item
router.delete('/:orderId/items/:itemId', async (req: Request, res: Response) => {
   try {
      const { orderId, itemId } = req.params;

      // Start transaction
      await pool.query('BEGIN');

      try {
         // Get order item to restore stock
         let itemResult = await pool.query(
            'SELECT * FROM order_item WHERE orderItemId = $1 AND orderId = $2',
            [itemId, orderId]
         );

         if (itemResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).send('Order item not found');
         }

         const item = itemResult.rows[0];

         // Restore stock
         await pool.query('UPDATE product SET stock = stock + $1 WHERE productId = $2', [
            item.quantity,
            item.productId
         ]);

         // Delete order item
         let result = await pool.query(
            'DELETE FROM order_item WHERE orderItemId = $1 AND orderId = $2 RETURNING *',
            [itemId, orderId]
         );

         await pool.query('COMMIT');
         res.status(200).send({ message: 'Order item deleted successfully', item: result.rows[0] });
      } catch (error) {
         await pool.query('ROLLBACK');
         throw error;
      }
   } catch (error) {
      console.error('Error deleting order item:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;
