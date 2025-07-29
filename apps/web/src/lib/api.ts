import { useState, useEffect } from 'react';

// Define types locally for now
export interface User {
   userId: string;
   username: string;
   email: string;
   firstName?: string;
   lastName?: string;
   phone?: string;
   isActive: boolean;
   isEmailVerified: boolean;
   lastLoginAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface Product {
   productId: string;
   name: string;
   description?: string;
   price: number;
   stockQuantity: number;
   categoryId?: string;
   imageUrl?: string;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface Category {
   categoryId: string;
   name: string;
   description?: string;
   parentCategoryId?: string;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
}

export interface LoginRequest {
   username: string;
   password: string;
}

export interface LoginResponse {
   message: string;
   user: Omit<User, 'passwordHash'>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API client
class ApiClient {
   private baseUrl: string;

   constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
   }

   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
         credentials: 'include', // Important for sessions
         headers: {
            'Content-Type': 'application/json',
            ...options.headers
         },
         ...options
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
      return this.request<LoginResponse>('/api/login', {
         method: 'POST',
         body: JSON.stringify(credentials)
      });
   }

   async logout(): Promise<void> {
      return this.request<void>('/api/logout', {
         method: 'POST'
      });
   }

   async getProfile(): Promise<{ user: User }> {
      return this.request<{ user: User }>('/api/profile');
   }

   // User endpoints
   async getUsers(): Promise<User[]> {
      return this.request<User[]>('/api/users');
   }

   async getUserById(userId: string): Promise<User> {
      return this.request<User>(`/api/users/${userId}`);
   }

   async createUser(userData: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User> {
      return this.request<User>('/api/users', {
         method: 'POST',
         body: JSON.stringify(userData)
      });
   }

   // Product endpoints
   async getProducts(): Promise<Product[]> {
      return this.request<Product[]>('/api/products');
   }

   async getProductById(productId: string): Promise<Product> {
      return this.request<Product>(`/api/products/${productId}`);
   }

   async createProduct(
      productData: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>
   ): Promise<Product> {
      return this.request<Product>('/api/products', {
         method: 'POST',
         body: JSON.stringify(productData)
      });
   }

   // Category endpoints
   async getCategories(): Promise<Category[]> {
      return this.request<Category[]>('/api/categories');
   }

   async getCategoryById(categoryId: string): Promise<Category> {
      return this.request<Category>(`/api/categories/${categoryId}`);
   }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// React hooks
export const useAuth = () => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      checkAuth();
   }, []);

   const checkAuth = async () => {
      try {
         setLoading(true);
         const response = await apiClient.getProfile();
         setUser(response.user);
         setError(null);
      } catch (err) {
         setUser(null);
         setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
         setLoading(false);
      }
   };

   const login = async (credentials: LoginRequest) => {
      try {
         setLoading(true);
         const response = await apiClient.login(credentials);
         setUser(response.user);
         setError(null);
         return true;
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Login failed');
         return false;
      } finally {
         setLoading(false);
      }
   };

   const logout = async () => {
      try {
         await apiClient.logout();
         setUser(null);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Logout failed');
      }
   };

   return {
      user,
      userId: user?.userId,
      loading,
      error,
      login,
      logout,
      checkAuth,
      isAuthenticated: !!user
   };
};

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
         setError(err instanceof Error ? err.message : 'Failed to fetch users');
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

   const fetchProducts = async () => {
      try {
         setLoading(true);
         const data = await apiClient.getProducts();
         setProducts(data);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProducts();
   }, []);

   return { products, loading, error, refetch: fetchProducts };
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
         setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchCategories();
   }, []);

   return { categories, loading, error, refetch: fetchCategories };
};
