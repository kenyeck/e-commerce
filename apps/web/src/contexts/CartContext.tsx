'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { useAuth } from './AuthContext';
import { Cart, CartItem } from '@e-commerce/types';

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  cartItemCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<CartItem | null>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  mergeGuestCart: (newUserId: string) => Promise<Cart | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const cartData = await apiClient.getUserCart(userId);
      setCart(cartData);

      if (cartData) {
        setCartItems(cartData.items ?? []);
      } else {
        setCartItems([]);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      const cartItem = await apiClient.addToCart(productId, quantity, userId);

      // Refresh cart after adding item
      await fetchCart();

      setError(null);
      return cartItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      setLoading(true);
      await apiClient.removeFromCart(cartItemId, userId);

      // Refresh cart after removing item
      await fetchCart();

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchCart]);

  const mergeGuestCart = useCallback(async (newUserId: string) => {
    try {
      setLoading(true);
      const mergedCart = await apiClient.mergeGuestCartWithUser(newUserId);
      setCart(mergedCart);

      // Refresh cart items
      await fetchCart();

      setError(null);
      return mergedCart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge cart');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value: CartContextType = {
    cart,
    cartItems,
    cartItemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    loading,
    error,
    addToCart,
    removeFromCart,
    fetchCart,
    mergeGuestCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
