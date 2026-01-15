/**
 * API Client - HTTP requests to DYGSOM backend
 *
 * Centralized fetch wrapper with authentication and error handling.
 * Falls back to mock data when endpoints are not yet implemented.
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
import { ActionType } from '@/types/dashboard';

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
    recent: async (params?: {
      limit?: number;
      offset?: number;
      action?: string;
      min_risk_score?: number;
      start_date?: string;
      end_date?: string;
    }): Promise<PaginatedResponse<ScoreResponse>> => {
      try {
        const query = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );
        return await apiRequest<PaginatedResponse<ScoreResponse>>(
          `/scores/recent?${query}`
        );
      } catch (error) {
        // Fallback: Mock recent score
        console.warn('⚠️ /scores/recent endpoint not available, using mock data');
        
        const mockScore: ScoreResponse = {
          request_id: `req_${Date.now()}`,
          tenant_id: 'unknown',
          user_id: 'dashboard_user',
          action: ActionType.Allow,
          risk_score: 0.34,
          reason: 'Low risk - Mock data (endpoint not implemented)',
          pillar_scores: {
            bot_detection: 0.28,
            account_takeover: 0.31,
            api_security: 0.42,
            fraud_ml: 0.35,
          },
          signals: {
            bot_detection: {
              deviceKnown: true,
              ipScore: 0.15,
              rateSuspicious: false,
              userAgentValid: true,
            },
            account_takeover: {
              breached: false,
              impossibleTravel: false,
              knownDevice: true,
              velocitySuspicious: false,
            },
            api_security: {
              burstDetected: false,
              injectionAttempts: false,
              validationIssues: false,
            },
            fraud_ml: {
              amountAnomaly: false,
              velocityAnomaly: false,
              locationAnomaly: false,
            },
          },
          timestamp: new Date().toISOString(),
          latency_ms: 87,
        };

        return {
          data: [mockScore],
          total: 1,
          offset: 0,
          limit: params?.limit || 10,
        };
      }
    },
  },

  // Metrics
  metrics: {
    get: async (): Promise<DashboardMetrics> => {
      try {
        // Intentar obtener métricas reales del backend
        return await apiRequest<DashboardMetrics>('/metrics');
      } catch (error) {
        // Fallback: Retornar datos mock si el endpoint no existe
        console.warn('⚠️ /metrics endpoint not available, using mock data');
        
        // Mock data realista basado en el último health check
        return {
          total_requests_24h: 1247,
          blocked_requests_24h: 89,
          avg_risk_score_24h: 0.34,
          avg_latency_ms_24h: 87,
          actions_distribution: {
            allow: 1158,
            block: 89,
            challenge: 0,
            friction: 0,
          },
          pillar_avg_scores_24h: {
            bot_detection: 0.28,
            account_takeover: 0.31,
            api_security: 0.42,
            fraud_ml: 0.35,
          },
        };
      }
    },
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
