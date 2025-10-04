"use client";

import { CheckIn, Goal } from "@/types";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { parseLocalDate } from "@/utils/dateUtils";

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
    const end = parseLocalDate(endDate);

    // Calculate rate
    let rate = 1;
    switch (frequency) {
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

    // Process check-ins
    const sortedCheckIns = [...checkIns]
      .filter((ci) => ci.status === "success")
      .sort(
        (a, b) =>
          parseLocalDate(a.check_in_date).getTime() -
          parseLocalDate(b.check_in_date).getTime()
      );

    // Calculate rate based on target value and frequency
    const targetValue = goal?.target_value || 1;
    const initialBuffer = goal?.initial_buffer_days || 0;
    
    // Scales
    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const totalExpected = totalDays * rate * targetValue;
    
    // Calculate cumulative values from check-ins
    const cumulativeValues = sortedCheckIns.reduce((acc, checkIn) => {
      const lastValue = acc.length > 0 ? acc[acc.length - 1] : 0;
      return [...acc, lastValue + (checkIn.value || 1)];
    }, [] as number[]);
    
    const maxValue = Math.max(
      cumulativeValues.length > 0 ? Math.max(...cumulativeValues) : 0,
      totalExpected * 1.2,
      targetValue * 5
    );

    const xScale = d3
      .scaleTime()
      .domain([start, end])
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

    // Goal line coordinates (with initial buffer)
    const goalY0 = yScale(initialBuffer * rate * targetValue);
    const goalY1 = yScale(totalExpected + (initialBuffer * rate * targetValue));

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
      const daysElapsed =
        (checkInDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const goalValue = (daysElapsed * rate * targetValue) + (initialBuffer * rate * targetValue);
      runningValue += (checkIn.value || 1);
      const actualValue = runningValue;
      const buffer = (actualValue - goalValue) / (rate * targetValue);

      let color = "#EF4444";
      if (buffer >= 3) color = "#22C55E";
      else if (buffer >= 2) color = "#3B82F6";
      else if (buffer >= 1) color = "#F97316";

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
  }, [checkIns, startDate, endDate, frequency, goal.target_value, goal.initial_buffer_days]);

  return (
    <svg
      ref={svgRef}
      className="bg-gray-50 rounded border border-gray-300 shadow-sm"
    ></svg>
  );
}
