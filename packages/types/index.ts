// Shared types for both frontend and backend

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
   userId: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface CartItem {
   cartItemId: string;
   cartId: string;
   productId: string;
   quantity: number;
   price: number;
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

// API Response wrapper
export interface ApiResponse<T> {
   data?: T;
   error?: string;
   message?: string;
}
