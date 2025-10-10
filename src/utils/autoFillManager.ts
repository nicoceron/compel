/**
 * AutoFillManager - Automatically fills in assumed values for days without check-ins
 * This creates a "pessimistic" view where missing data is assumed to be zero progress
 */

import { CheckIn } from "@/types";
import { parseLocalDate } from "./dateUtils";

export interface FilledDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  isActual: boolean; // true if from real check-in, false if auto-filled
  cumulativeValue: number;
}

export class AutoFillManager {
  /**
   * Generate data points with auto-filled zeros for missing days
   * This creates a "flatlining" effect where missing check-ins are assumed to be zero
   */
  static generateFilledData(
    checkIns: CheckIn[],
    startDate: Date,
    endDate: Date,
    aggregationMethod: "sum" | "last" = "sum"
  ): FilledDataPoint[] {
    // Get successful check-ins only
    const successfulCheckIns = checkIns.filter(ci => ci.status === "success");
    
    // Create a map of actual check-in data
    const actualDataMap = new Map<string, number>();
    
    for (const checkIn of successfulCheckIns) {
      const date = checkIn.check_in_date;
      const value = checkIn.value || 1;
      
      if (actualDataMap.has(date)) {
        if (aggregationMethod === "sum") {
          actualDataMap.set(date, actualDataMap.get(date)! + value);
        } else {
          actualDataMap.set(date, value); // last overwrites
        }
      } else {
        actualDataMap.set(date, value);
      }
    }
    
    // Fill in all days
    const filledData: FilledDataPoint[] = [];
    const currentDate = new Date(startDate);
    let cumulativeValue = 0;
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const actualValue = actualDataMap.get(dateStr);
      
      if (actualValue !== undefined) {
        // Real data point
        cumulativeValue += actualValue;
        filledData.push({
          date: dateStr,
          value: actualValue,
          isActual: true,
          cumulativeValue,
        });
      } else {
        // Auto-filled (assumed zero progress)
        filledData.push({
          date: dateStr,
          value: 0,
          isActual: false,
          cumulativeValue, // Stays flat
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filledData;
  }

  /**
   * Get the current cumulative value (sum of all actual check-ins)
   */
  static getCurrentValue(checkIns: CheckIn[]): number {
    return checkIns
      .filter(ci => ci.status === "success")
      .reduce((sum, ci) => sum + (ci.value || 1), 0);
  }

  /**
   * Get the last actual check-in date
   */
  static getLastCheckInDate(checkIns: CheckIn[]): Date | null {
    const successfulCheckIns = checkIns.filter(ci => ci.status === "success");
    if (successfulCheckIns.length === 0) return null;
    
    const sortedCheckIns = successfulCheckIns.sort((a, b) =>
      a.check_in_date.localeCompare(b.check_in_date)
    );
    
    return parseLocalDate(sortedCheckIns[sortedCheckIns.length - 1].check_in_date);
  }

  /**
   * Calculate days since last check-in
   */
  static getDaysSinceLastCheckIn(checkIns: CheckIn[]): number {
    const lastDate = this.getLastCheckInDate(checkIns);
    if (!lastDate) return Infinity;
    
    const now = new Date();
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(daysDiff);
  }
}

