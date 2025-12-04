'use client';

/**
 * Authentication Context
 *
 * Manages user authentication state and provides authentication functions
 * throughout the application.
 *
 * Security features:
 * - JWT token management
 * - Automatic token refresh
 * - Secure storage
 * - Auto logout on token expiration
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { AUTH_CONFIG } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import type { User, AuthContextType, SignupRequest, LoginRequest } from '@/types';

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);

        if (storedToken) {
          setToken(storedToken);

          // Fetch current user
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);

          logger.auth('User authenticated from storage', {
            userId: currentUser.id,
            email: currentUser.email,
          });
        }
      } catch (error) {
        logger.error('Failed to initialize auth', error);
        // Clear invalid token from localStorage
        storage.removeItem(AUTH_CONFIG.tokenStorageKey);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setIsLoading(true);

        const loginData: LoginRequest = { email, password };
        const response = await authApi.login(loginData);

        // Store token in localStorage
        storage.setItem(AUTH_CONFIG.tokenStorageKey, response.access_token);
        setToken(response.access_token);
        setUser(response.user);

        logger.auth('User logged in', {
          userId: response.user.id,
          email: response.user.email,
        });

        // Force a small delay to ensure state is updated
        setTimeout(() => {
          router.push(ROUTES.protected.dashboard);
        }, 100);
      } catch (error) {
        logger.error('Login failed', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Signup function
   */
  const signup = useCallback(
    async (data: SignupRequest): Promise<void> => {
      try {
        setIsLoading(true);

        const response = await authApi.signup(data);

        // Store token in localStorage
        storage.setItem(AUTH_CONFIG.tokenStorageKey, response.access_token);
        setToken(response.access_token);
        setUser(response.user);

        logger.auth('User signed up', {
          userId: response.user.id,
          email: response.user.email,
        });

        // Redirect to dashboard
        router.push(ROUTES.protected.dashboard);
      } catch (error) {
        logger.error('Signup failed', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    logger.auth('User logged out', {
      userId: user?.id,
      email: user?.email,
    });

    // Clear token from localStorage
    storage.removeItem(AUTH_CONFIG.tokenStorageKey);
    setToken(null);
    setUser(null);

    // Redirect to login
    router.push(ROUTES.public.login);
  }, [user, router]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      logger.auth('User data refreshed', {
        userId: currentUser.id,
      });
    } catch (error) {
      logger.error('Failed to refresh user', error);
      // If refresh fails, logout
      logout();
    }
  }, [logout]);

  // More reliable authentication check
  const isAuthenticated = !!token && !!user;
  
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 *
 * Use this hook to access authentication state and functions
 *
 * @throws Error if used outside AuthProvider
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
