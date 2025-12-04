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
import { withRetry, DEFAULT_RETRY_OPTIONS } from '@/lib/utils/retry';
import { performanceMonitor } from '@/lib/utils/performance';
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

        // Start performance monitoring
        performanceMonitor.start(`API_${requestId}`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasParams: !!config.params,
          hasData: !!config.data,
        });

        // Add authentication token
        const token = storage.getItem<string>(AUTH_CONFIG.tokenStorageKey);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
        // Calculate request duration and end performance monitoring
        const metadata = (response.config as any).metadata;
        const duration = Date.now() - (metadata?.startTime || Date.now());
        const requestId = metadata?.requestId;

        if (requestId) {
          performanceMonitor.end(`API_${requestId}`, {
            status: response.status,
            responseSize: JSON.stringify(response.data).length,
            success: true,
          });
        }

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
        const metadata = (error.config as any)?.metadata;
        const requestId = metadata?.requestId;

        // End performance monitoring for failed request
        if (requestId) {
          performanceMonitor.end(`API_${requestId}`, {
            status,
            success: false,
            errorMessage: error.message,
          });
        }

        // Log error
        logger.apiError(method, url, error);

        // Handle specific error cases
        if (status === 401) {
          // Unauthorized - clear token and redirect to login
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          
          logger.auth('Unauthorized request - clearing auth', {
            url,
            method,
            currentPath,
            hasToken: !!storage.getItem<string>(AUTH_CONFIG.tokenStorageKey),
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
    return withRetry(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    }, {
      ...DEFAULT_RETRY_OPTIONS,
      retryCondition: (error) => {
        // Don't retry authentication errors
        if (error.status_code === 401 || error.status_code === 403) {
          return false;
        }
        // Retry network errors and server errors
        return !error.status_code || (error.status_code >= 500 && error.status_code < 600);
      },
    });
  }

  /**
   * POST request with retry logic
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return withRetry(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    }, {
      ...DEFAULT_RETRY_OPTIONS,
      retryCondition: (error) => {
        // Don't retry authentication errors or client errors
        if (error.status_code >= 400 && error.status_code < 500) {
          return false;
        }
        // Retry network errors and server errors
        return !error.status_code || (error.status_code >= 500 && error.status_code < 600);
      },
    });
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
