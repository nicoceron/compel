"use client";

import { Goal, CheckIn } from "@/types";
import Link from "next/link";
import { MiniGoalGraph } from "./MiniGoalGraph";
import { useState, useEffect, useMemo } from "react";
import { SafetyCalculator } from "@/utils/safetyCalculator";

interface GoalRowProps {
  goal: Goal;
  checkIns: CheckIn[];
}

export function GoalRow({ goal, checkIns }: GoalRowProps) {
  // Create SafetyCalculator instance (memoized to avoid recreating on every render)
  const safetyCalc = useMemo(() => new SafetyCalculator(goal), [goal]);
  
  const [safetyStatus, setSafetyStatus] = useState(() => 
    safetyCalc.calculateSafetyStatus(checkIns)
  );

  // Update safety status every second for real-time countdown
  useEffect(() => {
    const updateStatus = () => {
      setSafetyStatus(safetyCalc.calculateSafetyStatus(checkIns));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [safetyCalc, checkIns]);

  const getRecentActivity = () => {
    if (checkIns.length === 0) {
      return "No check-ins yet";
    }
    
    const successCount = checkIns.filter(ci => ci.status === "success").length;
    const totalExpected = checkIns.length;
    const lastCheckIn = checkIns[checkIns.length - 1];
    
    return `${successCount}/${totalExpected} completed - Last: ${new Date(lastCheckIn.check_in_date).toLocaleDateString()}`;
  };

  // Map safety level to background color
  const getBackgroundColor = () => {
    switch (safetyStatus.level) {
      case "overdue":
        return "bg-red-200 border-red-400";
      case "critical":
        return "bg-red-100 border-red-300";
      case "urgent":
        return "bg-orange-100 border-orange-300";
      case "soon":
        return "bg-blue-100 border-blue-300";
      case "safe":
        return "bg-green-100 border-green-300";
      case "buffer":
        return "bg-white border-gray-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (goal.status !== "active") {
    return null;
  }

  return (
    <Link href={`/goals/${goal.id}`}>
      <div
        className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${getBackgroundColor()}`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Mini Graph */}
          <div className="col-span-12 md:col-span-2 flex items-center justify-center">
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <MiniGoalGraph
                goal={goal}
                checkIns={checkIns}
                startDate={goal.start_date}
                endDate={goal.end_date}
                frequency={goal.check_in_frequency}
              />
            </div>
          </div>

          {/* Goal Title */}
          <div className="col-span-12 md:col-span-3">
            <h3 className="font-semibold text-gray-900 text-base">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {goal.description}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div className="col-span-12 md:col-span-4">
            <p className="text-sm font-medium text-gray-900">
              {safetyStatus.message}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {getRecentActivity()}
            </p>
          </div>

          {/* Pledge */}
          <div className="col-span-6 md:col-span-2 text-center">
            <p className="text-2xl font-bold text-gray-900">
              ${goal.stake_amount}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              pledge
            </p>
          </div>

          {/* Status Indicator */}
          <div className="col-span-6 md:col-span-1 flex justify-end">
            <div
              className={`w-3 h-3 rounded-full ${safetyStatus.backgroundColor}`}
              title={safetyStatus.message}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

