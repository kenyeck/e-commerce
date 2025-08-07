// Shared types for both frontend and backend

// Define types locally for now
export interface User {
   userId: string;
   username: string;
   email: string;
   firstName?: string;
   lastName?: string;
   phone?: string;
   isActive: boolean;
   isEmailVerified: boolean;
   lastLoginAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface Product {
   productId: string;
   name: string;
   description?: string;
   price: number;
   stockQuantity: number;
   categoryId?: string;
   imageUrl?: string;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
   stripeProductId?: string; // Optional for Stripe integration
   stripePriceId?: string; // Optional for Stripe integration
}

export interface Category {
   categoryId: string;
   name: string;
   description?: string;
   parentCategoryId?: string;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface Cart {
   cartId: string;
   userId?: string; // Optional for guest carts
   sessionId?: string; // For guest sessions
   createdAt: Date;
   updatedAt: Date;
   items?: CartItem[];
}

export interface CartItem {
   cartItemId: string;
   cartId: string;
   productId: string;
   quantity: number;
   addedAt: Date;
   productName: string;
   productDescription?: string;
   unitPrice: number;
   imageUrl: string;
   stripeProductId: string; // Optional for Stripe integration
   stripePriceId: string; // Optional for Stripe integration
}

export interface Order {
   orderId: string;
   userId: string;
   status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
   totalAmount: number;
   shippingAddress?: string;
   billingAddress?: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface OrderItem {
   orderItemId: string;
   orderId: string;
   productId: string;
   quantity: number;
   price: number;
   createdAt: Date;
   updatedAt: Date;
}

export interface CompleteOrder {
   orderId: string;
   userId: string;
   status: string;
   createdAt: Date;
   updatedAt: Date;
   items: Array<{
      orderItemId: string;
      productId: string;
      quantity: number;
      priceAtTime: number;
      productName: string;
   }>;
}

// Request/Response types
export interface LoginRequest {
   username: string;
   password: string;
}

export interface LoginResponse {
   message: string;
   user: Omit<User, 'passwordHash'>;
}

export interface RegisterRequest {
   username: string;
   email: string;
   password: string;
   firstName?: string;
   lastName?: string;
   phone?: string;
}

export interface CreateCheckoutSessionResponse {
   sessionId: string;
   url: string;
}

// API Response wrapper
export interface ApiResponse<T> {
   data?: T;
   error?: string;
   message?: string;
}

// Currently based on Stripe's Checkout Session
export interface CheckoutSession {
   id: string;
   amount_subtotal: number;
   amount_total: number;
   currency: string;
   payment_status: string;
   customer_email?: string;
   metadata?: Record<string, string>;
   line_items?: {
      data: {
         price: {
            id: string;
            product: {
               id: string;
               name: string;
            };
         };
         quantity: number;
      }[];
   };
}
