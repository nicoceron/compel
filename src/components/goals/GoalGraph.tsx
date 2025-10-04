"use client";

import { CheckIn } from "@/types";
import { useMemo } from "react";

interface GoalGraphProps {
  checkIns: CheckIn[];
  startDate: string;
  endDate: string;
  frequency: string;
}

export function GoalGraph({ checkIns, startDate, endDate, frequency }: GoalGraphProps) {
  const graphData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Calculate datapoints
    const dataPoints: { date: Date; value: number; cumulative: number }[] = [];
    let cumulative = 0;
    
    // Sort check-ins by date
    const sortedCheckIns = [...checkIns].sort(
      (a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()
    );
    
    sortedCheckIns.forEach((checkIn) => {
      if (checkIn.status === "success") {
        cumulative++;
        dataPoints.push({
          date: new Date(checkIn.check_in_date),
          value: 1,
          cumulative,
        });
      }
    });
    
    // Calculate goal line (yellow brick road)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let requiredCheckIns = 0;
    
    switch (frequency) {
      case "daily":
        requiredCheckIns = totalDays;
        break;
      case "weekly":
        requiredCheckIns = Math.ceil(totalDays / 7);
        break;
      case "biweekly":
        requiredCheckIns = Math.ceil(totalDays / 14);
        break;
      case "monthly":
        requiredCheckIns = Math.ceil(totalDays / 30);
        break;
    }
    
    return {
      dataPoints,
      requiredCheckIns,
      currentProgress: cumulative,
      totalDays,
      start,
      end,
      today,
    };
  }, [checkIns, startDate, endDate, frequency]);

  const { dataPoints, requiredCheckIns, currentProgress, start, end, today } = graphData;
  
  // Calculate dimensions
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculate scales
  const xScale = (date: Date) => {
    const totalMs = end.getTime() - start.getTime();
    const currentMs = date.getTime() - start.getTime();
    return (currentMs / totalMs) * chartWidth + padding.left;
  };
  
  const yMax = Math.max(requiredCheckIns, currentProgress, 1) * 1.2;
  const yScale = (value: number) => {
    return height - padding.bottom - (value / yMax) * chartHeight;
  };
  
  // Calculate yellow brick road (goal line)
  const goalLinePoints = [
    { x: xScale(start), y: yScale(0) },
    { x: xScale(end), y: yScale(requiredCheckIns) },
  ];
  
  // Calculate safety buffer (green zone)
  const safeZoneY = yScale(requiredCheckIns * 1.1);
  
  // Calculate current position on timeline
  const todayX = xScale(today);
  const daysElapsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = (daysElapsed / (end.getTime() - start.getTime()) * (1000 * 60 * 60 * 24)) * requiredCheckIns;
  
  // Determine if user is on track (green), close to derailing (yellow), or derailed (red)
  const status = currentProgress >= expectedProgress * 0.9 ? "safe" : 
                 currentProgress >= expectedProgress * 0.7 ? "warning" : "danger";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Progress Graph
        </h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-gray-600">Your Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500"></div>
            <span className="text-gray-600">Goal Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300"></div>
            <span className="text-gray-600">Safe Zone</span>
          </div>
        </div>
      </div>
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Safe zone (green area above goal line) */}
        <polygon
          points={`
            ${padding.left},${safeZoneY}
            ${width - padding.right},${yScale(requiredCheckIns * 1.1)}
            ${width - padding.right},${yScale(requiredCheckIns)}
            ${padding.left},${yScale(0)}
          `}
          fill="currentColor"
          className="text-green-100 opacity-30"
        />
        
        {/* Danger zone (red area below goal line) */}
        <polygon
          points={`
            ${padding.left},${yScale(0)}
            ${width - padding.right},${yScale(requiredCheckIns)}
            ${width - padding.right},${height - padding.bottom}
            ${padding.left},${height - padding.bottom}
          `}
          fill="currentColor"
          className="text-red-100 opacity-20"
        />
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={padding.left}
            y1={yScale(yMax * fraction)}
            x2={width - padding.right}
            y2={yScale(yMax * fraction)}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4,4"
            className="text-gray-300"
          />
        ))}
        
        {/* Goal line (yellow brick road) */}
        <line
          x1={goalLinePoints[0].x}
          y1={goalLinePoints[0].y}
          x2={goalLinePoints[1].x}
          y2={goalLinePoints[1].y}
          stroke="currentColor"
          strokeWidth="3"
          className="text-yellow-500"
        />
        
        {/* Progress line */}
        {dataPoints.length > 1 && (
          <polyline
            points={dataPoints
              .map((point) => `${xScale(point.date)},${yScale(point.cumulative)}`)
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500"
          />
        )}
        
        {/* Data points */}
        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={xScale(point.date)}
            cy={yScale(point.cumulative)}
            r="4"
            fill="currentColor"
            className="text-blue-600"
          />
        ))}
        
        {/* Today line */}
        <line
          x1={todayX}
          y1={padding.top}
          x2={todayX}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
          className="text-gray-400"
        />
        
        {/* Axes */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-700"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-700"
        />
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <text
            key={fraction}
            x={padding.left - 10}
            y={yScale(yMax * fraction)}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {Math.round(yMax * fraction)}
          </text>
        ))}
        
        {/* X-axis labels */}
        <text
          x={padding.left}
          y={height - 10}
          textAnchor="start"
          className="text-xs fill-gray-600"
        >
          {start.toLocaleDateString()}
        </text>
        <text
          x={todayX}
          y={height - 10}
          textAnchor="middle"
          className="text-xs fill-gray-600 font-semibold"
        >
          Today
        </text>
        <text
          x={width - padding.right}
          y={height - 10}
          textAnchor="end"
          className="text-xs fill-gray-600"
        >
          {end.toLocaleDateString()}
        </text>
      </svg>
      
      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            status === "safe" ? "bg-green-100 text-green-800" :
            status === "warning" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status === "safe" ? "bg-green-500" :
              status === "warning" ? "bg-yellow-500" :
              "bg-red-500"
            }`}></span>
            {status === "safe" ? "On Track" : status === "warning" ? "At Risk" : "Derailed"}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {currentProgress} / {requiredCheckIns}
          </p>
          <p className="text-sm text-gray-600">
            Check-ins completed
          </p>
        </div>
      </div>
    </div>
  );
}

