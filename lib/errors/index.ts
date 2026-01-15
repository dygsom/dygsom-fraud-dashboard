/**
 * Error Handling Utilities
 * 
 * Centralized error handling system for consistent error management
 * across the application. Provides error classification, logging,
 * and user-friendly error messages.
 * 
 * @module ErrorHandling
 * @version 1.0.0
 */

import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants';

/** Error severity levels */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

/** Error categories for classification */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/** Base application error interface */
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly timestamp: string;
  readonly context?: Record<string, unknown>;
  readonly originalError?: Error;
}

/** Application Error class */
export class ApplicationError extends Error implements AppError {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: Error;

  constructor(
    code: string,
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.originalError = originalError;

    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError);
    }
  }
}

/** HTTP Error classifications */
export const HTTP_ERROR_MAP = {
  400: {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: ERROR_MESSAGES.VALIDATION_ERROR
  },
  401: {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    message: ERROR_MESSAGES.UNAUTHORIZED
  },
  403: {
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    message: ERROR_MESSAGES.FORBIDDEN
  },
  404: {
    category: ErrorCategory.CLIENT,
    severity: ErrorSeverity.LOW,
    message: ERROR_MESSAGES.NOT_FOUND
  },
  408: {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: ERROR_MESSAGES.TIMEOUT_ERROR
  },
  500: {
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.CRITICAL,
    message: ERROR_MESSAGES.SERVER_ERROR
  },
  502: {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.HIGH,
    message: ERROR_MESSAGES.NETWORK_ERROR
  },
  503: {
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    message: ERROR_MESSAGES.SERVER_ERROR
  }
} as const;

/**
 * Classifies an error based on its characteristics
 * 
 * @param error - The error to classify
 * @returns Classified error information
 */
export function classifyError(error: unknown): {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
} {
  // Handle ApplicationError instances
  if (error instanceof ApplicationError) {
    return {
      category: error.category,
      severity: error.severity,
      message: error.message
    };
  }

  // Handle HTTP response errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    const httpError = HTTP_ERROR_MAP[status as keyof typeof HTTP_ERROR_MAP];
    
    if (httpError) {
      return httpError;
    }
  }

  // Handle network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: ERROR_MESSAGES.NETWORK_ERROR
      };
    }

    if (message.includes('timeout')) {
      return {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: ERROR_MESSAGES.TIMEOUT_ERROR
      };
    }
  }

  // Default classification for unknown errors
  return {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: 'An unexpected error occurred'
  };
}

/**
 * Creates a standardized ApplicationError from any error type
 * 
 * @param error - The original error
 * @param context - Additional context information
 * @returns Standardized ApplicationError instance
 */
export function createAppError(
  error: unknown,
  context?: Record<string, unknown>
): ApplicationError {
  const classification = classifyError(error);
  const code = `${classification.category.toUpperCase()}_ERROR`;
  const originalError = error instanceof Error ? error : undefined;

  return new ApplicationError(
    code,
    classification.message,
    classification.category,
    classification.severity,
    context,
    originalError
  );
}

/**
 * Handles and logs an error, returning a user-friendly message
 * 
 * @param error - The error to handle
 * @param context - Additional context for logging
 * @returns User-friendly error message
 */
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): string {
  const appError = createAppError(error, context);

  // Log the error with appropriate level based on severity
  switch (appError.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error('Critical error occurred', {
        code: appError.code,
        message: appError.message,
        category: appError.category,
        context: appError.context,
        stack: appError.originalError?.stack
      });
      break;
    case ErrorSeverity.HIGH:
      logger.error('High severity error occurred', {
        code: appError.code,
        message: appError.message,
        category: appError.category,
        context: appError.context
      });
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn('Medium severity error occurred', {
        code: appError.code,
        message: appError.message,
        category: appError.category,
        context: appError.context
      });
      break;
    case ErrorSeverity.LOW:
      logger.info('Low severity error occurred', {
        code: appError.code,
        message: appError.message,
        category: appError.category,
        context: appError.context
      });
      break;
  }

  return appError.message;
}

/**
 * Error boundary helper for React components
 * 
 * @param error - The error that occurred
 * @param errorInfo - React error info
 * @param componentName - Name of the component where error occurred
 */
export function handleReactError(
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName?: string
): void {
  const appError = new ApplicationError(
    'REACT_ERROR',
    `React component error: ${error.message}`,
    ErrorCategory.CLIENT,
    ErrorSeverity.HIGH,
    {
      componentName,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    },
    error
  );

  logger.error('React component error boundary triggered', {
    code: appError.code,
    message: appError.message,
    componentName,
    componentStack: errorInfo.componentStack,
    stack: error.stack
  });
}

/**
 * Validates and sanitizes error data for safe logging
 * 
 * @param data - Data to sanitize
 * @returns Sanitized data safe for logging
 */
export function sanitizeErrorData(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 1000) {
      sanitized[key] = `${value.substring(0, 100)}... [TRUNCATED]`;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}