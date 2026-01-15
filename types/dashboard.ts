/**
 * Dashboard Types
 *
 * Single source of truth for all dashboard-related types.
 * Mirrors backend API responses from DYGSOM Fraud Detection API.
 *
 * @module types/dashboard
 * @see {@link ../docs/ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md} for API specs
 */

// ============================================
// ENUMS
// ============================================

export enum ActionType {
  Allow = 'allow',
  Block = 'block',
  Challenge = 'challenge',
  Friction = 'friction',
}

export enum PillarName {
  BotDetection = 'bot_detection',
  AccountTakeover = 'account_takeover',
  ApiSecurity = 'api_security',
  FraudMl = 'fraud_ml',
}

// ============================================
// API RESPONSE TYPES (Backend Integration)
// ============================================

/**
 * Fraud detection score response from backend
 */
export interface ScoreResponse {
  request_id: string;
  tenant_id: string;
  user_id: string;
  action: ActionType;
  risk_score: number; // 0.0 - 1.0
  reason: string;
  pillar_scores: {
    bot_detection?: number;
    account_takeover?: number;
    api_security?: number;
    fraud_ml?: number;
  };
  signals?: PillarSignals;
  timestamp: string; // ISO 8601
  latency_ms: number;
}

/**
 * Dashboard metrics (aggregated, last 24h)
 */
export interface DashboardMetrics {
  total_requests_24h: number;
  blocked_requests_24h: number;
  avg_risk_score_24h: number;
  avg_latency_ms_24h: number;
  actions_distribution: {
    allow: number;
    block: number;
    challenge: number;
    friction: number;
  };
  pillar_avg_scores_24h: {
    bot_detection: number;
    account_takeover: number;
    api_security: number;
    fraud_ml: number;
  };
}

/**
 * Pillar signals (detailed detection info)
 */
export interface PillarSignals {
  bot_detection?: {
    deviceKnown: boolean;
    ipScore: number;
    rateSuspicious: boolean;
    userAgentValid: boolean;
  };
  account_takeover?: {
    breached: boolean;
    impossibleTravel: boolean;
    knownDevice: boolean;
    velocitySuspicious: boolean;
  };
  api_security?: {
    burstDetected: boolean;
    injectionAttempts: boolean;
    validationIssues: boolean;
  };
  fraud_ml?: {
    amountAnomaly: boolean;
    velocityAnomaly: boolean;
    locationAnomaly: boolean;
  };
}

/**
 * Tenant configuration for pillars
 */
export interface TenantConfig {
  pillars: {
    bot_detection: boolean;
    account_takeover: boolean;
    api_security: boolean;
    fraud_ml: boolean;
  };
  thresholds: {
    bot_score: number;          // 0.0-1.0
    ato_score: number;          // 0.0-1.0
    api_score: number;          // 0.0-1.0
    ml_score: number;           // 0.0-1.0
  };
  actions: {
    high_risk_action: ActionType;   // Action when risk ≥ 80%
    medium_risk_action: ActionType;  // Action when risk ≥ 60%
    low_risk_action: ActionType;     // Action when risk < 60%
  };
}

/**
 * Tenant information from auth validation
 */
export interface Tenant {
  tenant_id: string;
  tenant_name: string;
  config: TenantConfig;
  created_at: string;
}

/**
 * API Key response
 */
export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string; // "dys_prod_abc"
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

/**
 * Fraud rate trend data point
 */
export interface FraudRateTrend {
  timestamp: string;
  total_requests: number;
  blocked_requests: number;
  fraud_rate: number; // % (0-100)
}

/**
 * Volume trend data point
 */
export interface VolumeTrend {
  timestamp: string;
  request_count: number;
}

/**
 * Risk distribution data
 */
export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================
// LEGACY TYPES (Compatibility)
// ============================================

export interface Transaction {
  id: string;
  transaction_id: string;
  merchant_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  is_fraud: boolean;
  fraud_probability: number;
  payment_method: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  location: string | null;
  created_at: string;
  processed_at: string;
  api_key_id: string;
}

export interface TransactionFilters {
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  is_fraud?: boolean;
}

export interface AnalyticsSummary {
  total_transactions: number;
  total_amount: number;
  fraud_detected: number;
  fraud_percentage: number; // Decimal value 0-1 (e.g., 0.08 = 8%)
  avg_risk_score: number;
  risk_distribution: RiskDistribution;
  transactions_by_day: TransactionsByDay[];
  fraud_by_payment_method: FraudByPaymentMethod[];
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface TransactionsByDay {
  date: string;
  total: number;
  fraud_count: number;
  total_amount: number;
}

export interface FraudByPaymentMethod {
  payment_method: string;
  total_transactions: number;
  fraud_count: number;
  fraud_rate: number;
}

export interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  status: 'active' | 'revoked' | 'expired';
  organization_id: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface CreateApiKeyRequest {
  key_name: string;
  expires_in_days?: number;
}

export interface CreateApiKeyResponse {
  api_key: ApiKey;
  key_value: string; // Full key, only returned once
}

export interface DashboardStats {
  today_transactions: number;
  today_fraud: number;
  today_amount: number;
  active_api_keys: number;
  avg_response_time: number;
}

// Extended Analytics Types
export interface DateRangeOption {
  label: string;
  value: string;
  days: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface FraudRateData {
  date: string;
  transactions: number;
  fraudCount: number;
  fraudRate: number;
  amount: number;
}

export interface RiskDistributionData {
  risk_level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface VolumeAnalytics {
  daily_volume: ChartDataPoint[];
  hourly_distribution: ChartDataPoint[];
  payment_method_distribution: ChartDataPoint[];
}

export interface AnalyticsTimeframe {
  startDate: string;
  endDate: string;
  period: '7d' | '30d' | '90d' | 'custom';
}

export interface DetailedAnalytics extends AnalyticsSummary {
  fraud_rate_trend: FraudRateData[];
  volume_analytics: VolumeAnalytics;
  risk_distribution_detailed: RiskDistributionData[];
  comparison_metrics: {
    previous_period_fraud_rate: number;
    previous_period_volume: number;
    fraud_rate_change: number;
    volume_change: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  dateRange: AnalyticsTimeframe;
  includeCharts?: boolean;
}
