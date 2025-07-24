import express, { Router, Request, Response } from "express";
import { pool } from "..";

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query('SELECT * FROM "order"');
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.get('/:id', async (req: Request, res: Response) => {
   try {
      const orderId = req.params.id;
      let result = await pool.query('SELECT * FROM "order" WHERE orderId = $1', [orderId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Order not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { status, userId } = req.body;
      const orderId = req.params.id;

      let result = await pool.query('UPDATE "order" SET status = $1, userId = $2 WHERE orderId = $3 RETURNING *',
         [status, userId, orderId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Order not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const orderId = req.params.id;
      let result = await pool.query('DELETE FROM "order" WHERE orderId = $1 RETURNING *', [orderId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Order not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;