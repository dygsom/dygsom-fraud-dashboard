/**
 * API Endpoints
 *
 * Type-safe API endpoint functions that use the API client.
 * All URLs from configuration (no hardcoded values).
 */

import { apiClient } from './client';
import { API_CONFIG } from '@/config/constants';
import type {
  LoginRequest,
  SignupRequest,
  TokenResponse,
  User,
  Transaction,
  TransactionFilters,
  AnalyticsSummary,
  DetailedAnalytics,
  VolumeAnalytics,
  FraudRateData,
  RiskDistributionData,
  AnalyticsTimeframe,
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  PaginatedResponse,
} from '@/types';

/**
 * Authentication Endpoints
 */
export const authApi = {
  /**
   * User signup
   */
  signup: (data: SignupRequest): Promise<TokenResponse> => {
    return apiClient.post<TokenResponse>(API_CONFIG.endpoints.auth.signup, data);
  },

  /**
   * User login
   */
  login: (data: LoginRequest): Promise<TokenResponse> => {
    return apiClient.post<TokenResponse>(API_CONFIG.endpoints.auth.login, data);
  },

  /**
   * Get current user info
   */
  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>(API_CONFIG.endpoints.auth.me);
  },
};

/**
 * Dashboard Endpoints
 */
export const dashboardApi = {
  /**
   * Get transactions with filters
   */
  getTransactions: (
    params?: TransactionFilters & { limit?: number; offset?: number }
  ): Promise<PaginatedResponse<Transaction>> => {
    return apiClient.get<PaginatedResponse<Transaction>>(
      API_CONFIG.endpoints.dashboard.transactions,
      { params }
    );
  },

  /**
   * Get analytics summary
   */
  getAnalytics: (days: number = 7): Promise<AnalyticsSummary> => {
    return apiClient.get<AnalyticsSummary>(API_CONFIG.endpoints.dashboard.analytics, {
      params: { days },
    });
  },

  /**
   * Get detailed analytics with charts data
   */
  getDetailedAnalytics: (timeframe: AnalyticsTimeframe): Promise<DetailedAnalytics> => {
    return apiClient.get<DetailedAnalytics>(`${API_CONFIG.endpoints.dashboard.analytics}/detailed`, {
      params: {
        start_date: timeframe.startDate,
        end_date: timeframe.endDate,
        period: timeframe.period,
      },
    });
  },

  /**
   * Get fraud rate trend data
   */
  getFraudRateTrend: (days: number = 30): Promise<FraudRateData[]> => {
    return apiClient.get<FraudRateData[]>(`${API_CONFIG.endpoints.dashboard.analytics}/fraud-rate-trend`, {
      params: { days },
    });
  },

  /**
   * Get volume analytics
   */
  getVolumeAnalytics: (days: number = 30): Promise<VolumeAnalytics> => {
    return apiClient.get<VolumeAnalytics>(`${API_CONFIG.endpoints.dashboard.analytics}/volume`, {
      params: { days },
    });
  },

  /**
   * Get risk distribution data
   */
  getRiskDistribution: (days: number = 30): Promise<RiskDistributionData[]> => {
    return apiClient.get<RiskDistributionData[]>(`${API_CONFIG.endpoints.dashboard.analytics}/risk-distribution`, {
      params: { days },
    });
  },

  /**
   * Export analytics data
   */
  exportAnalytics: (format: 'csv' | 'pdf', timeframe: AnalyticsTimeframe): Promise<Blob> => {
    return apiClient.get(`${API_CONFIG.endpoints.dashboard.analytics}/export`, {
      params: {
        format,
        start_date: timeframe.startDate,
        end_date: timeframe.endDate,
        period: timeframe.period,
      },
      responseType: 'blob',
    });
  },

  /**
   * Get API keys
   */
  getApiKeys: (): Promise<ApiKey[]> => {
    return apiClient.get<ApiKey[]>(API_CONFIG.endpoints.dashboard.apiKeys);
  },

  /**
   * Create new API key
   */
  createApiKey: (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    return apiClient.post<CreateApiKeyResponse>(
      API_CONFIG.endpoints.dashboard.createApiKey,
      data
    );
  },

  /**
   * Revoke API key
   */
  revokeApiKey: (keyId: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.dashboard.revokeApiKey(keyId)
    );
  },
};

/**
 * Fraud Detection Endpoints
 */
export const fraudApi = {
  /**
   * Get fraud score for transaction
   */
  getFraudScore: (data: unknown): Promise<unknown> => {
    return apiClient.post(API_CONFIG.endpoints.fraud.score, data);
  },
};
