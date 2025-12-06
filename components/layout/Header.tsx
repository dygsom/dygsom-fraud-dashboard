'use client';

/**
 * DYGSOM Header Component
 *
 * Top navigation bar with DYGSOM branding, user info and actions
 */

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DygsomBrand } from '@/components/ui/dygsom-logo';
import { APP_CONFIG } from '@/config/constants';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="shadow-sm border-b border-gray-800 px-4 sm:px-6 py-4 sm:py-5 mb-0" style={{ backgroundColor: '#0f172a' }}>
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button & DYGSOM Brand */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              console.log('Hamburger menu clicked');
              onMenuClick?.();
            }}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <DygsomBrand 
            logoSize="xl" 
            showTagline={false}
            orientation="horizontal"
            className="text-xl sm:text-2xl"
          />
          <div className="hidden sm:block border-l border-gray-600 pl-6">
            <h1 className="text-lg lg:text-xl font-bold text-white mb-1">Panel de Control DYGSOM</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <p className="text-xs sm:text-sm text-gray-300">🛡️ Sistema de Detección de Fraude</p>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 mt-1 sm:mt-0 w-fit">
                v{APP_CONFIG.version}
              </span>
            </div>
            <div className="hidden lg:flex items-center mt-2 text-xs text-gray-400">
              <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Última actualización: {new Date().toLocaleTimeString('es-ES')}
            </div>
          </div>
        </div>

        {/* System Status & User Info */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
          {/* System Status - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 bg-green-900/20 border border-green-500/30 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300 font-medium">Sistema Activo</span>
          </div>
          
          {user && (
            <>
              {/* User Information Card */}
              <div className="flex items-center space-x-3 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                
                {/* User Details */}
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    {user.name || user.email}
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.organization && (
                      <>
                        <span className="text-xs text-gray-300">{user.organization.name}</span>
                        <span className="text-xs text-gray-500">•</span>
                      </>
                    )}
                    <span className="text-xs text-blue-400 font-medium">
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}