/**
 * JWT Utilities Tests
 */

import { 
  parseJWTPayload, 
  isTokenExpired, 
  getTokenExpirationMinutes, 
  shouldShowRefreshWarning,
  shouldAutoLogout,
  formatExpirationTime 
} from '@/lib/utils/jwt';

describe('JWT Utilities', () => {
  // Mock JWT token (not a real token, just for testing structure)
  const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
  const mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.signature';
  const invalidToken = 'invalid.token.format';

  describe('parseJWTPayload', () => {
    it('parses valid JWT token', () => {
      const payload = parseJWTPayload(mockValidToken);
      
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('1234567890');
      expect(payload?.email).toBe('test@example.com');
      expect(payload?.exp).toBe(9999999999);
    });

    it('returns null for invalid token', () => {
      const payload = parseJWTPayload(invalidToken);
      expect(payload).toBeNull();
    });

    it('returns null for malformed token', () => {
      const payload = parseJWTPayload('not.a.token');
      expect(payload).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('returns false for non-expired token', () => {
      const expired = isTokenExpired(mockValidToken);
      expect(expired).toBe(false);
    });

    it('returns true for expired token', () => {
      const expired = isTokenExpired(mockExpiredToken);
      expect(expired).toBe(true);
    });

    it('returns true for invalid token', () => {
      const expired = isTokenExpired(invalidToken);
      expect(expired).toBe(true);
    });
  });

  describe('getTokenExpirationMinutes', () => {
    it('returns minutes for valid token', () => {
      const minutes = getTokenExpirationMinutes(mockValidToken);
      expect(typeof minutes).toBe('number');
      expect(minutes).toBeGreaterThan(0);
    });

    it('returns negative minutes for expired token', () => {
      const minutes = getTokenExpirationMinutes(mockExpiredToken);
      expect(typeof minutes).toBe('number');
      expect(minutes).toBeLessThan(0);
    });

    it('returns null for invalid token', () => {
      const minutes = getTokenExpirationMinutes(invalidToken);
      expect(minutes).toBeNull();
    });
  });

  describe('shouldShowRefreshWarning', () => {
    it('returns false for token with long expiry', () => {
      const shouldWarn = shouldShowRefreshWarning(mockValidToken);
      expect(shouldWarn).toBe(false);
    });

    it('returns false for invalid token', () => {
      const shouldWarn = shouldShowRefreshWarning(invalidToken);
      expect(shouldWarn).toBe(false);
    });
  });

  describe('shouldAutoLogout', () => {
    it('returns false for non-expired token', () => {
      const shouldLogout = shouldAutoLogout(mockValidToken);
      expect(shouldLogout).toBe(false);
    });

    it('returns true for expired token', () => {
      const shouldLogout = shouldAutoLogout(mockExpiredToken);
      expect(shouldLogout).toBe(true);
    });

    it('returns true for invalid token', () => {
      const shouldLogout = shouldAutoLogout(invalidToken);
      expect(shouldLogout).toBe(true);
    });
  });

  describe('formatExpirationTime', () => {
    it('formats expiration time for valid token', () => {
      const formatted = formatExpirationTime(mockValidToken);
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/); // DD/MM/YYYY format
    });

    it('returns error message for invalid token', () => {
      const formatted = formatExpirationTime(invalidToken);
      expect(formatted).toBe('Invalid token');
    });
  });
});