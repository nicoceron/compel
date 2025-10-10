"use client";

import { CheckIn, Goal } from "@/types";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { parseLocalDate } from "@/utils/dateUtils";
import { SafetyCalculator } from "@/utils/safetyCalculator";
import { AutoFillManager } from "@/utils/autoFillManager";

interface GoalGraphProps {
  checkIns: CheckIn[];
  startDate: string;
  endDate: string;
  frequency: string;
  goal: Goal;
}

export function GoalGraph({
  checkIns,
  startDate,
  endDate,
  frequency,
  goal,
}: GoalGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Dimensions
    const width = 900;
    const height = 500;
    const margin = { top: 50, right: 60, bottom: 80, left: 70 }; // Increased bottom for rotated labels
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // Parse dates as local dates to avoid timezone issues
    const start = parseLocalDate(startDate);
    const goalEnd = parseLocalDate(endDate);
    const today = new Date();
    
    // Beeminder-style: Show from start to akrasia horizon (7 days from today)
    // instead of entire goal range for long-term goals
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

    console.log("Sorted check-ins:", sortedCheckIns.length, sortedCheckIns);
    console.log("Rate per day:", ratePerDay, "Target value:", targetValue, "Daily rate:", dailyRate);

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
    
    console.log(`📏 Zoom: ${zoomFactor}× | Buffer: ${safetyStatus.daysOfBuffer.toFixed(1)}d | Level: ${safetyStatus.level}`);

    // Dynamic X-axis zoom with padding (Beeminder-style)
    const PRAF = 0.015; // Padding ratio (1.5% on each side)
    const timeRange = end.getTime() - start.getTime();
    const startWithPadding = new Date(start.getTime() - PRAF * timeRange);
    const endWithPadding = new Date(end.getTime() + PRAF * timeRange);
    const totalDaysVisible = (endWithPadding.getTime() - startWithPadding.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate optimal ticks based on visible days (Beebrain-style)
    // Keep tick count limited to avoid overlapping
    let tickCount: number;
    let tickFormat: string;
    const maxTicks = 10; // Maximum ticks to show
    
    if (totalDaysVisible < 10) {
      tickCount = Math.min(Math.ceil(totalDaysVisible), maxTicks);
      tickFormat = "%b %d";
    } else if (totalDaysVisible < 30) {
      tickCount = Math.min(6, maxTicks); // ~Weekly
      tickFormat = "%b %d";
    } else if (totalDaysVisible < 90) {
      tickCount = Math.min(6, maxTicks); // ~Bi-weekly
      tickFormat = "%b %d";
    } else if (totalDaysVisible < 180) {
      tickCount = Math.min(6, maxTicks); // ~Monthly
      tickFormat = "%b";
    } else if (totalDaysVisible < 365) {
      tickCount = Math.min(8, maxTicks); // ~Monthly
      tickFormat = "%b";
    } else if (totalDaysVisible < 730) {
      tickCount = Math.min(8, maxTicks); // ~Bi-monthly
      tickFormat = "%b '%y";
    } else if (totalDaysVisible < 1825) {
      tickCount = Math.min(10, maxTicks); // ~Quarterly
      tickFormat = "%b '%y";
    } else {
      tickCount = Math.min(10, maxTicks); // ~Yearly
      tickFormat = "%Y";
    }

    const xScale = d3
      .scaleTime()
      .domain([startWithPadding, endWithPadding])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);
    
    console.log(`📅 X-Axis: ${totalDaysVisible.toFixed(0)} days visible | ${tickCount} ticks | Format: ${tickFormat}`);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define patterns
    const defs = svg.append("defs");

    // Yellow stripes for safe zone
    const safePattern = defs
      .append("pattern")
      .attr("id", "safeStripes")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 10)
      .attr("patternTransform", "rotate(45)");

    safePattern
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#FFF9E6");

    safePattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 10)
      .attr("stroke", "#FFD700")
      .attr("stroke-width", 5);

    // Pink stripes for danger zone
    const dangerPattern = defs
      .append("pattern")
      .attr("id", "dangerStripes")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 10)
      .attr("height", 10)
      .attr("patternTransform", "rotate(45)");

    dangerPattern
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#FFF5F5");

    dangerPattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 10)
      .attr("stroke", "#FFB6C1")
      .attr("stroke-width", 3);

    // Goal line coordinates using trajectory
    const goalY0 = yScale(trajectory.getRequiredValue(start));
    const goalY1 = yScale(trajectory.getRequiredValue(end));

    // Safe zone (above goal line)
    g.append("path")
      .attr("d", `
        M 0 ${goalY0}
        L ${innerWidth} ${goalY1}
        L ${innerWidth} 0
        L 0 0
        Z
      `)
      .attr("fill", "url(#safeStripes)")
      .attr("opacity", 0.5);

    // Danger zone (below goal line)
    g.append("path")
      .attr("d", `
        M 0 ${goalY0}
        L ${innerWidth} ${goalY1}
        L ${innerWidth} ${innerHeight}
        L 0 ${innerHeight}
        Z
      `)
      .attr("fill", "url(#dangerStripes)")
      .attr("opacity", 0.4);

    // Watermark (pledge amount) - early so it's behind everything
    if (goal) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight / 2 + 30)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 160)
        .attr("font-weight", "bold")
        .attr("fill", "#D3D3D3")
        .attr("opacity", 0.15)
        .text(`$${goal.stake_amount}`);
    }

    // Grid lines - horizontal
    const yTicks = yScale.ticks(8);
    g.selectAll(".grid-h")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-h")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#E5E5E5")
      .attr("stroke-width", 1);

    // Grid lines - vertical
    const xTicks = xScale.ticks(10);
    g.selectAll(".grid-v")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "grid-v")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "#E8E8E8")
      .attr("stroke-width", 1);

    // Buffer guide lines using trajectory
    const buffers = [
      { days: 7, color: "#86EFAC" },
      { days: 2, color: "#93C5FD" },
      { days: 1, color: "#FDE047" }
    ];

    buffers.forEach(({ days, color }) => {
      const bufferAmount = ratePerDay * days;
      const bufferY0 = yScale(trajectory.getRequiredValue(start) + bufferAmount);
      const bufferY1 = yScale(trajectory.getRequiredValue(end) + bufferAmount);
      
      g.append("line")
        .attr("x1", 0)
        .attr("y1", bufferY0)
        .attr("x2", innerWidth)
        .attr("y2", bufferY1)
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.6);
    });

    // Bright red goal line
    g.append("line")
      .attr("x1", 0)
      .attr("y1", goalY0)
      .attr("x2", innerWidth)
      .attr("y2", goalY1)
      .attr("stroke", "#DC2626")
      .attr("stroke-width", 4);

    // Progress line (step function)
    if (sortedCheckIns.length > 0) {
      const pathData: string[] = [];
      let currentValue = 0;
      
      // Start at origin
      pathData.push(`M ${xScale(start)} ${yScale(0)}`);
      
      sortedCheckIns.forEach((checkIn) => {
        const checkInDate = parseLocalDate(checkIn.check_in_date);
        const x = xScale(checkInDate);
        
        // Horizontal line to check-in date
        pathData.push(`L ${x} ${yScale(currentValue)}`);
        
        currentValue += (checkIn.value || 1);
        
        // Vertical line up
        pathData.push(`L ${x} ${yScale(currentValue)}`);
      });
      
      // Extend to today
      const todayX = xScale(today);
      if (todayX > xScale(parseLocalDate(sortedCheckIns[sortedCheckIns.length - 1].check_in_date))) {
        pathData.push(`L ${todayX} ${yScale(currentValue)}`);
      }

      g.append("path")
        .attr("d", pathData.join(" "))
        .attr("stroke", "#1F2937")
        .attr("stroke-width", 2.5)
        .attr("fill", "none");

      console.log("Progress path created with cumulative value:", currentValue);
    }

    // Akrasia horizon
    const akrasiaDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (akrasiaDate >= start && akrasiaDate <= goalEnd) {
      const akrasiaX = xScale(akrasiaDate);

      g.append("line")
        .attr("x1", akrasiaX)
        .attr("x2", akrasiaX)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#60A5FA")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "8,4")
        .attr("opacity", 0.6);

      g.append("text")
        .attr("x", akrasiaX + 5)
        .attr("y", 15)
        .attr("font-size", 11)
        .attr("font-weight", "600")
        .attr("fill", "#2563EB")
        .text("Akrasia Horizon");
    }

    // Today marker
    if (today >= start && today <= end) {
      const todayX = xScale(today);

      g.append("line")
        .attr("x1", todayX)
        .attr("x2", todayX)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#6B7280")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,3")
        .attr("opacity", 0.8);

      g.append("text")
        .attr("x", todayX - 5)
        .attr("y", 15)
        .attr("text-anchor", "end")
        .attr("font-size", 11)
        .attr("font-weight", "600")
        .attr("fill", "#374151")
        .text("Today");
    }

    // Datapoints - MUST render after progress line
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
        buffer,
      };
    });

    console.log("Rendering", datapoints.length, "datapoints");

    g.selectAll(".datapoint")
      .data(datapoints)
      .enter()
      .append("circle")
      .attr("class", "datapoint")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 6)
      .attr("fill", d => d.color)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2.5)
      .style("cursor", "pointer");

    // X-axis with dynamic ticks and rotation
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(tickCount)
      .tickFormat(d3.timeFormat(tickFormat) as never);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "#6B7280")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");

    // Y-axis
    const yAxis = d3.axisLeft(yScale).ticks(8);

    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 11)
      .attr("fill", "#6B7280");

    // Axis styling
    g.selectAll(".domain").attr("stroke", "#9CA3AF").attr("stroke-width", 2);
    g.selectAll(".tick line").attr("stroke", "#9CA3AF");

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .text("cumulative total");

    // Corner text
    if (goal && datapoints.length > 0) {
      const lastDatapoint = datapoints[datapoints.length - 1];
      const isBeemergency = lastDatapoint.buffer < 1;

      svg
        .append("text")
        .attr("x", 15)
        .attr("y", 25)
        .attr("font-size", 13)
        .attr("font-weight", "bold")
        .attr("fill", isBeemergency ? "#DC2626" : "#059669")
        .text(
          isBeemergency
            ? `⚠ derails today`
            : `safe for ${Math.floor(lastDatapoint.buffer)}d`
        );

      svg
        .append("text")
        .attr("x", width - 15)
        .attr("y", height - 10)
        .attr("text-anchor", "end")
        .attr("font-size", 16)
        .attr("font-weight", "bold")
        .attr("fill", "#4B5563")
        .text(`$${goal.stake_amount}`);
    }
  }, [checkIns, startDate, endDate, frequency, goal, mounted]);

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef}></svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-red-600"></div>
          <span className="text-gray-700 font-semibold">Yellow Brick Road</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
          <span className="text-gray-700">3+ days safe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
          <span className="text-gray-700">2 days buffer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white"></div>
          <span className="text-gray-700">1 day buffer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
          <span className="text-gray-700 font-semibold">Beemergency!</span>
        </div>
      </div>
    </div>
  );
}
