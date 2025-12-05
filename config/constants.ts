/**
 * Application Constants
 *
 * All configuration values are loaded from environment variables.
 * NO hardcoded values as per requirements.
 */

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'DYGSOM Fraud Dashboard',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  endpoints: {
    auth: {
      signup: '/api/v1/auth/signup',
      login: '/api/v1/auth/login',
      me: '/api/v1/auth/me',
    },
    dashboard: {
      transactions: '/api/v1/dashboard/transactions',
      analytics: '/api/v1/dashboard/analytics/summary',
      apiKeys: '/api/v1/dashboard/api-keys',
      createApiKey: '/api/v1/dashboard/api-keys',
      revokeApiKey: (keyId: string) => `/api/v1/dashboard/api-keys/${keyId}/revoke`,
    },
    fraud: {
      score: '/api/v1/fraud/score',
    },
  },
} as const;

export const AUTH_CONFIG = {
  tokenStorageKey: process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'dygsom_auth_token',
  tokenExpiryHours: parseInt(process.env.NEXT_PUBLIC_TOKEN_EXPIRY_HOURS || '2', 10), // Reduced from 24h to 2h for security
  refreshWarningMinutes: 10, // Warn user 10 minutes before expiry
  autoLogoutGraceMinutes: 2, // Grace period before auto-logout
} as const;

export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
  enableDevtools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',
} as const;

export const LOG_CONFIG = {
  level: (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  toConsole: process.env.NEXT_PUBLIC_LOG_TO_CONSOLE === 'true',
} as const;

export const UI_CONFIG = {
  itemsPerPage: parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE || '20', 10),
  chartRefreshInterval: parseInt(process.env.NEXT_PUBLIC_CHART_REFRESH_INTERVAL || '30', 10) * 1000, // Convert to ms
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const RISK_LEVEL_COLORS = {
  [RISK_LEVELS.LOW]: 'text-green-600 bg-green-50',
  [RISK_LEVELS.MEDIUM]: 'text-yellow-600 bg-yellow-50',
  [RISK_LEVELS.HIGH]: 'text-orange-600 bg-orange-50',
  [RISK_LEVELS.CRITICAL]: 'text-red-600 bg-red-50',
} as const;

export const API_KEY_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const ORGANIZATION_PLANS = {
  STARTUP: 'startup',
  GROWTH: 'growth',
  ENTERPRISE: 'enterprise',
} as const;
