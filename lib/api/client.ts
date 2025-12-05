/**
 * API Client
 *
 * Axios-based HTTP client with interceptors for authentication,
 * logging, and error handling.
 *
 * Follows user requirements:
 * - No hardcoded values (all from env)
 * - Proper logging
 * - Security throughout
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '@/config/constants';
import { logger } from '@/lib/logger';
import { storage } from '@/lib/storage';
// Retry and performance utilities removed - using simpler approach
import type { ApiError } from '@/types';

/**
 * Create axios instance with base configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

/**
 * API Client class
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        const requestId = `${config.method?.toUpperCase()}_${config.url}_${startTime}`;

        // Add request start time for duration calculation
        (config as any).metadata = { startTime, requestId };

        // Performance monitoring removed during cleanup

        // Add authentication token with production-safe logging
        const token = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
        
        // Development-only detailed logging (removed from production)
        if (process.env.NODE_ENV === 'development') {
          logger.debug('API Request Auth Setup', {
            requestId,
            url: config.url,
            method: config.method?.toUpperCase(),
            hasToken: !!token,
            tokenLength: token?.length || 0,
            hasHeaders: !!config.headers,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
          });
        }
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Authorization header set successfully');
          }
        } else {
          // Log auth failures in all environments for debugging
          logger.warn('Authentication token missing', {
            hasToken: !!token,
            hasHeaders: !!config.headers,
            url: config.url
          });
        }

        // Log request
        logger.apiRequest(
          config.method?.toUpperCase() || 'GET',
          config.url || '',
          {
            params: config.params,
            data: config.data,
            requestId,
          }
        );

        return config;
      },
      (error: AxiosError) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const metadata = (response.config as any).metadata;
        const duration = Date.now() - (metadata?.startTime || Date.now());

        // Performance monitoring removed during cleanup

        // Log response
        logger.apiResponse(
          response.config.method?.toUpperCase() || 'GET',
          response.config.url || '',
          response.status,
          duration
        );

        return response;
      },
      async (error: AxiosError) => {
        const status = error.response?.status || 0;
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'UNKNOWN';
        // Performance monitoring removed during cleanup

        // Log error
        logger.apiError(method, url, error);

        // Handle specific error cases
        if (status === 401) {
          // Unauthorized - detailed logging and clear token
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const currentToken = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
          
          // Production-safe logging for 401 errors
          if (process.env.NODE_ENV === 'development') {
            logger.error('401 Unauthorized Error Details', {
              url,
              method,
              currentPath,
              hasStoredToken: !!currentToken,
              storedTokenLength: currentToken?.length || 0,
              responseData: error.response?.data,
              timestamp: new Date().toISOString()
            });
          } else {
            // Production: log minimal info for security
            logger.warn('Authentication failed', { url, method });
          }
          
          logger.auth('Unauthorized request - clearing auth', {
            url,
            method,
            currentPath,
            hasToken: !!currentToken,
          });

          // Clear auth state
          storage.removeItem(AUTH_CONFIG.tokenStorageKey);
          
          // Set message for login page
          if (typeof window !== 'undefined' && sessionStorage) {
            sessionStorage.setItem('auth_message', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          }

          // Only redirect if we're not already on login page
          if (typeof window !== 'undefined' && !currentPath.includes('/login')) {
            window.location.href = '/login';
          }
        } else if (status === 403) {
          // Forbidden - user doesn't have permission (e.g., non-admin accessing admin endpoints)
          logger.warn('Access forbidden', {
            url,
            method,
            responseData: error.response?.data
          });
          
          // Don't clear auth for 403 - user is authenticated but lacks permission
          // Let the component handle the error appropriately
        }

        // Format error response
        const apiError: ApiError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: (error.response?.data as any)?.message || error.message || 'An error occurred',
          status_code: status,
          details: error.response?.data as Record<string, unknown> | undefined,
        };

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * GET request with retry logic
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Development-only debug logging
    if (process.env.NODE_ENV === 'development') {
      const token = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
      logger.debug('API GET Request', {
        url,
        hasToken: !!token,
        config: config ? Object.keys(config) : 'none',
        timestamp: new Date().toISOString()
      });
    }
    
    const response = await this.client.get<T>(url, config);
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API GET Success', {
        url,
        status: response.status,
        hasData: !!response.data
      });
    }
    return response.data;
  }

  /**
   * POST request with retry logic
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the underlying axios instance
   * Use this if you need to make custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Singleton instance
export const apiClient = new ApiClient();
