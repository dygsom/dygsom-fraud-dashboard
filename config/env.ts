/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are present
 * and provides type-safe access to them.
 */

import { z } from 'zod';

const envSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_NAME: z.string().default('DYGSOM Fraud Dashboard'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),

  // API Backend
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_TIMEOUT: z.string().default('30000').transform(val => parseInt(val, 10)),

  // Authentication
  NEXT_PUBLIC_TOKEN_STORAGE_KEY: z.string().default('dygsom_auth_token'),
  NEXT_PUBLIC_TOKEN_EXPIRY_HOURS: z.string().default('24').transform(val => parseInt(val, 10)),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('true').transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_LOGGING: z.string().default('true').transform(val => val === 'true'),

  // Logging
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NEXT_PUBLIC_LOG_TO_CONSOLE: z.string().default('true').transform(val => val === 'true'),

  // UI Configuration
  NEXT_PUBLIC_ITEMS_PER_PAGE: z.string().default('20').transform(val => parseInt(val, 10)),
  NEXT_PUBLIC_CHART_REFRESH_INTERVAL: z.string().default('30').transform(val => parseInt(val, 10)),

  // DevTools
  NEXT_PUBLIC_ENABLE_DEVTOOLS: z.string().default('false').transform(val => val === 'true'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `Invalid environment variables:\n${missingVars}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Safe to use throughout the application
 */
export function getEnv(): Env {
  return validateEnv();
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';
}

/**
 * Check if running in staging mode
 */
export function isStaging(): boolean {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';
}
