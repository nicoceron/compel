/**
 * DataAggregator - Handles aggregation of multiple check-ins on the same day
 */

import { CheckIn } from "@/types";

export type AggregationMethod = "sum" | "max" | "min" | "last" | "first" | "average";

export interface AggregatedCheckIn {
  date: string; // YYYY-MM-DD format
  value: number;
  count: number; // Number of check-ins aggregated
  originalCheckIns: CheckIn[]; // Reference to original data
}

export class DataAggregator {
  /**
   * Aggregate check-ins by day using specified method
   */
  static aggregateByDay(
    checkIns: CheckIn[],
    method: AggregationMethod = "sum"
  ): AggregatedCheckIn[] {
    // Group by date
    const grouped = new Map<string, CheckIn[]>();
    
    for (const checkIn of checkIns) {
      if (checkIn.status !== "success") continue;
      
      const date = checkIn.check_in_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(checkIn);
    }
    
    // Aggregate each group
    const aggregated: AggregatedCheckIn[] = [];
    
    for (const [date, checkIns] of grouped.entries()) {
      const values = checkIns.map(ci => ci.value || 1);
      let aggregatedValue: number;
      
      switch (method) {
        case "sum":
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case "max":
          aggregatedValue = Math.max(...values);
          break;
        case "min":
          aggregatedValue = Math.min(...values);
          break;
        case "last":
          aggregatedValue = values[values.length - 1];
          break;
        case "first":
          aggregatedValue = values[0];
          break;
        case "average":
          aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        default:
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
      }
      
      aggregated.push({
        date,
        value: aggregatedValue,
        count: checkIns.length,
        originalCheckIns: checkIns,
      });
    }
    
    // Sort by date
    return aggregated.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get cumulative values over time
   */
  static getCumulativeValues(
    checkIns: CheckIn[]
  ): Array<{ date: string; cumulativeValue: number }> {
    const aggregated = this.aggregateByDay(checkIns, "sum");
    const cumulative: Array<{ date: string; cumulativeValue: number }> = [];
    
    let runningTotal = 0;
    for (const item of aggregated) {
      runningTotal += item.value;
      cumulative.push({
        date: item.date,
        cumulativeValue: runningTotal,
      });
    }
    
    return cumulative;
  }

  /**
   * Fill missing days with zero values (for visual continuity)
   */
  static fillMissingDays(
    checkIns: CheckIn[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; value: number; isFilled: boolean }> {
    const aggregated = this.aggregateByDay(checkIns, "sum");
    const aggregatedMap = new Map(aggregated.map(a => [a.date, a.value]));
    
    const filled: Array<{ date: string; value: number; isFilled: boolean }> = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const value = aggregatedMap.get(dateStr) || 0;
      
      filled.push({
        date: dateStr,
        value,
        isFilled: !aggregatedMap.has(dateStr),
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filled;
  }
}

