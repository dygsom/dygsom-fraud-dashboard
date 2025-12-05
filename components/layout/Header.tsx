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

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="dygsom-card border-0 border-b border-blue-100/60 px-6 py-4 mb-0 rounded-none">
      <div className="flex items-center justify-between">
        {/* DYGSOM Brand Section */}
        <div className="flex items-center space-x-4">
          <DygsomBrand 
            logoSize="xl" 
            showTagline={true}
            orientation="horizontal"
            className="text-2xl"
          />
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
            v{APP_CONFIG.version}
          </span>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-6">
          {/* Fraud Detection Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600 font-medium">Sistema Activo</span>
          </div>
          
          {user && (
            <>
              {/* User Information */}
              <div className="text-right">
                <div className="text-sm font-medium text-slate-900">
                  {user.name || user.email}
                </div>
                {user.organization && (
                  <div className="text-xs text-slate-500">
                    {user.organization.name}
                  </div>
                )}
                <div className="text-xs dygsom-text-secondary font-medium">
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>

              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-blue-200 text-slate-600 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors"
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