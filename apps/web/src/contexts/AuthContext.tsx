'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { User, LoginRequest } from '@e-commerce/types';

interface AuthContextType {
  user: User | null;
  userId: string | undefined;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<string | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserProfile();
      setUser(response);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      setUser(response.user);
      setError(null);
      return response.user.userId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    userId: user?.userId,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
