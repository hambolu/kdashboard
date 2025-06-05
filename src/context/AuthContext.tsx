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
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.debug('[Auth Debug] Initializing auth state:', {
          hasToken: !!token,
          hasStoredUser: !!storedUser,
          path: window.location.pathname
        });
        
        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.id) {
              throw new Error('Invalid user data structure');
            }
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.debug('[Auth Debug] Auth state initialized successfully');
          } catch (parseError) {
            console.error('[Auth Debug] Failed to parse stored user data:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session expired, please sign in again');
          }
        }
      } catch (error) {
        console.error('[Auth Debug] Error initializing auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Set up storage event listener to sync auth state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.debug('[Auth Debug] Token changed in another tab');
        if (!e.newValue) {
          setIsAuthenticated(false);
          setUser(null);
          router.push('/signin');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  const checkAuth = async () => {
    if (loading) return; // Prevent check during initial load
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.debug('[Auth Debug] Auth check state:', { 
        hasToken: !!token,
        hasUser: !!storedUser,
        isAuthenticated,
        path: window.location.pathname 
      });
      
      if (!token || !storedUser) {
        throw new Error('No auth data found');
      }

      const response = await api.get<ApiResponse<User>>('/api/v1/admin/profile');
      
      if (!response.data?.data) {
        throw new Error('Invalid profile data received');
      }

      // Update stored user data if different
      const currentUser = JSON.stringify(response.data.data);
      if (currentUser !== storedUser) {
        localStorage.setItem('user', currentUser);
      }

      setUser(response.data.data);
      setIsAuthenticated(true);
      
      console.debug('[Auth Debug] Auth check successful');
    } catch (err) {
      console.error('[Auth Debug] Auth check failed:', err);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the signin page
      if (window.location.pathname !== '/signin') {
        router.push('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.debug('[Auth Debug] Starting login process...');
      
      const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/admin/login', { 
        email, 
        password 
      });

      const { token, user: userData } = response.data.data;
      
      // Clear any existing auth data first
      localStorage.clear();
      
      // Store auth data and verify immediately
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Verify storage was successful
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.debug('[Auth Debug] Login storage check:', {
          tokenStored: storedToken === token,
          userStored: !!storedUser,
          token: token.substring(0, 10) + '...',
          timestamp: new Date().toISOString()
        });

        if (!storedToken || !storedUser) {
          throw new Error('Storage verification failed');
        }

        if (storedToken !== token) {
          throw new Error('Token verification failed');
        }

        // Test parsing the stored user data
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser || !parsedUser.id) {
          throw new Error('User data verification failed');
        }

        // Update state only after storage is verified
        setUser(userData);
        setIsAuthenticated(true);
        
        // Force an immediate auth check before navigation
        await checkAuth();

        console.debug('[Auth Debug] Login successful, navigating to dashboard...');
        
        // Use router.push with await to ensure navigation completes
        await router.push('/dashboard');
      } catch (error) {
        console.error('[Auth Debug] Storage error during login:', error);
        throw new Error('Failed to store authentication data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } catch (err: any) {
      console.error('[Auth Debug] Login failed:', {
        error: err,
        message: err?.response?.data?.message || err?.message,
        status: err?.response?.status
      });
      toast.error(err?.response?.data?.message || err?.message || 'Login failed');
      // Clear any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
