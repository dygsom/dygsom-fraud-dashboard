/**
 * JWT Utilities
 * 
 * Functions for handling JWT tokens, parsing, and expiration checking
 */

import { AUTH_CONFIG } from '@/config/constants';
import { logger } from '@/lib/logger';

interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Parse JWT token to extract payload
 */
export function parseJWTPayload(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      throw new Error('Invalid token format');
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return payload as JWTPayload;
  } catch (error) {
    logger.error('Failed to parse JWT token', { error });
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get token expiration time in minutes from now
 */
export function getTokenExpirationMinutes(token: string): number | null {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return null;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const minutesUntilExpiry = Math.floor((payload.exp - currentTime) / 60);
  return minutesUntilExpiry;
}

/**
 * Check if token needs refresh warning
 */
export function shouldShowRefreshWarning(token: string): boolean {
  const minutesUntilExpiry = getTokenExpirationMinutes(token);
  if (minutesUntilExpiry === null) {
    return false;
  }
  
  return minutesUntilExpiry <= AUTH_CONFIG.refreshWarningMinutes && minutesUntilExpiry > 0;
}

/**
 * Check if token should trigger auto-logout
 */
export function shouldAutoLogout(token: string): boolean {
  const minutesUntilExpiry = getTokenExpirationMinutes(token);
  if (minutesUntilExpiry === null) {
    return true;
  }
  
  return minutesUntilExpiry <= AUTH_CONFIG.autoLogoutGraceMinutes;
}

/**
 * Format expiration time for display
 */
export function formatExpirationTime(token: string): string {
  const payload = parseJWTPayload(token);
  if (!payload) {
    return 'Invalid token';
  }
  
  const expirationDate = new Date(payload.exp * 1000);
  return expirationDate.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}