'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';

export function Home() {
   const logout = () => {
      const logoutUser = async () => {
         await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
               'Content-Type': 'application/json'
            }
         });
      };
      logoutUser();
   };

   return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
         <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <nav className="flex gap-4">
               <Link href="/" className="text-blue-600 hover:underline">
                  Home
               </Link>
               <Link href="/products" className="text-blue-600 hover:underline">
                  Products
               </Link>
               <Link href="/about" className="text-blue-600 hover:underline">
                  About Us
               </Link>
               <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact
               </Link>
               <Link href="/cart" className="text-blue-600 hover:underline">
                  <FaShoppingCart />
               </Link>
               <Link href="/login" className="text-blue-600 hover:underline">
                  Login
               </Link>
               <button onClick={logout} className="text-blue-600 hover:underline">
                  Logout
               </button>
               <Link href="/profile" className="text-blue-600 hover:underline">
                  Profile
               </Link>
            </nav>
            <div className="flex items-center gap-2">
               <Image
                  src="/images/e-commerce-logo.png"
                  alt="Logo"
                  width={200}
                  height={200}
                  className="rounded-full"
               />
            </div>
            <h1 className="text-4xl font-bold">Welcome to Our E-commerce Platform</h1>
            <p className="text-lg text-gray-700">
               Explore our wide range of products and enjoy a seamless shopping experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Shop Now
               </button>
               <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                  Learn More
               </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
               Sign up for our newsletter to get the latest updates and offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
               <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
               />
               <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Subscribe
               </button>
            </form>
            <div className="mt-4">
               <p className="text-sm text-gray-500">
                  By subscribing, you agree to receive our promotional emails.
               </p>
            </div>
         </main>
         <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <p className="text-sm text-gray-500">
               {`© ${new Date().getFullYear()} E-commerce Platform. All rights reserved.`}
            </p>
         </footer>
      </div>
   );
}
