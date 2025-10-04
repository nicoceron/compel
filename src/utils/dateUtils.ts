/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Parse a date string (YYYY-MM-DD) as a date in the specified timezone
 * This prevents timezone conversion issues
 */
export function parseLocalDate(dateString: string, timezone?: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  
  if (timezone) {
    // Create date in the specified timezone
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`;
    return new Date(dateStr);
  }
  
  return new Date(year, month - 1, day);
}

/**
 * Format a date string for display in specified timezone
 */
export function formatLocalDate(
  dateString: string, 
  options?: Intl.DateTimeFormatOptions,
  timezone?: string
): string {
  const date = parseLocalDate(dateString, timezone);
  return date.toLocaleDateString("en-US", {
    ...options,
    timeZone: timezone || getBrowserTimezone()
  });
}

/**
 * Get today's date as YYYY-MM-DD in the specified timezone
 */
export function getTodayLocal(timezone?: string): string {
  const now = new Date();
  
  if (timezone) {
    // Get date in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    
    return `${year}-${month}-${day}`;
  }
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if browser timezone matches user timezone
 */
export function isTimezoneMismatch(userTimezone: string | null): boolean {
  if (!userTimezone) return false;
  return getBrowserTimezone() !== userTimezone;
}

/**
 * Calculate when the goal will derail based on current progress and red line trajectory.
 * Returns the timestamp when you'll hit the red line if no more data is added.
 * This is the "safety buffer" calculation - how many days until derailment.
 */
export function calculateDerailmentTime(
  currentValue: number,
  targetValue: number,
  checkInFrequency: string,
  startDate: string,
  endDate: string,
  initialBuffer: number = 0
): Date {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const now = new Date();
  
  // Calculate rate (how fast the red line is rising per day)
  let rate = 1; // default to daily
  switch (checkInFrequency) {
    case "daily":
      rate = 1;
      break;
    case "weekly":
      rate = 1 / 7;
      break;
    case "biweekly":
      rate = 1 / 14;
      break;
    case "monthly":
      rate = 1 / 30;
      break;
  }
  
  const daysSinceStart = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  // Red line equation: y = initialBuffer * rate * targetValue + (days * rate * targetValue)
  // Current value is flat at currentValue
  // Find when they intersect: currentValue = initialBuffer * rate * targetValue + (days * rate * targetValue)
  // Solve for days: days = (currentValue - initialBuffer * rate * targetValue) / (rate * targetValue)
  
  const initialBufferValue = initialBuffer * rate * targetValue;
  const dailyIncrease = rate * targetValue;
  
  if (dailyIncrease === 0) {
    // If rate is 0, can't derail based on rate
    return end;
  }
  
  // Days until derailment from start
  const daysUntilDerail = (currentValue - initialBufferValue) / dailyIncrease;
  
  // Calculate derailment date
  const derailDate = new Date(start.getTime() + daysUntilDerail * 24 * 60 * 60 * 1000);
  
  // If derailment is in the past or current value is already below the line, derail now
  if (derailDate <= now) {
    return now;
  }
  
  // Can't derail after the goal end date
  if (derailDate > end) {
    return end;
  }
  
  return derailDate;
}

