/**
 * Dashboard Types
 */

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
  fraud_percentage: number;
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
