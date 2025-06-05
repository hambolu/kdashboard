import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Function to get token with debug logging
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.debug('[Auth Debug] Getting token:', { 
    exists: !!token,
    apiUrl: API_URL,
    timestamp: new Date().toISOString()
  });
  return token;
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies in cross-origin requests
});

// Add request interceptor to automatically add token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    // Ensure headers object exists
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.debug('[Auth Debug] Request config:', { 
      url: config.url,
      hasAuthHeader: !!config.headers.Authorization,
      method: config.method
    });
  } else {
    console.warn('[Auth Debug] No token found for request:', {
      url: config.url,
      method: config.method
    });
  }
  return config;
}, (error) => {
  console.error('[Auth Debug] Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.debug('[Auth Debug] Response received:', {
      url: response.config.url,
      status: response.status,
      hasToken: !!getAuthToken()
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[Auth Debug] 401 error detected:', {
        url: error.config?.url,
        hasToken: !!getAuthToken()
      });
      // Clear auth data on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Use router navigation in production instead of window.location
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);
