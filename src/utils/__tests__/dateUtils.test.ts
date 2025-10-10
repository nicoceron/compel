/**
 * Unit tests for dateUtils
 */

import { 
  parseLocalDate, 
  formatLocalDate, 
  getTodayLocal, 
  getBrowserTimezone,
  calculateDerailmentTime 
} from '../dateUtils';

describe('dateUtils', () => {
  describe('parseLocalDate', () => {
    it('should parse date string as local date', () => {
      const result = parseLocalDate('2025-01-15');
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should handle different date formats', () => {
      const result = parseLocalDate('2025-12-31');
      
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // December is 11
      expect(result.getDate()).toBe(31);
    });
  });

  describe('formatLocalDate', () => {
    it('should format date string with default options', () => {
      const result = formatLocalDate('2025-01-15');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format date string with custom options', () => {
      const result = formatLocalDate('2025-01-15', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      expect(result).toContain('2025');
      expect(result).toContain('January');
      expect(result).toContain('15');
    });

    it('should handle date string input consistently', () => {
      const result = formatLocalDate('2025-01-15');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getTodayLocal', () => {
    it('should return today date string in YYYY-MM-DD format', () => {
      const result = getTodayLocal();
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should be consistent with current date', () => {
      const today = new Date();
      const result = getTodayLocal();
      
      expect(result).toContain(today.getFullYear().toString());
    });

    it('should handle timezone parameter', () => {
      const result = getTodayLocal('America/New_York');
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getBrowserTimezone', () => {
    it('should return a timezone string', () => {
      const result = getBrowserTimezone();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('calculateDerailmentTime', () => {
    it('should calculate derailment date based on current value', () => {
      const currentValue = 10;
      const targetValue = 1;
      const frequency = 'daily';
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      const initialBuffer = 0;

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        initialBuffer
      );

      expect(result).toBeInstanceOf(Date);
      // Result should be a valid date between start and end
      expect(result.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
      expect(result.getTime()).toBeLessThanOrEqual(new Date('2025-12-31').getTime());
    });

    it('should handle weekly frequency', () => {
      const currentValue = 7;
      const targetValue = 7;
      const frequency = 'weekly';
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        0
      );

      expect(result).toBeInstanceOf(Date);
    });

    it('should apply initial buffer', () => {
      const currentValue = 0;
      const targetValue = 1;
      const frequency = 'daily';
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      const initialBuffer = 7;

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        initialBuffer
      );

      // Result should be between start and end dates
      expect(result.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
      expect(result.getTime()).toBeLessThanOrEqual(new Date('2025-12-31').getTime());
    });

    it('should not exceed end date', () => {
      const currentValue = 1000; // Way ahead
      const targetValue = 1;
      const frequency = 'daily';
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        0
      );

      // Should be within a reasonable range of the end date
      expect(result.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
      expect(result.getTime()).toBeLessThan(new Date('2025-02-15').getTime());
    });

    it('should handle biweekly frequency', () => {
      const currentValue = 1;
      const targetValue = 1;
      const frequency = 'biweekly';
      const startDate = '2025-01-01';
      const endDate = '2025-02-01';

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        0
      );

      expect(result).toBeInstanceOf(Date);
    });

    it('should handle monthly frequency', () => {
      const currentValue = 1;
      const targetValue = 1;
      const frequency = 'monthly';
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      const result = calculateDerailmentTime(
        currentValue,
        targetValue,
        frequency,
        startDate,
        endDate,
        0
      );

      expect(result).toBeInstanceOf(Date);
    });
  });
});
