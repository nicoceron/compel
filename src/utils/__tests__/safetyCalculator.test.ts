/**
 * Unit tests for SafetyCalculator
 */

import { SafetyCalculator } from '../safetyCalculator';
import { Goal, CheckIn } from '@/types';

describe('SafetyCalculator', () => {
  const createGoal = (overrides?: Partial<Goal>): Goal => ({
    id: 'test-goal',
    user_id: 'test-user',
    title: 'Test Goal',
    description: null,
    stake_amount: 50,
    stake_recipient_type: 'compel',
    stake_recipient_id: null,
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    check_in_frequency: 'daily',
    target_value: 1,
    unit_type: 'sessions',
    initial_buffer_days: 0,
    aggregation_method: 'sum',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  const createCheckIn = (date: string, value: number): CheckIn => ({
    id: `${date}-${value}`,
    goal_id: 'test-goal',
    user_id: 'test-user',
    check_in_date: date,
    value,
    status: 'success',
    notes: null,
    evidence_url: null,
    created_at: new Date().toISOString(),
  });

  describe('constructor', () => {
    it('should create calculator with daily frequency', () => {
      const goal = createGoal({ check_in_frequency: 'daily' });
      const calc = new SafetyCalculator(goal);
      
      expect(calc).toBeDefined();
    });

    it('should create calculator with weekly frequency', () => {
      const goal = createGoal({ check_in_frequency: 'weekly' });
      const calc = new SafetyCalculator(goal);
      
      expect(calc).toBeDefined();
    });

    it('should create calculator with initial buffer', () => {
      const goal = createGoal({ initial_buffer_days: 7 });
      const calc = new SafetyCalculator(goal);
      
      expect(calc).toBeDefined();
    });
  });

  describe('calculateSafetyStatus', () => {
    it('should calculate safety status', () => {
      // Use future date to ensure buffer
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      const goal = createGoal({
        start_date: new Date().toISOString().split('T')[0],
        end_date: futureDateStr,
        check_in_frequency: 'daily',
        target_value: 1,
        initial_buffer_days: 10,
      });
      
      const checkIns: CheckIn[] = [
        createCheckIn(new Date().toISOString().split('T')[0], 15),
      ];

      const calc = new SafetyCalculator(goal);
      const status = calc.calculateSafetyStatus(checkIns);

      expect(status.level).toBeDefined();
      expect(status.message).toBeDefined();
      expect(status.daysOfBuffer).toBeDefined();
    });

    it('should include stake amount in message', () => {
      const goal = createGoal({ stake_amount: 100 });
      const calc = new SafetyCalculator(goal);
      const status = calc.calculateSafetyStatus([]);

      expect(status.message).toContain('100');
    });

    it('should handle empty check-ins', () => {
      const goal = createGoal({
        start_date: new Date().toISOString().split('T')[0],
        initial_buffer_days: 1,
      });
      const calc = new SafetyCalculator(goal);
      const status = calc.calculateSafetyStatus([]);

      expect(status).toBeDefined();
      expect(status.level).toBeDefined();
    });
  });

  describe('getRequiredValue', () => {
    it('should calculate required value at date', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        check_in_frequency: 'daily',
        target_value: 2,
      });

      const calc = new SafetyCalculator(goal);
      const trajectory = calc.getTrajectory();
      const tenDaysLater = new Date('2025-01-11');
      const required = trajectory.getRequiredValue(tenDaysLater);

      expect(required).toBeCloseTo(20, 0); // 10 days * 2 per day
    });

    it('should include initial buffer', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        check_in_frequency: 'daily',
        target_value: 1,
        initial_buffer_days: 7,
      });

      const calc = new SafetyCalculator(goal);
      const trajectory = calc.getTrajectory();
      const startDate = new Date('2025-01-01');
      const required = trajectory.getRequiredValue(startDate);

      // Should include initial buffer (approximately)
      expect(required).toBeGreaterThan(5);
      expect(required).toBeLessThan(9);
    });
  });

  describe('calculateDeadline', () => {
    it('should calculate when value will hit line', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        check_in_frequency: 'daily',
        target_value: 1,
        initial_buffer_days: 0,
      });

      const calc = new SafetyCalculator(goal);
      const currentValue = 10; // 10 days of buffer
      const deadline = calc.calculateDeadline(currentValue);

      // Should return a valid future date
      expect(deadline).toBeInstanceOf(Date);
      expect(deadline.getTime()).toBeGreaterThan(new Date('2025-01-01').getTime());
    });
  });

  describe('frequency calculations', () => {
    it('should handle weekly frequency', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        check_in_frequency: 'weekly',
        target_value: 7,
      });

      const calc = new SafetyCalculator(goal);
      const trajectory = calc.getTrajectory();
      const sevenDaysLater = new Date('2025-01-08');
      const required = trajectory.getRequiredValue(sevenDaysLater);

      expect(required).toBeCloseTo(7, 0); // 7 days * (7/7 per day)
    });

    it('should handle biweekly frequency', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        check_in_frequency: 'biweekly',
        target_value: 14,
      });

      const calc = new SafetyCalculator(goal);
      const trajectory = calc.getTrajectory();
      const fourteenDaysLater = new Date('2025-01-15');
      const required = trajectory.getRequiredValue(fourteenDaysLater);

      expect(required).toBeCloseTo(14, 0);
    });

    it('should handle monthly frequency', () => {
      const goal = createGoal({
        start_date: '2025-01-01',
        check_in_frequency: 'monthly',
        target_value: 30,
      });

      const calc = new SafetyCalculator(goal);
      const trajectory = calc.getTrajectory();
      const thirtyDaysLater = new Date('2025-01-31');
      const required = trajectory.getRequiredValue(thirtyDaysLater);

      expect(required).toBeCloseTo(30, 0);
    });
  });
});
