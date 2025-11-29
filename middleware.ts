/**
 * Next.js Middleware - Optimized
 *
 * Simplified middleware that only handles static files and API routes.
 * Authentication is handled client-side by AuthContext for better UX.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip middleware for Next.js internal routes
  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Let all other routes through - AuthContext handles authentication
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Defines which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
