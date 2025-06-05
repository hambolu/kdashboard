"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/config';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncAuthState: () => { token: string | null; userData: User | null };
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
  syncAuthState: () => ({ token: null, userData: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // Validate that storedUser is actually a JSON string
            if (typeof storedUser !== 'string' || !storedUser.trim().startsWith('{')) {
              throw new Error('Invalid user data format');
            }

            const parsedUser = JSON.parse(storedUser);
            
            // Validate the parsed user object has required fields
            if (!parsedUser || typeof parsedUser !== 'object' || 
                !parsedUser.id || !parsedUser.email || typeof parsedUser.is_active !== 'boolean') {
              throw new Error('Invalid user data structure');
            }

            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session data was corrupted, please sign in again');
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        console.log('Missing auth data, clearing state');
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      const response = await api.get<ApiResponse<User>>('/api/v1/admin/profile');

      if (!response.data?.data) {
        throw new Error('Invalid profile data received');
      }

      // Update stored user data if it's different
      const currentStoredUser = JSON.stringify(response.data.data);
      if (currentStoredUser !== storedUser) {
        localStorage.setItem('user', currentStoredUser);
      }

      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Authentication check failed:', err);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/admin/login', { 
        email, 
        password 
      });

      if (!response.data?.data) {
        throw new Error('Invalid login response');
      }

      // Store auth data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Verify storage was successful
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Auth data stored:', {
        hasToken: !!storedToken,
        hasUser: !!storedUser
      });

      if (!storedToken || !storedUser) {
        throw new Error('Failed to store authentication data');
      }

      // Update state
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      try {
        await api.post('/api/v1/admin/logout');
      } catch (error) {
        console.error('Logout API call failed:', error);
      }

      // Clear auth state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/signin');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Logout failed');
      // Still clear local state even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/signin');
    }
  };

  const syncAuthState = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userData = null;

    try {
      userData = storedUser ? JSON.parse(storedUser) : null;
      if (userData && storedToken) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
      toast.error('Failed to load user data');
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return { token: storedToken, userData };
  };

  // Periodically check authentication
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout,
        checkAuth,
        syncAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
