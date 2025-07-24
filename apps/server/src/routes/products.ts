import express, { Router, Request, Response } from "express";
import { pool } from "..";

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response) => {
   try {
      let result = await pool.query('SELECT * FROM product');
      res.status(200).send(result.rows);
   } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.get('/:id', async (req: Request, res: Response) => {
   try {
      const productId = req.params.id;
      let result = await pool.query('SELECT * FROM product WHERE productId = $1', [productId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.put('/:id', async (req: Request, res: Response) => {
   try {
      const { status, userId } = req.body;
      const productId = req.params.id;

      let result = await pool.query('UPDATE product SET status = $1, userId = $2 WHERE productId = $3 RETURNING *',
         [status, userId, productId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Internal Server Error');
   }
});

router.delete('/:id', async (req: Request, res: Response) => {
   try {
      const productId = req.params.id;
      let result = await pool.query('DELETE FROM "product" WHERE productId = $1 RETURNING *', [productId]);
      if (result.rows.length === 0) {
         return res.status(404).send('Product not found');
      }
      res.status(200).send(result.rows[0]);
   } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal Server Error');
   }
});

export default router;