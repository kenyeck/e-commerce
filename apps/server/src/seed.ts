import dotenv from 'dotenv';
import { runSeeder } from './utils/seedDatabase';

// Load environment variables
dotenv.config({
   path: `./.env.${process.env.NODE_ENV ? `${process.env.NODE_ENV}` : 'development'}`
});

console.log('🚀 Starting database seeding...');
console.log('📊 Database:', process.env.POSTGRES_DATABASE);
console.log('🏠 Host:', process.env.POSTGRES_HOST);

runSeeder();
