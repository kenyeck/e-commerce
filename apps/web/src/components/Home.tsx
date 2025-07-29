'use client';

import Image from 'next/image';

export function Home() {
   return (
      <>
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
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
               Shop Now
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition cursor-pointer">
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
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
               Subscribe
            </button>
         </form>
         <div>
            <p className="text-sm text-gray-500">
               By subscribing, you agree to receive our promotional emails.
            </p>
         </div>
      </>
   );
}
