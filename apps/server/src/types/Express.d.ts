import { Express } from 'express';

declare module 'express' {
   namespace Express {
      interface User {
         userid?: string;
         username?: string;
         firstname?: string;
         lastname?: string;
         email?: string;
      }
   }
}
