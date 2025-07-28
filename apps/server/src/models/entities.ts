interface Cart {
   cartId: string;
   userId: string;
   status: string;
   createdAt: Date;
   updatedAt: Date;
}

interface CartItem {
   cartItemId: string;
   cartId: string;
   productId: string;
   quantity: number;
   addedAt: Date;
}

interface Order {
   orderId: string;
   userId: string;
   status: string;
   createdAt: Date;
   updatedAt: Date;
}

interface OrderItem {
   orderItemId: string;
   orderId: string;
   productId: string;
   quantity: number;
   priceAtTime: number; // Store price when order was placed
}

interface User {
   userId: string;
   username: string;
   email: string;
   passwordHash: string;
   createdAt: Date;
   updatedAt: Date;
}

interface Product {
   productId: string;
   name: string;
   description: string;
   price: number;
   stock: number;
   categoryId: string;
}

interface Category {
   categoryId: string;
   name: string;
   description: string;
}

interface Address {
   addressId: string;
   userId: string;
   street: string;
   city: string;
   state: string;
   zipCode: string;
   country: string;
}

// interface Payment {
//    paymentId: string;
//    userId: string;
//    orderId: string;
//    amount: number;
//    paymentMethod: string;
//    status: string;
//    createdAt: Date;
// }