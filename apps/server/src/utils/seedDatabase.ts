import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config({
   path: `./.env.${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : 'development'}`
});

// Database connection
const pool = new Pool({
   user: process.env.POSTGRES_USER,
   host: process.env.POSTGRES_HOST,
   database: process.env.POSTGRES_DB,
   password: process.env.POSTGRES_PASSWORD,
   port: Number(process.env.POSTGRES_PORT)
});

export async function seedDatabase() {
   const client = await pool.connect();

   try {
      await client.query('BEGIN');

      console.log('🌱 Starting database seeding...');

      // Clear existing data in reverse order of dependencies
      await clearExistingData(client);

      // Seed data in order of dependencies
      const userIds = await seedUsers(client);
      const categoryIds = await seedCategories(client);
      const productIds = await seedProducts(client, categoryIds);
      //const cartIds = await seedCarts(client, userIds);
      //await seedCartItems(client, cartIds, productIds);
      const orderIds = await seedOrders(client, userIds);
      await seedOrderItems(client, orderIds, productIds);

      await client.query('COMMIT');
      console.log('✅ Database seeding completed successfully!');
   } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error seeding database:', error);
      throw error;
   } finally {
      client.release();
   }
}

async function clearExistingData(client: any) {
   console.log('🧹 Clearing existing data...');

   // Delete in reverse order of dependencies
   await client.query('DELETE FROM order_item');
   await client.query('DELETE FROM "order"');
   await client.query('DELETE FROM cart_item');
   await client.query('DELETE FROM cart');
   await client.query('DELETE FROM product');
   await client.query('DELETE FROM category');
   await client.query('DELETE FROM "user"');

   console.log('✅ Existing data cleared');
}

async function seedUsers(client: any): Promise<string[]> {
   console.log('👥 Seeding users...');

   const saltRounds = 10;
   const users = [
      {
         username: 'admin',
         email: 'admin@example.com',
         password: 'admin123',
         firstName: 'Admin',
         lastName: 'User',
         phone: '+1234567890'
      },
      {
         username: 'johndoe',
         email: 'john.doe@example.com',
         password: 'password123',
         firstName: 'John',
         lastName: 'Doe',
         phone: '+1234567891'
      },
      {
         username: 'janesmth',
         email: 'jane.smith@example.com',
         password: 'password123',
         firstName: 'Jane',
         lastName: 'Smith',
         phone: '+1234567892'
      },
      {
         username: 'bobwilson',
         email: 'bob.wilson@example.com',
         password: 'password123',
         firstName: 'Bob',
         lastName: 'Wilson',
         phone: '+1234567893'
      },
      {
         username: 'alicejohnson',
         email: 'alice.johnson@example.com',
         password: 'password123',
         firstName: 'Alice',
         lastName: 'Johnson',
         phone: '+1234567894'
      }
   ];

   const userIds: string[] = [];

   for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      const result = await client.query(
         `
         INSERT INTO "user" (username, password_hash, email, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING user_id
      `,
         [user.username, hashedPassword, user.email, user.firstName, user.lastName, user.phone]
      );

      userIds.push(result.rows[0].user_id);
   }

   console.log(`✅ Created ${users.length} users`);
   return userIds;
}

async function seedCategories(client: any): Promise<string[]> {
   console.log('📂 Seeding categories...');

   const categories = [
      {
         name: 'Electronics',
         description: 'Electronic devices and gadgets'
      },
      {
         name: 'Clothing',
         description: 'Apparel and fashion items'
      },
      {
         name: 'Home & Garden',
         description: 'Home improvement and garden supplies'
      },
      {
         name: 'Books',
         description: 'Books and educational materials'
      },
      {
         name: 'Sports & Outdoors',
         description: 'Sports equipment and outdoor gear'
      }
   ];

   const categoryIds: string[] = [];

   for (const category of categories) {
      const result = await client.query(
         `
         INSERT INTO category (name, description)
         VALUES ($1, $2)
         RETURNING category_id
      `,
         [category.name, category.description]
      );

      categoryIds.push(result.rows[0].category_id);
   }

   console.log(`✅ Created ${categories.length} categories`);
   return categoryIds;
}

