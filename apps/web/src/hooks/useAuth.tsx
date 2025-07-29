import { User } from '@/models/entities';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user as User); // Now you have user.userId available
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username:string, password:string) => {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user); // Store user data including userId
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('http://localhost:3001/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return { 
    user, // Contains userId when authenticated
    userId: user?.userId, // Direct access to userId
    loading, 
    login, 
    logout, 
    checkAuth 
  };
};