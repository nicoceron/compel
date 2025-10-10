/**
 * Unit tests for AutoFillManager
 */

import { AutoFillManager } from '../autoFillManager';
import { CheckIn } from '@/types';

describe('AutoFillManager', () => {
  const createCheckIn = (date: string, value: number, status: 'success' | 'missed' = 'success'): CheckIn => ({
    id: `${date}-${value}`,
    goal_id: 'test-goal',
    user_id: 'test-user',
    check_in_date: date,
    value,
    status,
    notes: null,
    evidence_url: null,
    created_at: new Date().toISOString(),
  });

  describe('generateFilledData', () => {
    it('should create flat line for missing days', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-03', 20),
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = AutoFillManager.generateFilledData(checkIns, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2025-01-01',
        value: 10,
        isActual: true,
        cumulativeValue: 10,
      });
      expect(result[1]).toEqual({
        date: '2025-01-02',
        value: 0,
        isActual: false,
        cumulativeValue: 10, // Stays flat
      });
      expect(result[2]).toEqual({
        date: '2025-01-03',
        value: 20,
        isActual: true,
        cumulativeValue: 30,
      });
    });

    it('should maintain cumulative values correctly', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 5),
        createCheckIn('2025-01-01', 5), // Same day, sum = 10
        createCheckIn('2025-01-03', 15),
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = AutoFillManager.generateFilledData(checkIns, startDate, endDate, 'sum');

      expect(result[0].cumulativeValue).toBe(10); // 5 + 5
      expect(result[1].cumulativeValue).toBe(10); // Flat
      expect(result[2].cumulativeValue).toBe(25); // 10 + 15
    });

    it('should use last method when specified', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 5),
        createCheckIn('2025-01-01', 10), // Last wins
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-01');

      const result = AutoFillManager.generateFilledData(checkIns, startDate, endDate, 'last');

      expect(result[0].value).toBe(10);
      expect(result[0].cumulativeValue).toBe(10);
    });

    it('should skip missed check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20, 'missed'),
        createCheckIn('2025-01-03', 15),
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = AutoFillManager.generateFilledData(checkIns, startDate, endDate);

      expect(result[0].cumulativeValue).toBe(10);
      expect(result[1].isActual).toBe(false); // Missed, so auto-filled
      expect(result[1].cumulativeValue).toBe(10); // Flat
      expect(result[2].cumulativeValue).toBe(25);
    });
  });

  describe('getCurrentValue', () => {
    it('should sum all successful check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20),
        createCheckIn('2025-01-03', 15),
      ];

      const result = AutoFillManager.getCurrentValue(checkIns);

      expect(result).toBe(45);
    });

    it('should skip missed check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20, 'missed'),
        createCheckIn('2025-01-03', 15),
      ];

      const result = AutoFillManager.getCurrentValue(checkIns);

      expect(result).toBe(25); // 10 + 15
    });

    it('should handle check-ins with default value', () => {
      const checkIns: CheckIn[] = [
        { ...createCheckIn('2025-01-01', 1), value: null } as any,
        createCheckIn('2025-01-02', 10),
      ];

      const result = AutoFillManager.getCurrentValue(checkIns);

      expect(result).toBe(11); // 1 (default) + 10
    });

    it('should return 0 for empty check-ins', () => {
      const result = AutoFillManager.getCurrentValue([]);

      expect(result).toBe(0);
    });
  });

  describe('getLastCheckInDate', () => {
    it('should return the most recent check-in date', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-03', 20),
        createCheckIn('2025-01-02', 15),
      ];

      const result = AutoFillManager.getLastCheckInDate(checkIns);

      expect(result).not.toBeNull();
      expect(result!.toISOString().split('T')[0]).toBe('2025-01-03');
    });

    it('should only consider successful check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-03', 20, 'missed'),
      ];

      const result = AutoFillManager.getLastCheckInDate(checkIns);

      expect(result).not.toBeNull();
      expect(result!.toISOString().split('T')[0]).toBe('2025-01-01');
    });

    it('should return null for empty check-ins', () => {
      const result = AutoFillManager.getLastCheckInDate([]);

      expect(result).toBeNull();
    });

    it('should return null when only missed check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10, 'missed'),
      ];

      const result = AutoFillManager.getLastCheckInDate(checkIns);

      expect(result).toBeNull();
    });
  });

  describe('getDaysSinceLastCheckIn', () => {
    it('should return Infinity for empty check-ins', () => {
      const result = AutoFillManager.getDaysSinceLastCheckIn([]);

      expect(result).toBe(Infinity);
    });

    it('should return Infinity when only missed check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10, 'missed'),
      ];

      const result = AutoFillManager.getDaysSinceLastCheckIn(checkIns);

      expect(result).toBe(Infinity);
    });

    // Note: Can't easily test with "now" without mocking Date
  });
});
