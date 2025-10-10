/**
 * TrajectoryManager - Manages multi-segment goal trajectories
 * Allows goals to have different rates over time (e.g., start slow, ramp up)
 */

export interface TrajectorySegment {
  startDate: Date;
  endDate: Date;
  startValue: number;
  endValue: number;
  rate: number; // Units per day
}

export interface TrajectoryPoint {
  date: Date;
  value: number;
}

export class TrajectoryManager {
  private segments: TrajectorySegment[] = [];

  constructor(
    startDate: Date,
    endDate: Date,
    startValue: number,
    targetValue: number,
    rate: number,
    initialBuffer: number = 0
  ) {
    // Create initial single-segment trajectory
    const bufferValue = initialBuffer * rate;
    
    this.segments = [
      {
        startDate,
        endDate,
        startValue: startValue + bufferValue,
        endValue: targetValue + bufferValue,
        rate,
      },
    ];
  }

  /**
   * Get the required value at any given date
   */
  getRequiredValue(date: Date): number {
    const segment = this.getSegmentAtDate(date);
    if (!segment) return 0;

    const daysFromStart =
      (date.getTime() - segment.startDate.getTime()) / (1000 * 60 * 60 * 24);
    return segment.startValue + daysFromStart * segment.rate;
  }

  /**
   * Calculate days of buffer given current value and date
   */
  calculateBuffer(currentValue: number, currentDate: Date): number {
    const segment = this.getSegmentAtDate(currentDate);
    if (!segment || segment.rate === 0) return Infinity;

    const requiredValue = this.getRequiredValue(currentDate);
    const valueDifference = currentValue - requiredValue;
    return valueDifference / segment.rate;
  }

  /**
   * Calculate when current value will intersect the trajectory
   */
  calculateIntersectionDate(
    currentValue: number,
    currentDate: Date
  ): Date {
    // Current value stays flat (horizontal line)
    // Trajectory line rises at rate
    // Find when they intersect
    
    for (const segment of this.segments) {
      if (segment.endDate < currentDate) continue;
      
      const startDate = segment.startDate > currentDate ? segment.startDate : currentDate;
      const startValue = this.getRequiredValue(startDate);
      
      if (segment.rate === 0) {
        // Flat segment, check if we're already below
        if (currentValue < startValue) {
          return currentDate;
        }
        continue;
      }
      
      // Calculate intersection: currentValue = startValue + (days * rate)
      const daysUntilIntersection = (currentValue - startValue) / segment.rate;
      
      if (daysUntilIntersection >= 0) {
        const intersectionDate = new Date(
          startDate.getTime() + daysUntilIntersection * 24 * 60 * 60 * 1000
        );
        
        // Check if intersection is within this segment
        if (intersectionDate <= segment.endDate) {
          return intersectionDate;
        }
      }
    }
    
    // If no intersection found, return last segment end date
    return this.segments[this.segments.length - 1].endDate;
  }

  /**
   * Get all trajectory points for graphing
   */
  getTrajectoryPoints(
    startDate: Date,
    endDate: Date,
    pointsPerDay: number = 1
  ): TrajectoryPoint[] {
    const points: TrajectoryPoint[] = [];
    const msPerPoint = (24 * 60 * 60 * 1000) / pointsPerDay;
    
    let currentTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    while (currentTime <= endTime) {
      const date = new Date(currentTime);
      const value = this.getRequiredValue(date);
      points.push({ date, value });
      currentTime += msPerPoint;
    }
    
    return points;
  }

  /**
   * Add a new segment to the trajectory (for future use with road editor)
   */
  addSegment(segment: TrajectorySegment): void {
    this.segments.push(segment);
    this.segments.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Get the segment active at a given date
   */
  private getSegmentAtDate(date: Date): TrajectorySegment | null {
    for (const segment of this.segments) {
      if (date >= segment.startDate && date <= segment.endDate) {
        return segment;
      }
    }
    return this.segments[this.segments.length - 1] || null;
  }

  /**
   * Get all segments
   */
  getSegments(): TrajectorySegment[] {
    return [...this.segments];
  }
}

