'use client';

/**
 * Dashboard Layout - Optimized
 *
 * Layout for protected dashboard pages with header and sidebar
 * Handles authentication check and redirect
 */

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated (fixed to prevent infinite loops)
  useEffect(() => {
    // Only redirect if we're sure we're not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('Dashboard auth check - will redirect to login in 1 second');
      
      // Single redirect with shorter delay
      const timer = setTimeout(() => {
        const storedToken = localStorage.getItem('dygsom_auth_token');
        console.log('Final auth check before redirect:', {
          isAuthenticated,
          hasToken: !!storedToken
        });
        
        if (!storedToken && !isAuthenticated) {
          sessionStorage.setItem('auth_message', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]); // Removed router from dependencies to prevent loops

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
