"use client";

import { CheckIn, Goal } from "@/types";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { parseLocalDate } from "@/utils/dateUtils";
import { SafetyCalculator } from "@/utils/safetyCalculator";
import { AutoFillManager } from "@/utils/autoFillManager";

interface MiniGoalGraphProps {
  goal: Goal;
  checkIns: CheckIn[];
  startDate: string;
  endDate: string;
  frequency: string;
}

export function MiniGoalGraph({
  goal,
  checkIns,
  startDate,
  endDate,
  frequency,
}: MiniGoalGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Dimensions
    const width = 140;
    const height = 70;
    const margin = { top: 4, right: 4, bottom: 4, left: 4 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);

    // Parse dates as local dates to avoid timezone issues
    const start = parseLocalDate(startDate);
    const goalEnd = parseLocalDate(endDate);
    
    // Beeminder-style: Show from start to akrasia horizon (7 days from today)
    // instead of entire goal range for long-term goals
    const today = new Date();
    const akrasiaHorizon = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const effectiveEnd = akrasiaHorizon < goalEnd ? akrasiaHorizon : goalEnd;
    const end = effectiveEnd;

    // Use advanced features for calculations
    const safetyCalc = new SafetyCalculator(goal);
    const trajectory = safetyCalc.getTrajectory();
    
    // Get rate from frequency and target value
    const targetValue = goal.target_value || 1;
    const initialBuffer = goal.initial_buffer_days || 0;
    
    let dailyRate = 1;
    switch (frequency) {
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
    
    const ratePerDay = dailyRate * targetValue;

    // Process check-ins
    const sortedCheckIns = [...checkIns]
      .filter((ci) => ci.status === "success")
      .sort(
        (a, b) =>
          parseLocalDate(a.check_in_date).getTime() -
          parseLocalDate(b.check_in_date).getTime()
      );

    // Get current cumulative value and safety status for zoom calculation
    const currentValue = AutoFillManager.getCurrentValue(checkIns);
    const safetyStatus = safetyCalc.calculateSafetyStatus(checkIns);
    
    // Calculate scales
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const totalExpected = totalDays * ratePerDay + (initialBuffer * ratePerDay);
    
    // Dynamic zoom based on safety buffer (Beeminder-style)
    let zoomFactor = 1.2; // Default: Show 20% above trajectory
    
    if (safetyStatus.isOverdue) {
      // Already derailed: Show minimal range to emphasize the problem
      zoomFactor = 1.05;
    } else if (safetyStatus.daysOfBuffer < 1) {
      // Critical (< 1 day): Zoom IN tight to show urgency
      zoomFactor = 1.1;
    } else if (safetyStatus.daysOfBuffer < 2) {
      // Urgent (1 day): Still zoomed in to show importance
      zoomFactor = 1.15;
    } else if (safetyStatus.daysOfBuffer < 3) {
      // Soon (2 days): Moderate zoom
      zoomFactor = 1.2;
    } else if (safetyStatus.daysOfBuffer < 7) {
      // Safe (3-6 days): Zoom out a bit to see context
      zoomFactor = 1.3;
    } else {
      // Lots of buffer (7+ days): Zoom OUT to see big picture
      zoomFactor = 1.5;
    }
    
    const maxValue = Math.max(
      currentValue * 1.05, // Show slightly above current progress
      totalExpected * zoomFactor, // Dynamic zoom based on safety
      targetValue * 7 // Minimum visible range (1 week worth)
    );

    // Dynamic X-axis zoom with padding (Beeminder-style)
    const PRAF = 0.015; // Padding ratio (1.5% on each side)
    const timeRange = end.getTime() - start.getTime();
    const startWithPadding = new Date(start.getTime() - PRAF * timeRange);
    const endWithPadding = new Date(end.getTime() + PRAF * timeRange);

    const xScale = d3
      .scaleTime()
      .domain([startWithPadding, endWithPadding])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define patterns
    const defs = svg.append("defs");

    const safePatternId = `safe-mini-${Math.random().toString(36).substr(2, 9)}`;
    const safePattern = defs
      .append("pattern")
      .attr("id", safePatternId)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 6)
      .attr("height", 6)
      .attr("patternTransform", "rotate(45)");

    safePattern
      .append("rect")
      .attr("width", 6)
      .attr("height", 6)
      .attr("fill", "#FFF9E6");

    safePattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 6)
      .attr("stroke", "#FFD700")
      .attr("stroke-width", 3);

    const dangerPatternId = `danger-mini-${Math.random().toString(36).substr(2, 9)}`;
    const dangerPattern = defs
      .append("pattern")
      .attr("id", dangerPatternId)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 6)
      .attr("height", 6)
      .attr("patternTransform", "rotate(45)");

    dangerPattern
      .append("rect")
      .attr("width", 6)
      .attr("height", 6)
      .attr("fill", "#FFF5F5");

    dangerPattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 6)
      .attr("stroke", "#FFB6C1")
      .attr("stroke-width", 2);

    // Goal line coordinates using trajectory
    const goalY0 = yScale(trajectory.getRequiredValue(start));
    const goalY1 = yScale(trajectory.getRequiredValue(end));

    // Safe zone
    g.append("path")
      .attr("d", `
        M 0 ${goalY0}
        L ${innerWidth} ${goalY1}
        L ${innerWidth} 0
        L 0 0
        Z
      `)
      .attr("fill", `url(#${safePatternId})`)
      .attr("opacity", 0.4);

    // Danger zone
    g.append("path")
      .attr("d", `
        M 0 ${goalY0}
        L ${innerWidth} ${goalY1}
        L ${innerWidth} ${innerHeight}
        L 0 ${innerHeight}
        Z
      `)
      .attr("fill", `url(#${dangerPatternId})`)
      .attr("opacity", 0.35);

    // Bright red goal line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", goalY0)
      .attr("x2", innerWidth)
      .attr("y2", goalY1)
      .attr("stroke", "#DC2626")
      .attr("stroke-width", 2);

    // Progress line
    if (sortedCheckIns.length > 0) {
      const pathData: string[] = [];
      let currentValue = 0;
      
      pathData.push(`M ${xScale(start)} ${yScale(0)}`);
      
      sortedCheckIns.forEach((checkIn) => {
        const checkInDate = parseLocalDate(checkIn.check_in_date);
        const x = xScale(checkInDate);
        
        pathData.push(`L ${x} ${yScale(currentValue)}`);
        currentValue += (checkIn.value || 1);
        pathData.push(`L ${x} ${yScale(currentValue)}`);
      });

      g.append("path")
        .attr("d", pathData.join(" "))
        .attr("stroke", "#1F2937")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");
    }

    // Datapoints
    let runningValue = 0;
    const datapoints = sortedCheckIns.map((checkIn) => {
      const checkInDate = parseLocalDate(checkIn.check_in_date);
      runningValue += (checkIn.value || 1);
      const actualValue = runningValue;
      
      // Calculate buffer in days
      const buffer = trajectory.calculateBuffer(actualValue, checkInDate);

      // Color based on buffer (matching SafetyCalculator levels)
      let color = "#EF4444"; // Red (< 1 day)
      if (buffer >= 7) color = "#22C55E"; // Green (7+ days)
      else if (buffer >= 3) color = "#10B981"; // Darker green (3-6 days)
      else if (buffer >= 2) color = "#3B82F6"; // Blue (2 days)
      else if (buffer >= 1) color = "#F97316"; // Orange (1 day)

      return {
        date: checkInDate,
        value: actualValue,
        color,
      };
    });

    g.selectAll(".datapoint")
      .data(datapoints)
      .enter()
      .append("circle")
      .attr("class", "datapoint")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 2.5)
      .attr("fill", d => d.color)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 1.5);
  }, [checkIns, startDate, endDate, frequency, goal]);

  return (
    <svg
      ref={svgRef}
      className="bg-gray-50 rounded border border-gray-300 shadow-sm"
    ></svg>
  );
}
