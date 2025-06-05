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
  admin: User;
  token: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  profile_picture?: string | null;
  role?: string;
  is_active: boolean;
  email_verified_at?: string;
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

// Custom toast styles
const successToast = (message: string) => toast.success(message, {
  style: {
    background: '#10B981',
    color: '#FFFFFF',
  },
  iconTheme: {
    primary: '#FFFFFF',
    secondary: '#10B981',
  },
});

const errorToast = (message: string) => toast.error(message, {
  style: {
    background: '#EF4444',
    color: '#FFFFFF',
  },
  iconTheme: {
    primary: '#FFFFFF',
    secondary: '#EF4444',
  },
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

  const saveAuthData = (token: string, userData: User) => {
    try {
      // Validate user data before storing
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data format');
      }

      // Validate required user fields
      if (!userData.id || !userData.email || typeof userData.is_active !== 'boolean') {
        console.error('[Auth Debug] Invalid user data structure:', userData);
        throw new Error('Missing required user data fields');
      }

      // First try to stringify the user data to validate it
      const userJson = JSON.stringify(userData);
      if (!userJson) {
        throw new Error('Failed to serialize user data');
      }

      // Clear existing data first
      localStorage.clear();

      // Store new data
      localStorage.setItem('token', token);
      localStorage.setItem('user', userJson);

      // Verify storage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || storedToken !== token) {
        throw new Error('Token storage verification failed');
      }

      try {
        const parsedUser = JSON.parse(storedUser || '');
        if (!parsedUser.id) {
          throw new Error('Stored user data is invalid');
        }
      } catch (parseError) {
        console.error('[Auth Debug] Stored user data parse error:', parseError);
        throw new Error('User data storage verification failed');
      }

      return true;
    } catch (error) {
      console.error('[Auth Debug] Auth data storage error:', error);
      // Clean up on failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.debug('[Auth Debug] Starting login process...');
      
      const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/admin/login', { 
        email, 
        password 
      });

      console.debug('[Auth Debug] Raw login response:', response.data);

      if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.admin) {
        console.error('[Auth Debug] Invalid login response structure:', response.data);
        throw new Error('Invalid login response format');
      }

      const { token, admin: userData } = response.data.data;

      // Save auth data with validation
      await saveAuthData(token, userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      // Show success message
      successToast('Login successful');

      // Set a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));

      console.debug('[Auth Debug] Login successful, navigating to dashboard...');
      
      try {
        await router.push('/dashboard');
      } catch (navError) {
        console.error('[Auth Debug] Navigation error:', navError);
        errorToast('Error navigating to dashboard');
      }

    } catch (err: any) {
      console.error('[Auth Debug] Login failed:', {
        error: err,
        message: err?.message || 'Unknown error',
        response: err?.response?.data
      });

      // Handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return messages[0]; // Take first message for each field
            }
            return `${field}: ${messages}`;
          })
          .join('. ');
        errorToast(errorMessages);
      } else {
        // Handle other types of errors
        errorToast(err?.response?.data?.message || err?.message || 'Login failed');
      }
      
      throw err;
    }
  };

  const logout = async () => {
    try {
      try {
        await api.post('/api/v1/admin/logout');
        successToast('Logged out successfully');
      } catch (error) {
        console.error('Logout API call failed:', error);
      }

      // Clear auth state regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      try {
        await router.push('/signin');
      } catch (navError) {
        console.error('[Auth Debug] Navigation error during logout:', navError);
        // Force a page reload as a fallback
        window.location.href = '/signin';
      }
    } catch (err) {
      console.error('Logout failed:', err);
      errorToast('Logout failed');
      // Still clear local state even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/signin';
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
