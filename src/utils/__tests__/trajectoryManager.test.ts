/**
 * Unit tests for TrajectoryManager
 */

import { TrajectoryManager } from '../trajectoryManager';

describe('TrajectoryManager', () => {
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');
  const rate = 1; // 1 unit per day
  
  describe('constructor', () => {
    it('should create a single segment trajectory', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const segments = trajectory.getSegments();
      
      expect(segments).toHaveLength(1);
      expect(segments[0].startDate).toEqual(startDate);
      expect(segments[0].endDate).toEqual(endDate);
      expect(segments[0].rate).toBe(rate);
    });

    it('should apply initial buffer correctly', () => {
      const initialBuffer = 7;
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, initialBuffer);
      const segments = trajectory.getSegments();
      
      const bufferValue = initialBuffer * rate;
      expect(segments[0].startValue).toBe(bufferValue);
      expect(segments[0].endValue).toBe(30 + bufferValue);
    });

    it('should work with zero initial buffer', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const segments = trajectory.getSegments();
      
      expect(segments[0].startValue).toBe(0);
      expect(segments[0].endValue).toBe(30);
    });
  });

  describe('getRequiredValue', () => {
    it('should return correct value at start date', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const value = trajectory.getRequiredValue(startDate);
      
      expect(value).toBe(0);
    });

    it('should return correct value at mid-point', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const midDate = new Date('2025-01-16'); // 15 days later
      const value = trajectory.getRequiredValue(midDate);
      
      expect(value).toBeCloseTo(15, 1);
    });

    it('should include initial buffer in calculations', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 7);
      const value = trajectory.getRequiredValue(startDate);
      
      expect(value).toBe(7); // Initial buffer
    });

    it('should handle fractional rates', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, 0.5, 0);
      const twoDaysLater = new Date('2025-01-03');
      const value = trajectory.getRequiredValue(twoDaysLater);
      
      expect(value).toBeCloseTo(1, 1); // 2 days * 0.5 rate
    });
  });

  describe('calculateBuffer', () => {
    it('should return positive buffer when ahead', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const tenDaysLater = new Date('2025-01-11');
      const currentValue = 15; // 5 days ahead
      
      const buffer = trajectory.calculateBuffer(currentValue, tenDaysLater);
      
      expect(buffer).toBeCloseTo(5, 1);
    });

    it('should return negative buffer when behind', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const tenDaysLater = new Date('2025-01-11');
      const currentValue = 5; // 5 days behind
      
      const buffer = trajectory.calculateBuffer(currentValue, tenDaysLater);
      
      expect(buffer).toBeCloseTo(-5, 1);
    });

    it('should return zero buffer when exactly on line', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const tenDaysLater = new Date('2025-01-11');
      const currentValue = 10; // Exactly on schedule
      
      const buffer = trajectory.calculateBuffer(currentValue, tenDaysLater);
      
      expect(buffer).toBeCloseTo(0, 1);
    });

    it('should return Infinity for zero rate', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, 0, 0);
      const buffer = trajectory.calculateBuffer(10, startDate);
      
      expect(buffer).toBe(Infinity);
    });
  });

  describe('calculateIntersectionDate', () => {
    it('should calculate correct intersection for positive buffer', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const currentValue = 10;
      const currentDate = new Date('2025-01-01'); // Start
      
      const intersection = trajectory.calculateIntersectionDate(currentValue, currentDate);
      const expectedDate = new Date('2025-01-11'); // 10 days later
      
      expect(intersection.getTime()).toBeCloseTo(expectedDate.getTime(), -4); // Within ~day
    });

    it('should handle case when already behind', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const currentValue = 0;
      const currentDate = new Date('2025-01-11'); // 11 days in, need 11 units
      
      const intersection = trajectory.calculateIntersectionDate(currentValue, currentDate);
      
      // Should return start date or current date (already derailed)
      expect(intersection).toBeInstanceOf(Date);
      expect(intersection.getTime()).toBeLessThanOrEqual(new Date('2025-01-31').getTime());
    });

    it('should not exceed end date', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const currentValue = 100; // Way ahead
      const currentDate = startDate;
      
      const intersection = trajectory.calculateIntersectionDate(currentValue, currentDate);
      
      expect(intersection.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });

  describe('getTrajectoryPoints', () => {
    it('should generate correct number of points', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const points = trajectory.getTrajectoryPoints(startDate, endDate, 1);
      
      // 31 days inclusive
      expect(points.length).toBeGreaterThanOrEqual(30);
    });

    it('should generate more points with higher frequency', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const points1 = trajectory.getTrajectoryPoints(startDate, endDate, 1);
      const points2 = trajectory.getTrajectoryPoints(startDate, endDate, 2);
      
      expect(points2.length).toBeGreaterThan(points1.length);
    });

    it('should have increasing values', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      const points = trajectory.getTrajectoryPoints(startDate, endDate, 1);
      
      for (let i = 1; i < points.length; i++) {
        expect(points[i].value).toBeGreaterThanOrEqual(points[i - 1].value);
      }
    });
  });

  describe('addSegment', () => {
    it('should add a new segment and sort by date', () => {
      const trajectory = new TrajectoryManager(startDate, endDate, 0, 30, rate, 0);
      
      const midDate = new Date('2025-01-16');
      const newSegment = {
        startDate: midDate,
        endDate,
        startValue: 15,
        endValue: 30,
        rate: 2,
      };
      
      trajectory.addSegment(newSegment);
      const segments = trajectory.getSegments();
      
      expect(segments).toHaveLength(2);
      expect(segments[0].startDate).toEqual(startDate);
      expect(segments[1].startDate).toEqual(midDate);
    });
  });
});
