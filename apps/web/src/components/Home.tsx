"use client";

import Image from "next/image";

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
      <h1 className="text-4xl font-bold text-black dark:text-white">{`Welcome to Our ${process.env.NEXT_PUBLIC_SITE_NAME} Platform`}</h1>
      <p className="text-lg text-gray-500 dark:text-gray-300">
        Explore our wide range of products and enjoy a seamless shopping
        experience.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          onClick={() => (window.location.href = "/products")}
        >
          Shop Now
        </button>
        <button className="cursor-pointer rounded-lg bg-gray-200 px-6 py-2 text-gray-800 transition hover:bg-gray-300">
          Learn More
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
        Sign up for our newsletter to get the latest updates and offers.
      </p>
      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          placeholder="Enter your email"
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <button className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700">
          Subscribe
        </button>
      </form>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          By subscribing, you agree to receive our promotional emails.
        </p>
      </div>
    </>
  );
}
