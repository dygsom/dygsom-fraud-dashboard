/**
 * Application Routes
 *
 * Centralized route definitions for the application.
 * Makes it easy to update routes and maintain consistency.
 */

export const ROUTES = {
  // Public routes (no authentication required)
  public: {
    login: '/login',
    signup: '/signup',
  },

  // Protected routes (authentication required)
  protected: {
    dashboard: '/',
    transactions: '/transactions',
    transactionDetail: (id: string) => `/transactions/${id}`,
    apiKeys: '/api-keys',
    analytics: '/analytics',
    settings: '/settings',
    profile: '/profile',
  },

  // API routes
  api: {
    health: '/api/health',
  },
} as const;

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return Object.values(ROUTES.public).some(route => pathname.startsWith(route));
}

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  return !isPublicRoute(pathname) && pathname !== '/';
}

/**
 * Get the default redirect after login
 */
export function getDefaultProtectedRoute(): string {
  return ROUTES.protected.dashboard;
}

/**
 * Get the login route with optional redirect
 */
export function getLoginRoute(redirectTo?: string): string {
  if (redirectTo) {
    return `${ROUTES.public.login}?redirect=${encodeURIComponent(redirectTo)}`;
  }
  return ROUTES.public.login;
}