async function seedProducts(client: any, categoryIds: string[]): Promise<string[]> {
   console.log('📦 Seeding products...');

   const products = [
      // Electronics
      {
         name: 'iPhone 15 Pro',
         description: 'Latest iPhone with advanced features',
         price: 999.99,
         stock: 50,
         categoryId: categoryIds[0],
         sku: 'IPHONE15PRO',
         image_url:
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
      },
      {
         name: 'Samsung Galaxy S24',
         description: 'Premium Android smartphone',
         price: 899.99,
         stock: 45,
         categoryId: categoryIds[0],
         sku: 'GALAXY_S24',
         image_url:
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
      },
      {
         name: 'MacBook Air M3',
         description: 'Lightweight laptop with M3 chip',
         price: 1299.99,
         stock: 30,
         categoryId: categoryIds[0],
         sku: 'MACBOOK_AIR_M3',
         image_url:
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
      },
      {
         name: 'Dell XPS 13',
         description: 'High-performance ultrabook',
         price: 1199.99,
         stock: 25,
         categoryId: categoryIds[0],
         sku: 'DELL_XPS13',
         image_url:
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
      },

      // Clothing
      {
         name: 'Nike Air Max 270',
         description: 'Comfortable running shoes',
         price: 150.0,
         stock: 100,
         categoryId: categoryIds[1],
         sku: 'NIKE_AIRMAX270',
         image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
      },
      {
         name: "Levi's 501 Jeans",
         description: 'Classic straight-leg jeans',
         price: 89.99,
         stock: 80,
         categoryId: categoryIds[1],
         sku: 'LEVIS_501',
         image_url:
            'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'
      },
      {
         name: 'Adidas Hoodie',
         description: 'Comfortable cotton hoodie',
         price: 65.0,
         stock: 60,
         categoryId: categoryIds[1],
         sku: 'ADIDAS_HOODIE',
         image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
      },

      // Home & Garden
      {
         name: 'Dyson V15 Vacuum',
         description: 'Cordless vacuum cleaner',
         price: 749.99,
         stock: 20,
         categoryId: categoryIds[2],
         sku: 'DYSON_V15',
         image_url:
            'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop'
      },
      {
         name: 'Garden Tool Set',
         description: 'Complete gardening tool kit',
         price: 89.99,
         stock: 40,
         categoryId: categoryIds[2],
         sku: 'GARDEN_TOOLS',
         image_url:
            'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'
      },

      // Books
      {
         name: 'The Pragmatic Programmer',
         description: 'Programming best practices book',
         price: 49.99,
         stock: 75,
         categoryId: categoryIds[3],
         sku: 'PRAGMATIC_PROG',
         image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop'
      },
      {
         name: 'Clean Code',
         description: 'Software craftsmanship handbook',
         price: 45.99,
         stock: 65,
         categoryId: categoryIds[3],
         sku: 'CLEAN_CODE',
         image_url:
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop'
      },

      // Sports & Outdoors
      {
         name: 'Yoga Mat',
         description: 'Non-slip exercise mat',
         price: 29.99,
         stock: 120,
         categoryId: categoryIds[4],
         sku: 'YOGA_MAT',
         image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'
      },
      {
         name: 'Camping Tent',
         description: '4-person waterproof tent',
         price: 199.99,
         stock: 35,
         categoryId: categoryIds[4],
         sku: 'CAMPING_TENT',
         image_url:
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop'
      }
   ];

   const productIds: string[] = [];

   for (const product of products) {
      const result = await client.query(
         `
         INSERT INTO product (name, description, price, stock, category_id, sku, "image_url")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING product_id
      `,
         [
            product.name,
            product.description,
            product.price,
            product.stock,
            product.categoryId,
            product.sku,
            product.image_url
         ]
      );

      productIds.push(result.rows[0].product_id);
   }

   console.log(`✅ Created ${products.length} products`);
   return productIds;
}

async function seedCarts(client: any, userIds: string[]): Promise<string[]> {
   console.log('🛒 Seeding carts...');

   const cartIds: string[] = [];

   // Create a cart for each user
   for (const userId of userIds) {
      const result = await client.query(
         `
         INSERT INTO cart (user_id)
         VALUES ($1)
         RETURNING cart_id
      `,
         [userId]
      );

      cartIds.push(result.rows[0].cart_id);
   }

   console.log(`✅ Created ${cartIds.length} carts`);
   return cartIds;
}

