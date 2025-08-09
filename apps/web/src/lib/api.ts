import { useState, useEffect } from "react";
import {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  LoginRequest,
  LoginResponse,
  CreateCheckoutSessionResponse,
  CheckoutSession,
} from "@e-commerce/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Session management helpers
const SESSION_CART_KEY = "guest_cart_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

function getGuestCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_CART_KEY);
}

function setGuestCartId(cartId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_CART_KEY, cartId);
}

function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_CART_KEY);
  localStorage.removeItem("session_id");
}

// Generic API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      credentials: "include", // Important for sessions
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/api/logout", {
      method: "POST",
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/api/users");
  }

  async getUserById(userId: string): Promise<User | null> {
    return userId ? this.request<User>(`/api/users/${userId}`) : null;
  }

  async getUserProfile(): Promise<User | null> {
    return this.request<User>("/api/users/profile");
  }
  async createUser(
    userData: Omit<User, "userId" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    return this.request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/api/products");
  }

  async getProductById(productId: string): Promise<Product> {
    return this.request<Product>(`/api/products/${productId}`);
  }

  async createProduct(
    productData: Omit<Product, "productId" | "createdAt" | "updatedAt">,
  ): Promise<Product> {
    return this.request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/api/categories");
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${categoryId}`);
  }

  async createCart(userId?: string): Promise<Cart> {
    const body = userId ? { userId } : { sessionId: getOrCreateSessionId() };

    return this.request<Cart>(`/api/carts`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getUserCart(userId?: string): Promise<Cart | null> {
    if (userId) {
      console.log("Fetching cart for user:", userId);
      return this.request<Cart>(`/api/carts/user/${userId}`);
    } else {
      // Check for guest cart
      const guestCartId = getGuestCartId();
      if (guestCartId) {
        return this.request<Cart>(`/api/carts/${guestCartId}`);
      }
      return null;
    }
  }

  async addToCart(
    productId: string,
    quantity: number,
    userId?: string,
  ): Promise<CartItem> {
    const cart = await this.getUserCartOrCreate(userId);
    console.log("Adding item to cart:", cart.cartId, { productId, quantity });
    return this.request<CartItem>(`/api/carts/${cart.cartId}/items`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async getUserCartOrCreate(userId?: string): Promise<Cart> {
    let cart = null;
    try {
      cart = await this.getUserCart(userId);
    } catch (err) {
      console.error("Error fetching user cart:", err);
    }

    if (!cart) {
      cart = await this.createCart(userId);
      if (!userId) {
        // Store guest cart ID
        setGuestCartId(cart.cartId);
      }
    }
    return cart;
  }

  async removeFromCart(cartItemId: string, userId?: string): Promise<void> {
    const cart = await this.getUserCartOrCreate(userId);
    return this.request<void>(`/api/carts/${cart.cartId}/items/${cartItemId}`, {
      method: "DELETE",
    });
  }

  async mergeGuestCartWithUser(userId: string): Promise<Cart> {
    const guestCartId = getGuestCartId();
    if (!guestCartId) {
      // No guest cart to merge, just create new user cart
      return this.createCart(userId);
    }

    console.log(
      "Merging guest cart with user:",
      userId,
      "guestCartId:",
      guestCartId,
    );
    const mergedCart = await this.request<Cart>(`/api/carts/merge/${userId}`, {
      method: "POST",
      body: JSON.stringify({ guestCartId }),
    });

    // Clear guest cart data
    clearGuestCart();
    return mergedCart;
  }

  async createCheckoutSession(
    items: CartItem[],
  ): Promise<CreateCheckoutSessionResponse> {
    if (items.length === 0) {
      throw new Error("No items to checkout");
    }

    const response = await this.request<CreateCheckoutSessionResponse>(
      "/api/checkout",
      {
        method: "POST",
        body: JSON.stringify({ items }),
      },
    );

    return response;
  }

  async retrieveCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    return this.request<CheckoutSession>(`/api/checkout/sessions/${sessionId}`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};
