/**
 * Data Mode Configuration
 * 
 * Manages hybrid data system for fraud detection dashboard:
 * - TEST MODE: Special test user receives mockup data for safe testing
 * - PRODUCTION MODE: All other authenticated users receive real API data
 * 
 * @module DataModeConfig
 * @version 1.0.0
 */

/** Data mode types */
export type DataMode = 'production' | 'test';

/** Configuration constants for hybrid data system */
export const DATA_MODE_CONFIG = {
  /** Test user email that triggers mockup data mode */
  TEST_USER_EMAIL: 'usuario1@dygsom.pe' as const,
  /** Test user password (safe to expose as it's for mockup data only) */
  TEST_USER_PASSWORD: 'SecurePASS123' as const,
  
  /** Available data modes */
  MODE: {
    /** Production mode - serves real API data */
    PRODUCTION: 'production',
    /** Test mode - serves mockup data for testing */
    TEST: 'test',
  } as const
} as const;

/**
 * Determines the appropriate data mode based on user authentication
 * 
 * @param userEmail - The authenticated user's email address
 * @returns The data mode: 'test' for special user, 'production' for all others
 * 
 * @example
 * ```typescript
 * const mode = getDataMode('user@example.com'); // 'production'
 * const testMode = getDataMode('usuario1@dygsom.pe'); // 'test'
 * ```
 */
export function getDataMode(userEmail?: string | null): DataMode {
  // Input validation - null/undefined/empty string defaults to production
  if (!userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') {
    return DATA_MODE_CONFIG.MODE.PRODUCTION;
  }
  
  // Normalize email for comparison (case-insensitive, trimmed)
  const normalizedEmail = userEmail.trim().toLowerCase();
  const testUserEmail = DATA_MODE_CONFIG.TEST_USER_EMAIL.toLowerCase();
  
  // Special test user gets mockup data
  if (normalizedEmail === testUserEmail) {
    return DATA_MODE_CONFIG.MODE.TEST;
  }
  
  // All other authenticated users get real API data
  return DATA_MODE_CONFIG.MODE.PRODUCTION;
}

/**
 * Checks if the current user should receive test/mockup data
 * 
 * @param userEmail - The authenticated user's email address
 * @returns true if user should receive mockup data, false otherwise
 * 
 * @example
 * ```typescript
 * if (isTestMode(user.email)) {
 *   return mockData;
 * }
 * ```
 */
export function isTestMode(userEmail?: string | null): boolean {
  return getDataMode(userEmail) === DATA_MODE_CONFIG.MODE.TEST;
}

/**
 * Checks if the current user should receive production/real data
 * 
 * @param userEmail - The authenticated user's email address
 * @returns true if user should receive real API data, false otherwise
 * 
 * @example
 * ```typescript
 * if (isProductionMode(user.email)) {
 *   return await realApi.getData();
 * }
 * ```
 */
export function isProductionMode(userEmail?: string | null): boolean {
  return getDataMode(userEmail) === DATA_MODE_CONFIG.MODE.PRODUCTION;
}

/**
 * Gets a human-readable label for the current data mode
 * 
 * @param userEmail - The authenticated user's email address
 * @returns Descriptive label for the data mode
 */
export function getDataModeLabel(userEmail?: string | null): string {
  return isTestMode(userEmail) ? 'Modo Test (Datos Simulados)' : 'Modo Producción (Datos Reales)';
}