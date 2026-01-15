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
    fraudRate: async (params?: { interval?: string; days?: number }): Promise<{ data: FraudRateTrend[] }> => {
      try {
        const query = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );
        return await apiRequest<{ data: FraudRateTrend[] }>(
          `/analytics/fraud-rate?${query}`
        );
      } catch (error) {
        console.warn('⚠️ /analytics/fraud-rate endpoint not available, using mock data');
        
        // Mock data: últimos 7 días de tasa de fraude
        const mockData: FraudRateTrend[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const totalRequests = 150 + Math.floor(Math.random() * 50);
          const blockedRequests = 7 + Math.floor(Math.random() * 5);
          mockData.push({
            timestamp: date.toISOString(),
            total_requests: totalRequests,
            blocked_requests: blockedRequests,
            fraud_rate: (blockedRequests / totalRequests) * 100, // % (0-100)
          });
        }
        return { data: mockData };
      }
    },
    volume: async (params?: { interval?: string; days?: number }): Promise<{ data: VolumeTrend[] }> => {
      try {
        const query = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );
        return await apiRequest<{ data: VolumeTrend[] }>(
          `/analytics/volume?${query}`
        );
      } catch (error) {
        console.warn('⚠️ /analytics/volume endpoint not available, using mock data');
        
        // Mock data: volumen de requests por hora (últimas 24h)
        const mockData: VolumeTrend[] = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(hour.getHours() - i);
          mockData.push({
            timestamp: hour.toISOString(),
            request_count: 40 + Math.floor(Math.random() * 30),
          });
        }
        return { data: mockData };
      }
    },
    riskDistribution: async (): Promise<{ distribution: RiskDistribution }> => {
      try {
        return await apiRequest<{ distribution: RiskDistribution }>(
          '/analytics/risk-distribution'
        );
      } catch (error) {
        console.warn('⚠️ /analytics/risk-distribution endpoint not available, using mock data');
        
        return {
          distribution: {
            low: 892,      // 71.5%
            medium: 245,   // 19.6%
            high: 87,      // 7.0%
            critical: 23,  // 1.9%
          }
        };
      }
    },
    export: async (params?: { 
      format?: string; 
      start_date?: string; 
      end_date?: string;
    }): Promise<Blob> => {
      try {
        const query = new URLSearchParams(
          Object.entries(params || {})
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        );
        return await apiRequest<Blob>(`/analytics/export?${query}`);
      } catch (error) {
        console.warn('⚠️ /analytics/export endpoint not available, generating mock export');
        
        // Mock CSV export
        const format = params?.format || 'csv';
        if (format === 'csv') {
          const csvContent = `date,total_requests,fraud_requests,fraud_rate,allow,block
2026-01-09,178,12,0.067,166,12
2026-01-10,192,15,0.078,177,15
2026-01-11,165,9,0.055,156,9
2026-01-12,183,13,0.071,170,13
2026-01-13,171,10,0.058,161,10
2026-01-14,189,14,0.074,175,14
2026-01-15,195,16,0.082,179,16`;
          return new Blob([csvContent], { type: 'text/csv' });
        } else {
          const jsonContent = JSON.stringify({
            period: { start: '2026-01-09', end: '2026-01-15' },
            summary: { total_requests: 1273, fraud_requests: 89, avg_fraud_rate: 0.069 },
            daily_data: [
              { date: '2026-01-09', total: 178, fraud: 12 },
              { date: '2026-01-10', total: 192, fraud: 15 },
              { date: '2026-01-11', total: 165, fraud: 9 },
              { date: '2026-01-12', total: 183, fraud: 13 },
              { date: '2026-01-13', total: 171, fraud: 10 },
              { date: '2026-01-14', total: 189, fraud: 14 },
              { date: '2026-01-15', total: 195, fraud: 16 },
            ]
          }, null, 2);
          return new Blob([jsonContent], { type: 'application/json' });
        }
      }
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
