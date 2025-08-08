"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CommonLinks } from "./CommonLinks";
import { ColorModeToggle } from "./ColorModeToggle";

export function Nav() {
  const { isAuthenticated, logout } = useAuth();
  const { cartItemCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 right-0 left-0 flex h-16 items-center justify-between bg-gray-100 p-4 pr-12 sm:pl-12 shadow-md backdrop-blur dark:bg-gray-800/80 dark:text-white">
      <Link className="text-sm sm:text-xl font-bold" href="/">
        E-Commerce
      </Link>
      <div className="flex items-center gap-4">
        <CommonLinks />
        <div ref={dropdownRef} className="relative">
          <button className="menu-icon" onClick={toggleDropdown}>
            <FaUser />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 min-w-28 rounded-lg border border-gray-200 bg-gray-100 text-gray-800 shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={onLogout}
                    className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <ColorModeToggle />
        <Link href="/cart" className="menu-icon relative">
          <FaShoppingCart />
          {cartItemCount > 0 && (
            <span
              className={`absolute rounded-full bg-red-500 text-white ${cartItemCount > 99 ? "-top-2 -right-2 h-6 w-6" : "-top-1 -right-1 h-5 w-5"} flex items-center justify-center text-xs font-bold`}
            >
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
