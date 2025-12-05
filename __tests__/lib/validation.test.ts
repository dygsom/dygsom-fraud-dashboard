/**
 * Validation Utilities Tests
 */

import { 
  isValidEmail, 
  validatePassword
} from '@/lib/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result1 = validatePassword('StrongPass123!');
      expect(result1.isValid).toBe(true);
      
      const result2 = validatePassword('MySecure@Pass1');
      expect(result2.isValid).toBe(true);
    });

    it('rejects weak passwords', () => {
      const result1 = validatePassword('weak');
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);
      
      const result2 = validatePassword('12345678');
      expect(result2.isValid).toBe(false);
      
      const result3 = validatePassword('onlylowercase');
      expect(result3.isValid).toBe(false);
      
      const result4 = validatePassword('ONLYUPPERCASE');
      expect(result4.isValid).toBe(false);
    });
  });


});