/**
 * Application Constants
 * 
 * Central location for all application-wide constants, configuration values,
 * and enums to ensure consistency and maintainability.
 * 
 * @module Constants
 * @version 1.0.0
 */

/** API Configuration */
export const API_CONFIG = {
  /** Base URL for the fraud detection API */
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  /** API timeout settings (ms) */
  TIMEOUTS: {
    DEFAULT: 10000,
    LONG_RUNNING: 30000,
    QUICK: 5000
  },
  
  /** API retry configuration */
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2
  }
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1
} as const;

/** Date and time formatting */
export const DATE_FORMATS = {
  /** ISO date format for API requests */
  API_DATE: 'YYYY-MM-DD',
  /** Human readable date display */
  DISPLAY_DATE: 'MMM DD, YYYY',
  /** Full datetime with timezone */
  FULL_DATETIME: 'YYYY-MM-DD HH:mm:ss Z'
} as const;

/** Risk level configuration */
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

/** Risk level thresholds and colors */
export const RISK_CONFIG = {
  THRESHOLDS: {
    [RISK_LEVELS.LOW]: { min: 0, max: 0.25, color: 'green' },
    [RISK_LEVELS.MEDIUM]: { min: 0.25, max: 0.6, color: 'yellow' },
    [RISK_LEVELS.HIGH]: { min: 0.6, max: 0.85, color: 'orange' },
    [RISK_LEVELS.CRITICAL]: { min: 0.85, max: 1.0, color: 'red' }
  },
  COLORS: {
    [RISK_LEVELS.LOW]: '#22c55e',
    [RISK_LEVELS.MEDIUM]: '#eab308', 
    [RISK_LEVELS.HIGH]: '#f97316',
    [RISK_LEVELS.CRITICAL]: '#ef4444'
  }
} as const;

/** Payment method constants */
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  DIGITAL_WALLET: 'digital_wallet',
  CRYPTOCURRENCY: 'cryptocurrency'
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/** Currency codes */
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  PEN: 'PEN',
  GBP: 'GBP',
  JPY: 'JPY'
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

/** Application feature flags */
export const FEATURE_FLAGS = {
  /** Enable hybrid data system for testing */
  ENABLE_HYBRID_MODE: process.env.NEXT_PUBLIC_ENABLE_HYBRID_MODE !== 'false',
  
  /** Enable advanced analytics features */
  ENABLE_ADVANCED_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS === 'true',
  
  /** Enable real-time notifications */
  ENABLE_REAL_TIME: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
  
  /** Enable debug logging in production */
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_LOGGING === 'true'
} as const;

/** Error messages */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.'
} as const;

/** Success messages */
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  EXPORT_COMPLETED: 'Export completed successfully',
  REFRESH_COMPLETED: 'Data refreshed successfully'
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'dygsom_auth_token',
  USER_PREFERENCES: 'dygsom_user_preferences',
  THEME: 'dygsom_theme',
  LANGUAGE: 'dygsom_language',
  DASHBOARD_LAYOUT: 'dygsom_dashboard_layout'
} as const;

/** Animation and UI constants */
export const UI_CONFIG = {
  /** Debounce delays (ms) */
  DEBOUNCE: {
    SEARCH: 300,
    FILTER: 500,
    RESIZE: 150
  },
  
  /** Animation durations (ms) */
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  /** Z-index layers */
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    TOOLTIP: 1070,
    TOAST: 1080,
    DATA_MODE_INDICATOR: 1090
  }
} as const;

/** Export all constants as a single object for convenience */
export const CONSTANTS = {
  API_CONFIG,
  PAGINATION,
  DATE_FORMATS,
  RISK_LEVELS,
  RISK_CONFIG,
  PAYMENT_METHODS,
  CURRENCIES,
  FEATURE_FLAGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  UI_CONFIG
} as const;