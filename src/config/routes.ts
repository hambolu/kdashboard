export const routes = {
  // Auth Routes
  signin: '/signin',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  
  // Admin Routes
  admin: {
    root: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    // E-commerce routes
    ecommerce: {
      dashboard: '/dashboard',
      products: '/products',
      orders: '/orders',
      customers: '/customers',
    },
    // User management routes
    users: {
      list: '/users',
      roles: '/users/roles',
      permissions: '/users/permissions',
    },
  }
} as const;

// Type-safe route getter
export function getRoute(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

// Helper to get the active route
export function isActiveRoute(currentPath: string, routePath: string) {
  if (routePath === routes.admin.root) {
    return currentPath === routePath;
  }
  return currentPath.startsWith(routePath);
}
