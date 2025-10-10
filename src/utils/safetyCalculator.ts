/**
 * SafetyCalculator - Real-time safety buffer and risk calculations
 */

import { Goal, CheckIn } from "@/types";
import { TrajectoryManager } from "./trajectoryManager";
import { AutoFillManager } from "./autoFillManager";
import { parseLocalDate } from "./dateUtils";

export type SafetyLevel = "critical" | "urgent" | "soon" | "safe" | "buffer" | "overdue";

export interface SafetyStatus {
  level: SafetyLevel;
  daysOfBuffer: number;
  hoursUntilDeadline: number;
  isOverdue: boolean;
  message: string;
  color: string;
  backgroundColor: string;
}

export class SafetyCalculator {
  private trajectory: TrajectoryManager;
  private goal: Goal;

  constructor(goal: Goal) {
    this.goal = goal;
    
    // Calculate rate based on frequency
    let dailyRate = 1;
    switch (goal.check_in_frequency) {
      case "daily":
        dailyRate = 1;
        break;
      case "weekly":
        dailyRate = 1 / 7;
        break;
      case "biweekly":
        dailyRate = 1 / 14;
        break;
      case "monthly":
        dailyRate = 1 / 30;
        break;
    }
    
    const targetValue = goal.target_value || 1;
    const ratePerDay = dailyRate * targetValue;
    
    this.trajectory = new TrajectoryManager(
      parseLocalDate(goal.start_date),
      parseLocalDate(goal.end_date),
      0,
      0, // We'll calculate based on trajectory
      ratePerDay,
      goal.initial_buffer_days || 0
    );
  }

  /**
   * Calculate comprehensive safety status
   */
  calculateSafetyStatus(checkIns: CheckIn[]): SafetyStatus {
    const currentValue = AutoFillManager.getCurrentValue(checkIns);
    const now = new Date();
    
    // Calculate buffer
    const daysOfBuffer = this.trajectory.calculateBuffer(currentValue, now);
    
    // Calculate deadline (when we'll cross the line)
    const deadline = this.trajectory.calculateIntersectionDate(currentValue, now);
    const msUntilDeadline = deadline.getTime() - now.getTime();
    const hoursUntilDeadline = msUntilDeadline / (1000 * 60 * 60);
    
    // Determine safety level
    const isOverdue = hoursUntilDeadline < 0;
    
    let level: SafetyLevel;
    let message: string;
    let color: string;
    let backgroundColor: string;
    
    if (isOverdue) {
      level = "overdue";
      message = `OVERDUE! Pay $${this.goal.stake_amount}`;
      color = "text-black";
      backgroundColor = "bg-black";
    } else if (hoursUntilDeadline < 24) {
      level = "critical";
      message = `Add data in ${Math.floor(hoursUntilDeadline)}h or pay $${this.goal.stake_amount}`;
      color = "text-red-600";
      backgroundColor = "bg-red-500";
    } else if (daysOfBuffer < 1) {
      level = "urgent";
      message = `Add data today or pay $${this.goal.stake_amount}`;
      color = "text-orange-600";
      backgroundColor = "bg-orange-500";
    } else if (daysOfBuffer < 2) {
      level = "soon";
      message = `${Math.floor(daysOfBuffer * 24)} hours of buffer`;
      color = "text-blue-600";
      backgroundColor = "bg-blue-500";
    } else if (daysOfBuffer < 7) {
      level = "safe";
      message = `${Math.floor(daysOfBuffer)} days of buffer`;
      color = "text-green-600";
      backgroundColor = "bg-green-500";
    } else {
      level = "buffer";
      message = `${Math.floor(daysOfBuffer)} days of buffer`;
      color = "text-green-700";
      backgroundColor = "bg-green-400";
    }
    
    return {
      level,
      daysOfBuffer,
      hoursUntilDeadline,
      isOverdue,
      message,
      color,
      backgroundColor,
    };
  }

  /**
   * Get the trajectory manager instance
   */
  getTrajectory(): TrajectoryManager {
    return this.trajectory;
  }

  /**
   * Calculate required value at a specific date
   */
  getRequiredValue(date: Date): number {
    return this.trajectory.getRequiredValue(date);
  }

  /**
   * Calculate when current progress will hit the commitment line
   */
  calculateDeadline(currentValue: number): Date {
    return this.trajectory.calculateIntersectionDate(currentValue, new Date());
  }
}

