import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { Nav } from "@/components/Nav";
import { CommonLinks } from "@/components/CommonLinks";
import Link from "next/link";
import { HorizontalLine } from "@e-commerce/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} App`,
  description: `${process.env.NEXT_PUBLIC_SITE_NAME} application built with Next.js and Express`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
      (function() {
        try {
          var isLocalDark = localStorage.getItem("dark-mode") === "true";
          var isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (isLocalDark || (!("dark-mode" in localStorage) && isSystemDark)) {
            document.documentElement.classList.add("dark");
          }
        } catch(e) {}
      })();
    `,
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col bg-gray-100 text-black dark:bg-gray-800 dark:text-gray-100">
              <Nav />
              <main className="mt-0 mb-0 flex flex-1 items-start justify-center">
                <div className="mx-auto flex max-w-screen-xl px-4">
                  <div className="px-7 py-25">{children}</div>
                </div>
              </main>
              <footer className="px-12">
                <HorizontalLine />
                <div className="flex items-center justify-center gap-5">
                  <CommonLinks />
                  <Link href="/about" className="nav-link">
                    About Us
                  </Link>
                  <Link href="/contact" className="nav-link">
                    Contact
                  </Link>
                  <Link href="/privacy" className="nav-link">
                    Privacy Policy
                  </Link>
                </div>
                <div className="w-full p-2 text-center text-xs text-gray-300 sm:p-5 sm:text-sm dark:text-gray-500">
                  {`© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME} Platform. All rights reserved.`}
                </div>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
