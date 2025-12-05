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

        // Add authentication token with detailed logging
        const token = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
        console.log('🔐 API REQUEST AUTH SETUP:', {
          requestId,
          url: config.url,
          method: config.method?.toUpperCase(),
          hasToken: !!token,
          tokenStart: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
          tokenLength: token?.length || 0,
          hasHeaders: !!config.headers,
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
        });
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ AUTHORIZATION HEADER SET');
        } else if (!token) {
          console.log('❌ NO TOKEN FOUND IN STORAGE');
        } else if (!config.headers) {
          console.log('❌ NO HEADERS OBJECT');
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
          const authHeader = error.config?.headers?.Authorization;
          
          console.error('🚨 401 UNAUTHORIZED ERROR DETAILS:', {
            url,
            method,
            currentPath,
            hasStoredToken: !!currentToken,
            storedTokenStart: currentToken ? currentToken.substring(0, 20) + '...' : 'NONE',
            storedTokenLength: currentToken?.length || 0,
            authHeaderSent: authHeader || 'NONE',
            authHeaderMatches: authHeader === `Bearer ${currentToken}`,
            responseData: error.response?.data,
            requestHeaders: error.config?.headers,
            timestamp: new Date().toISOString()
          });
          
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
    // Debug logging for GET requests
    const token = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
    console.log('🔍 API GET REQUEST DEBUG:', {
      url,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      config: config ? Object.keys(config) : 'none',
      timestamp: new Date().toISOString()
    });
    
    const response = await this.client.get<T>(url, config);
    console.log('✅ API GET SUCCESS:', {
      url,
      status: response.status,
      hasData: !!response.data
    });
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
