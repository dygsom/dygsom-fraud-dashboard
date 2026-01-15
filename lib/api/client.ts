/**
 * API Client - HTTP requests to DYGSOM backend
 *
 * Centralized fetch wrapper with authentication and error handling.
 *
 * @module lib/api/client
 * @see {@link ../../docs/PASOS-DESARROLLO-MVP.md} for backend API specs
 */

import type {
  Tenant,
  DashboardMetrics,
  ScoreResponse,
  PaginatedResponse,
  ApiKeyResponse,
  TenantConfig,
  FraudRateTrend,
  VolumeTrend,
  RiskDistribution,
} from '@/types/dashboard';

// ============================================
// CONSTANTS
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

// ============================================
// ERROR TYPES
// ============================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// CORE REQUEST FUNCTION
// ============================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get API Key from localStorage
  const apiKey = typeof window !== 'undefined' 
    ? localStorage.getItem('dygsom_api_key') 
    : null;

  if (!apiKey) {
    throw new ApiError(401, 'No API Key found. Please login.');
  }

  // Make request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...options.headers,
    },
  });

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API Error: ${response.statusText}`,
      errorData
    );
  }

  // Parse response
  return response.json();
}

// ============================================
// API ENDPOINTS
// ============================================

export const api = {
  // Auth
  auth: {
    validate: () =>
      apiRequest<Tenant>('/auth/validate', { method: 'POST' }),
  },

  // Scores
  scores: {
    recent: (params?: {
      limit?: number;
      offset?: number;
      action?: string;
      min_risk_score?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {})
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      );
      return apiRequest<PaginatedResponse<ScoreResponse>>(
        `/scores/recent?${query}`
      );
    },
  },

  // Metrics
  metrics: {
    get: () => apiRequest<DashboardMetrics>('/metrics'),
  },

  // Analytics
  analytics: {
    fraudRate: (params?: { interval?: string; days?: number }) => {
      const query = new URLSearchParams(
        Object.entries(params || {})
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: FraudRateTrend[] }>(
        `/analytics/fraud-rate?${query}`
      );
    },
    volume: (params?: { interval?: string; days?: number }) => {
      const query = new URLSearchParams(
        Object.entries(params || {})
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: VolumeTrend[] }>(
        `/analytics/volume?${query}`
      );
    },
    riskDistribution: () =>
      apiRequest<{ distribution: RiskDistribution }>(
        '/analytics/risk-distribution'
      ),
    export: (params?: { 
      format?: string; 
      start_date?: string; 
      end_date?: string;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {})
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      );
      return apiRequest<Blob>(`/analytics/export?${query}`);
    },
  },

  // API Keys
  apiKeys: {
    list: () =>
      apiRequest<{ keys: ApiKeyResponse[] }>('/api-keys'),
    create: (name: string) =>
      apiRequest<ApiKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    revoke: (id: string) =>
      apiRequest<{ message: string }>(`/api-keys/${id}`, {
        method: 'DELETE',
      }),
  },

  // Tenant Config
  tenant: {
    getConfig: () =>
      apiRequest<{ config: TenantConfig }>('/tenant/config'),
    updateConfig: (config: Partial<TenantConfig>) =>
      apiRequest<{ config: TenantConfig; message: string }>(
        '/tenant/config',
        {
          method: 'PATCH',
          body: JSON.stringify(config),
        }
      ),
  },
};
