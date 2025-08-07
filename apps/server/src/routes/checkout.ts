import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { pool } from '..';
import { log } from 'console';

const router: Router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
   apiVersion: '2025-07-30.basil'
});

router.post('/', async (req: Request, res: Response) => {
   try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
         return res.status(400).json({ error: 'No items to checkout' });
      }
      const session = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: items.map((item: any) => ({
            price: item.stripePriceId,
            quantity: item.quantity || 1
         })),
         mode: 'payment',
         success_url: `${req.headers.origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `${req.headers.origin}/cart`,
      });
      return res.status(200).json({ sessionId: session.id, url: session.url });
   } catch (error) {
      return res
         .status(500)
         .json({ error: error instanceof Error ? error.message : 'Stripe error' });
   }
});

router.get('/sessions/:id', async (req, res) => {
   const { id } = req.params;
   try {
      const response = await stripe.checkout.sessions.retrieve(id, {
      expand: [
        'line_items', 
        'line_items.data.price.product', 
        'customer',
        'payment_intent',
        'subscription'
      ]
    });
      return res.status(200).json(response);
   } catch (error) {
      return res
         .status(500)
         .json({ error: error instanceof Error ? error.message : 'Stripe error' });
   }
});

router.post('/create-payment-intent', async (req, res) => {
   try {
      const { items } = req.body; // Total in cents (e.g., 2500 for $25.00)
      const total = items.reduce(
         (sum: number, item: any) => sum + item.unitPrice * item.quantity,
         0
      );
      if (total <= 0) {
         return res.status(400).json({ error: 'Total amount must be greater than zero' });
      }
      log('Creating payment intent for total:', total * 100);
      const paymentIntent = await stripe.paymentIntents.create({
         amount: (total * 100) as number, // Total in cents
         currency: 'usd',
         automatic_payment_methods: { enabled: true }
      });

      res.send({ clientSecret: paymentIntent.client_secret });
   } catch (error) {
      res.status(500).json({
         error: error instanceof Error ? error.message : 'Failed to create payment intent'
      });
   }
});

export const checkout: Router = router;
