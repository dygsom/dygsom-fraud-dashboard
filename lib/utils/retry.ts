/**
 * Retry Utilities
 *
 * Provides robust retry logic for network requests and async operations.
 * Implements exponential backoff and configurable retry policies.
 */

import { logger } from '@/lib/logger';

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    if (!error.status_code) return true; // Network error
    return error.status_code >= 500 && error.status_code < 600;
  },
};

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (attempt > 0) {
        logger.info('Operation succeeded after retry', {
          attempt,
          totalAttempts: attempt + 1,
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've reached max attempts
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Don't retry if error doesn't match retry condition
      if (config.retryCondition && !config.retryCondition(error)) {
        logger.info('Error does not meet retry condition', { error });
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffFactor, attempt),
        config.maxDelayMs
      );
      
      logger.warn('Operation failed, retrying...', {
        attempt: attempt + 1,
        maxRetries: config.maxRetries,
        delayMs: delay,
        error: error instanceof Error ? error.message : String(error),
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  logger.error('Operation failed after all retries', {
    maxRetries: config.maxRetries,
    finalError: lastError,
  });
  
  throw lastError;
}

/**
 * Create a retryable version of an async function
 */
export function makeRetryable<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: Partial<RetryOptions> = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}