'use client';

/**
 * Dashboard Layout - Optimized
 *
 * Layout for protected dashboard pages with header and sidebar
 * Handles authentication check and redirect
 */

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { storage } from '@/lib/storage';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Debug logging for dashboard state
  useEffect(() => {
    console.log('🔍 DASHBOARD LAYOUT STATE:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });
  }, [isLoading, isAuthenticated, user]);

  // Redirect to login if not authenticated (with detailed logging)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('❌ NO AUTHENTICATED - Starting redirect process');
      
      const timer = setTimeout(() => {
        const storedToken = localStorage.getItem('dygsom_auth_token');
        console.log('🔐 FINAL AUTH CHECK:', {
          isAuthenticated,
          hasToken: !!storedToken,
          tokenLength: storedToken?.length || 0,
          willRedirect: !storedToken && !isAuthenticated
        });
        
        if (!storedToken && !isAuthenticated) {
          console.log('🚪 REDIRECTING TO LOGIN');
          sessionStorage.setItem('auth_message', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else if (!isLoading && isAuthenticated) {
      console.log('✅ AUTHENTICATED - Dashboard should render normally');
    }
  }, [isLoading, isAuthenticated]);

  // Show loading state with debug info
  if (isLoading) {
    console.log('⏳ SHOWING LOADING STATE');
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Cargando dashboard...</p>
          <p className="text-xs text-gray-400 mt-2">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    console.log('🚫 NOT AUTHENTICATED - Returning null (redirect in progress)');
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  console.log('✨ RENDERING AUTHENTICATED DASHBOARD');
  
  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header onMenuClick={() => {
          console.log('Opening mobile sidebar');
          setIsMobileSidebarOpen(true);
        }} />
        
        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => {
            console.log('Closing mobile sidebar');
            setIsMobileSidebarOpen(false);
          }} 
        />
        
        {/* Main Layout with Sidebar */}
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:ml-0">{children}</main>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('🚨 ERROR RENDERING DASHBOARD:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error en el Dashboard</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => {
              storage.removeItem('dygsom_auth_token');
              router.push('/login');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }
}
