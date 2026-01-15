/**
 * API Endpoints - Re-export from client
 *
 * This file consolidates all API endpoint definitions.
 * The actual implementation is in client.ts for Single Source of Truth (SSOT).
 *
 * @module lib/api/endpoints
 * @see {@link ./client.ts} for implementation details
 */

// Re-export API client and types
export { api, ApiError } from './client';

// Re-export types from dashboard for convenience
export type {
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