async function seedCartItems(client: any, cartIds: string[], productIds: string[]) {
   console.log('🛍️ Seeding cart items...');

   const cartItems = [
      // User 1's cart (admin)
      { cartId: cartIds[0], productId: productIds[0], quantity: 1 },
      { cartId: cartIds[0], productId: productIds[4], quantity: 2 },

      // User 2's cart (johndoe)
      { cartId: cartIds[1], productId: productIds[1], quantity: 1 },
      { cartId: cartIds[1], productId: productIds[5], quantity: 1 },
      { cartId: cartIds[1], productId: productIds[11], quantity: 3 },

      // User 3's cart (janesmth)
      { cartId: cartIds[2], productId: productIds[2], quantity: 1 },
      { cartId: cartIds[2], productId: productIds[9], quantity: 2 },

      // User 4's cart (bobwilson)
      { cartId: cartIds[3], productId: productIds[7], quantity: 1 },
      { cartId: cartIds[3], productId: productIds[8], quantity: 1 },

      // User 5's cart (alicejohnson)
      { cartId: cartIds[4], productId: productIds[12], quantity: 1 },
      { cartId: cartIds[4], productId: productIds[6], quantity: 2 }
   ];

   for (const item of cartItems) {
      await client.query(
         `
         INSERT INTO cart_item (cart_id, product_id, quantity)
         VALUES ($1, $2, $3)
      `,
         [item.cartId, item.productId, item.quantity]
      );
   }

   console.log(`✅ Created ${cartItems.length} cart items`);
}

async function seedOrders(client: any, userIds: string[]): Promise<string[]> {
   console.log('📋 Seeding orders...');

   const orders = [
      { userId: userIds[1], status: 'delivered', totalAmount: 1139.98 },
      { userId: userIds[2], status: 'shipped', totalAmount: 299.99 },
      { userId: userIds[3], status: 'processing', totalAmount: 1599.98 },
      { userId: userIds[4], status: 'pending', totalAmount: 89.99 },
      { userId: userIds[0], status: 'delivered', totalAmount: 749.99 }
   ];

   const orderIds: string[] = [];

   for (const order of orders) {
      const result = await client.query(
         `
         INSERT INTO "order" (user_id, status, total_amount)
         VALUES ($1, $2, $3)
         RETURNING order_id
      `,
         [order.userId, order.status, order.totalAmount]
      );

      orderIds.push(result.rows[0].order_id);
   }

   console.log(`✅ Created ${orders.length} orders`);
   return orderIds;
}

async function seedOrderItems(client: any, orderIds: string[], productIds: string[]) {
   console.log('📦 Seeding order items...');

   const orderItems = [
      // Order 1 items
      { orderId: orderIds[0], productId: productIds[1], quantity: 1, price_at_time: 899.99 },
      { orderId: orderIds[0], productId: productIds[5], quantity: 1, price_at_time: 89.99 },
      { orderId: orderIds[0], productId: productIds[4], quantity: 1, price_at_time: 150.0 },

      // Order 2 items
      { orderId: orderIds[1], productId: productIds[9], quantity: 2, price_at_time: 49.99 },
      { orderId: orderIds[1], productId: productIds[10], quantity: 4, price_at_time: 45.99 },

      // Order 3 items
      { orderId: orderIds[2], productId: productIds[2], quantity: 1, price_at_time: 1299.99 },
      { orderId: orderIds[2], productId: productIds[7], quantity: 1, price_at_time: 749.99 },

      // Order 4 items
      { orderId: orderIds[3], productId: productIds[8], quantity: 1, price_at_time: 89.99 },

      // Order 5 items
      { orderId: orderIds[4], productId: productIds[7], quantity: 1, price_at_time: 749.99 }
   ];

   for (const item of orderItems) {
      await client.query(
         `
         INSERT INTO order_item (order_id, product_id, quantity, price_at_time)
         VALUES ($1, $2, $3, $4)
      `,
         [item.orderId, item.productId, item.quantity, item.price_at_time]
      );
   }

   console.log(`✅ Created ${orderItems.length} order items`);
}

// Function to run the seeder
export async function runSeeder() {
   try {
      await seedDatabase();
      console.log('🎉 Database seeding completed!');
   } catch (error) {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
   } finally {
      await pool.end();
   }
}

// Run seeder if this file is executed directly
if (require.main === module) {
   runSeeder();
}
