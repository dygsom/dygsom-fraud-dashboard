/**
 * API Types
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status_code?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Removed PaginatedResponse - now defined in dashboard.ts as SSOT

export interface ApiRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
  requiresAuth?: boolean;
}
