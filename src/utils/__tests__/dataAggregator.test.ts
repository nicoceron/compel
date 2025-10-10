/**
 * Unit tests for DataAggregator
 */

import { DataAggregator } from '../dataAggregator';
import { CheckIn } from '@/types';

describe('DataAggregator', () => {
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

  describe('aggregateByDay', () => {
    it('should sum values by default', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-02', 20),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'sum');

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(25); // 10 + 15
      expect(result[1].value).toBe(20);
    });

    it('should take max value when method is max', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-01', 12),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'max');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(15);
    });

    it('should take min value when method is min', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-01', 12),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'min');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(10);
    });

    it('should take last value when method is last', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-01', 12),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'last');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(12);
    });

    it('should take first value when method is first', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-01', 12),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'first');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(10);
    });

    it('should calculate average when method is average', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 20),
        createCheckIn('2025-01-01', 30),
      ];

      const result = DataAggregator.aggregateByDay(checkIns, 'average');

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(20);
    });

    it('should skip missed check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15, 'missed'),
        createCheckIn('2025-01-02', 20),
      ];

      const result = DataAggregator.aggregateByDay(checkIns);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(10); // Missed not included
      expect(result[1].value).toBe(20);
    });

    it('should track count of aggregated check-ins', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 15),
        createCheckIn('2025-01-01', 20),
      ];

      const result = DataAggregator.aggregateByDay(checkIns);

      expect(result[0].count).toBe(3);
      expect(result[0].originalCheckIns).toHaveLength(3);
    });

    it('should sort results by date', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-03', 30),
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20),
      ];

      const result = DataAggregator.aggregateByDay(checkIns);

      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
    });
  });

  describe('getCumulativeValues', () => {
    it('should calculate cumulative sums correctly', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20),
        createCheckIn('2025-01-03', 15),
      ];

      const result = DataAggregator.getCumulativeValues(checkIns);

      expect(result).toHaveLength(3);
      expect(result[0].cumulativeValue).toBe(10);
      expect(result[1].cumulativeValue).toBe(30); // 10 + 20
      expect(result[2].cumulativeValue).toBe(45); // 30 + 15
    });

    it('should handle multiple check-ins per day', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-01', 5),
        createCheckIn('2025-01-02', 20),
      ];

      const result = DataAggregator.getCumulativeValues(checkIns);

      expect(result).toHaveLength(2);
      expect(result[0].cumulativeValue).toBe(15); // 10 + 5
      expect(result[1].cumulativeValue).toBe(35); // 15 + 20
    });

    it('should return empty array for empty input', () => {
      const result = DataAggregator.getCumulativeValues([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('fillMissingDays', () => {
    it('should fill missing days with zeros', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-03', 20),
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = DataAggregator.fillMissingDays(checkIns, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(10);
      expect(result[0].isFilled).toBe(false);
      expect(result[1].value).toBe(0);
      expect(result[1].isFilled).toBe(true);
      expect(result[2].value).toBe(20);
      expect(result[2].isFilled).toBe(false);
    });

    it('should handle consecutive days', () => {
      const checkIns: CheckIn[] = [
        createCheckIn('2025-01-01', 10),
        createCheckIn('2025-01-02', 20),
        createCheckIn('2025-01-03', 15),
      ];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = DataAggregator.fillMissingDays(checkIns, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result.every(r => !r.isFilled)).toBe(true);
    });

    it('should handle date range with no check-ins', () => {
      const checkIns: CheckIn[] = [];
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = DataAggregator.fillMissingDays(checkIns, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result.every(r => r.value === 0 && r.isFilled)).toBe(true);
    });
  });
});
