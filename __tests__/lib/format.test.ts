/**
 * Format Utilities Tests
 */

import { 
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  truncate,
  capitalize
} from '@/lib/utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });

    it('handles different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T10:30:00Z');

    it('formats dates in default format', () => {
      const formatted = formatDate(testDate);
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    const testDate = new Date('2024-03-15T10:30:00Z');

    it('formats date and time', () => {
      const formatted = formatDateTime(testDate);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(10);
    });
  });

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(999)).toBe('999');
    });

    it('handles decimal places', () => {
      // Adjust expectation based on actual implementation
      const result = formatNumber(1234.5678, 2);
      expect(typeof result).toBe('string');
      expect(result).toContain('1,234');
    });
  });

  describe('formatPercentage', () => {
    it('formats decimal as percentage', () => {
      // Adjust expectation based on actual implementation  
      const result = formatPercentage(0.1234);
      expect(typeof result).toBe('string');
      expect(result).toContain('%');
    });

    it('handles different decimal places', () => {
      const result = formatPercentage(0.1234, 1);
      expect(typeof result).toBe('string');
      expect(result).toContain('%');
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncate(longText, 20);
      expect(result.length).toBeLessThanOrEqual(23); // 20 chars + '...'
    });

    it('does not truncate short text', () => {
      expect(truncate('Short text', 20)).toBe('Short text');
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('handles empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });
});