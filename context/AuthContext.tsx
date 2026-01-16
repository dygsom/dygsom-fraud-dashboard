'use client';

/**
 * AuthContext - Global authentication state
 *
 * Provides tenant data and API Key to all components.
 * Handles API Key validation and authentication flow.
 *
 * @module context/AuthContext
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import type { Tenant } from '@/types/dashboard';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  tenant: Tenant | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('dygsom_api_key');
    if (storedApiKey) {
      validateApiKey(storedApiKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function validateApiKey(key: string) {
    setIsLoading(true);
    try {
      // Test API key by making a minimal health check request
      // Backend will validate the API key via X-API-Key header
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'}/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key,
        },
        body: JSON.stringify({
          event_type: 'login',
          ip_address: '127.0.0.1',
          user_id: 'dashboard_auth_check',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid API Key');
      }

      const data = await response.json();
      
      // Extract tenant info from response
      const tenantInfo: Tenant = {
        tenant_id: data.tenant_id || 'dygsom_latam_prod_2026',
        tenant_name: data.tenant_name || 'DYGSOM LATAM',
        config: data.config || {
          pillars: {
            bot_detection: true,
            account_takeover: true,
            api_security: true,
            fraud_ml: true,
          },
          thresholds: {
            bot_score: 0.7,
            takeover_risk: 0.75,
            api_abuse_score: 0.8,
            ml_fraud_score: 0.85,
          },
          rate_limits: {
            requests_per_minute: 100,
            requests_per_hour: 5000,
          },
        },
        created_at: new Date().toISOString(),
      };
      
      setTenant(tenantInfo);
      setApiKey(key);
      localStorage.setItem('dygsom_api_key', key);
    } catch (error: unknown) {
      logger.error('Auth validation failed', { error });
      setTenant(null);
      setApiKey(null);
      localStorage.removeItem('dygsom_api_key');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(apiKey: string) {
    await validateApiKey(apiKey);
  }

  function logout() {
    setTenant(null);
    setApiKey(null);
    localStorage.removeItem('dygsom_api_key');
  }

  return (
    <AuthContext.Provider value={{ tenant, apiKey, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
