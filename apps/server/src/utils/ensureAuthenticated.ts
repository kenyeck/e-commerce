import { Request, Response, NextFunction } from 'express';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
   //console.log('Auth check - isAuthenticated:', req.isAuthenticated());
   //console.log('Auth check - user:', req.user ? 'User exists' : 'No user');

   if (req.isAuthenticated()) {
      return next();
   }
   res.status(401).json({ error: 'Unauthorized - Please log in' });
}
