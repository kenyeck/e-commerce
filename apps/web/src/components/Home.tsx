"use client";

import { Box, Button, Stack } from "@e-commerce/ui";
import Image from "next/image";

export function Home() {
  return (
    <Box className="flex flex-col items-center gap-12">
      <Box className="flex items-center gap-2">
        <Image
          src="/images/e-commerce-logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="rounded-full"
        />
      </Box>
      <Box className="text-4xl font-bold text-black dark:text-white">{`Welcome to Our ${process.env.NEXT_PUBLIC_SITE_NAME} Platform`}</Box>
      <Box className="text-lg text-gray-500 dark:text-gray-300">
        Explore our wide range of products and enjoy a seamless shopping
        experience.
      </Box>
      <Box className="flex flex-col gap-4 sm:flex-row">
        <Button
          className="primary-button"
          onClick={() => (window.location.href = "/products")}
        >
          Shop Now
        </Button>
        <Button className="secondary-button">Learn More</Button>
      </Box>
      <Stack className="flex-col items-center gap-3">
        <Box className="my-2 text-sm text-gray-500 dark:text-gray-300">
          Sign up for our newsletter to get the latest updates and offers.
        </Box>
        <Stack className="gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <Button className="primary-button">Subscribe</Button>
        </Stack>
        <Box className="text-xs text-gray-500 dark:text-gray-300">
          By subscribing, you agree to receive our promotional emails.
        </Box>
      </Stack>
    </Box>
  );
}
