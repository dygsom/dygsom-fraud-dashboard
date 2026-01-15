/**
 * Mock Data for Testing Environment
 * 
 * Provides realistic, consistent test data for the fraud detection dashboard.
 * Used exclusively when special test user (usuario1@dygsom.pe) is authenticated.
 * 
 * Features:
 * - Statistically realistic fraud detection metrics
 * - Consistent data relationships across all mock objects
 * - Representative transaction patterns and risk distributions
 * - Deterministic data for reliable testing scenarios
 * 
 * @module MockData
 * @version 1.0.0
 */

import type { AnalyticsSummary, Transaction, ApiKey } from '@/types';

/** 
 * Mock data configuration constants - Kept for future reference but currently unused in API Key auth
 * Commented out to avoid TypeScript warnings
 */
/*
const MOCK_CONFIG = {
  BASE_DATE: '2025-12-09',
  TOTAL_TRANSACTIONS: 4567,
  FRAUD_RATE: 2.01,
  PREFIXES: {
    MERCHANT: 'test_merchant_',
    CUSTOMER: 'test_customer_',
    TRANSACTION: 'test_txn_',
    API_KEY: 'test_key_'
  }
} as const;
*/

/**
 * Analytics Summary Mock Data
 */
export const MOCK_ANALYTICS: AnalyticsSummary = {
  total_transactions: 4567,
  total_amount: 1_234_567.89,
  fraud_detected: 92,
  fraud_percentage: 0.0201, // 2.01% fraud rate
  avg_risk_score: 0.47,
  risk_distribution: {
    low: 3425,   // 75%
    medium: 822, // 18%
    high: 228,   // 5%
    critical: 92 // 2%
  },
  transactions_by_day: [
    { date: '2025-12-03', total: 652, fraud_count: 13, total_amount: 176234.12 },
    { date: '2025-12-04', total: 634, fraud_count: 12, total_amount: 168543.67 },
    { date: '2025-12-05', total: 678, fraud_count: 14, total_amount: 182456.34 },
    { date: '2025-12-06', total: 689, fraud_count: 15, total_amount: 195678.90 },
    { date: '2025-12-07', total: 645, fraud_count: 12, total_amount: 173234.56 },
    { date: '2025-12-08', total: 671, fraud_count: 13, total_amount: 184567.23 },
    { date: '2025-12-09', total: 598, fraud_count: 11, total_amount: 153853.07 }
  ],
  fraud_by_payment_method: [
    { payment_method: 'credit_card', total_transactions: 2300, fraud_count: 45, fraud_rate: 0.0196 },
    { payment_method: 'debit_card', total_transactions: 1200, fraud_count: 23, fraud_rate: 0.0192 },
    { payment_method: 'bank_transfer', total_transactions: 800, fraud_count: 15, fraud_rate: 0.0188 },
    { payment_method: 'digital_wallet', total_transactions: 267, fraud_count: 9, fraud_rate: 0.0337 }
  ]
};

/**
 * Recent Transactions Mock Data
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'test_001',
    transaction_id: 'test_001',
    merchant_id: 'merchant_001',
    customer_id: 'customer_001',
    amount: 1250.00,
    currency: 'PEN',
    risk_score: 0.87,
    risk_level: 'high',
    is_fraud: true,
    fraud_probability: 0.87,
    payment_method: 'credit_card',
    device_fingerprint: 'fp_abc123',
    ip_address: '192.168.1.100',
    location: 'Lima, Peru',
    created_at: '2025-12-09T10:30:00Z',
    processed_at: '2025-12-09T10:30:05Z',
    api_key_id: 'key_001'
  },
  {
    id: 'test_002',
    transaction_id: 'test_002',
    merchant_id: 'merchant_002',
    customer_id: 'customer_002',
    amount: 89.99,
    currency: 'PEN',
    risk_score: 0.12,
    risk_level: 'low',
    is_fraud: false,
    fraud_probability: 0.12,
    payment_method: 'debit_card',
    device_fingerprint: 'fp_def456',
    ip_address: '181.67.45.123',
    location: 'Arequipa, Peru',
    created_at: '2025-12-09T10:25:00Z',
    processed_at: '2025-12-09T10:25:03Z',
    api_key_id: 'key_002'
  },
  {
    id: 'test_003',
    transaction_id: 'test_003',
    merchant_id: 'merchant_003',
    customer_id: 'customer_003',
    amount: 567.50,
    currency: 'PEN',
    risk_score: 0.94,
    risk_level: 'critical',
    is_fraud: true,
    fraud_probability: 0.94,
    payment_method: 'bank_transfer',
    device_fingerprint: null,
    ip_address: '45.33.12.89',
    location: 'Unknown',
    created_at: '2025-12-09T10:20:00Z',
    processed_at: '2025-12-09T10:20:08Z',
    api_key_id: 'key_003'
  },
  {
    id: 'test_004',
    transaction_id: 'test_004',
    merchant_id: 'merchant_001',
    customer_id: 'customer_004',
    amount: 234.75,
    currency: 'PEN',
    risk_score: 0.65,
    risk_level: 'medium',
    is_fraud: false,
    fraud_probability: 0.65,
    payment_method: 'digital_wallet',
    device_fingerprint: 'fp_ghi789',
    ip_address: '192.168.50.200',
    location: 'Cusco, Peru',
    created_at: '2025-12-09T10:15:00Z',
    processed_at: '2025-12-09T10:15:04Z',
    api_key_id: 'key_001'
  },
  {
    id: 'test_005',
    transaction_id: 'test_005',
    merchant_id: 'merchant_004',
    customer_id: 'customer_005',
    amount: 45.00,
    currency: 'PEN',
    risk_score: 0.08,
    risk_level: 'low',
    is_fraud: false,
    fraud_probability: 0.08,
    payment_method: 'credit_card',
    device_fingerprint: 'fp_jkl012',
    ip_address: '200.121.180.45',
    location: 'Trujillo, Peru',
    created_at: '2025-12-09T10:10:00Z',
    processed_at: '2025-12-09T10:10:02Z',
    api_key_id: 'key_004'
  }
];

/**
 * Model Info Mock Data (para mostrar en dashboard)
 */
export const MOCK_MODEL_INFO = {
  model_version: 'v2.1.0-test',
  model_type: 'XGBoost',
  feature_count: 45,
  accuracy: 0.887,
  precision: 0.832,
  recall: 0.765,
  f1_score: 0.798,
  updated_at: '2025-12-08T14:30:00Z',
  stage: 'testing',
  metrics: {
    auc_roc: 0.923,
    auc_pr: 0.856,
    false_positive_rate: 0.034,
    false_negative_rate: 0.089
  }
};

/**
 * API Keys Mock Data
 */
export const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'test_key_001',
    key_name: 'Test Production Key',
    key_prefix: 'dys_test_123',
    status: 'active',
    organization_id: 'org_test_001',
    created_at: '2025-12-01T10:00:00Z',
    last_used_at: '2025-12-09T09:45:00Z',
    expires_at: '2026-12-01T10:00:00Z',
    is_active: true
  },
  {
    id: 'test_key_002', 
    key_name: 'Test Development Key',
    key_prefix: 'dys_test_fed',
    status: 'active',
    organization_id: 'org_test_001',
    created_at: '2025-12-05T14:30:00Z',
    last_used_at: '2025-12-08T16:20:00Z',
    expires_at: '2026-12-05T14:30:00Z',
    is_active: true
  },
  {
    id: 'test_key_003',
    key_name: 'Test Staging Key',
    key_prefix: 'dys_test_abc',
    status: 'revoked',
    organization_id: 'org_test_001',
    created_at: '2025-11-25T11:15:00Z', 
    last_used_at: null,
    expires_at: '2026-11-25T11:15:00Z',
    is_active: false
  }
];

/**
 * User Profile Mock Data
 */
export const MOCK_USER_PROFILE = {
  id: 'test_user_001',
  email: 'usuario1@dygsom.pe',
  name: 'Usuario Test',
  company: 'DYGSOM Testing',
  role: 'admin',
  created_at: '2025-11-01T10:00:00Z',
  last_login: '2025-12-09T08:30:00Z',
  api_quota: {
    current_usage: 1247,
    monthly_limit: 10000,
    reset_date: '2025-01-01T00:00:00Z'
  },
  subscription: {
    plan: 'enterprise',
    status: 'active',
    expires_at: '2025-12-31T23:59:59Z'
  }
};

/**
 * Transaction Simulation - genera transacciones aleatorias para testing
 */
export function generateMockTransaction(id?: string): Transaction {
  const riskLevels = ['low', 'medium', 'high', 'critical'] as const;
  const paymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet'] as const;
  
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  // Fraud score correlacionado con risk level
  const fraudScore = riskLevel === 'low' ? Math.random() * 0.3 :
                    riskLevel === 'medium' ? 0.3 + Math.random() * 0.3 :
                    riskLevel === 'high' ? 0.6 + Math.random() * 0.25 :
                    0.85 + Math.random() * 0.15; // critical
  
  const transactionId = id || `test_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: transactionId,
    transaction_id: transactionId,
    merchant_id: `merchant_${String(Math.floor(Math.random() * 10)).padStart(3, '0')}`,
    customer_id: `customer_${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.round((Math.random() * 2000 + 10) * 100) / 100,
    currency: 'PEN',
    risk_score: Math.round(fraudScore * 1000) / 1000,
    risk_level: riskLevel,
    is_fraud: fraudScore > 0.7,
    fraud_probability: Math.round(fraudScore * 1000) / 1000,
    payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    device_fingerprint: Math.random() > 0.2 ? `fp_${Math.random().toString(36).substr(2, 6)}` : null,
    ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location: ['Lima, Peru', 'Arequipa, Peru', 'Cusco, Peru', 'Trujillo, Peru', 'Unknown'][Math.floor(Math.random() * 5)],
    created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    processed_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 5000).toISOString(),
    api_key_id: `key_${String(Math.floor(Math.random() * 5)).padStart(3, '0')}`
  };
}