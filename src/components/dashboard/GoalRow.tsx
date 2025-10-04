"use client";

import { Goal, CheckIn } from "@/types";
import Link from "next/link";
import { MiniGoalGraph } from "./MiniGoalGraph";
import { useState, useEffect } from "react";

interface GoalRowProps {
  goal: Goal;
  checkIns: CheckIn[];
}

export function GoalRow({ goal, checkIns }: GoalRowProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(goal.end_date);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      
      if (diff < 0) {
        setTimeRemaining("Overdue");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [goal.end_date]);
  const getUrgencyLevel = () => {
    const end = new Date(goal.end_date);
    const now = new Date();
    const hoursRemaining = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysRemaining = hoursRemaining / 24;

    if (hoursRemaining < 24) {
      return { level: "critical", color: "bg-red-100 border-red-300" };
    } else if (daysRemaining < 2) {
      return { level: "urgent", color: "bg-orange-100 border-orange-300" };
    } else if (daysRemaining < 7) {
      return { level: "soon", color: "bg-yellow-100 border-yellow-300" };
    }
    return { level: "normal", color: "bg-white border-gray-200" };
  };

  const formatUrgency = () => {
    if (timeRemaining === "Overdue") {
      return { text: "Overdue", urgency: "OVERDUE" };
    }

    return {
      text: timeRemaining ? `${timeRemaining} remaining` : "Calculating...",
      urgency: timeRemaining ? `Due in ${timeRemaining} or pay $${goal.stake_amount}` : "Loading...",
    };
  };

  const getRecentActivity = () => {
    if (checkIns.length === 0) {
      return "No check-ins yet";
    }
    
    const successCount = checkIns.filter(ci => ci.status === "success").length;
    const totalExpected = checkIns.length;
    const lastCheckIn = checkIns[checkIns.length - 1];
    
    return `${successCount}/${totalExpected} completed - Last: ${new Date(lastCheckIn.check_in_date).toLocaleDateString()}`;
  };

  const urgencyInfo = getUrgencyLevel();
  const urgencyText = formatUrgency();

  if (goal.status !== "active") {
    return null;
  }

  return (
    <Link href={`/goals/${goal.id}`}>
      <div
        className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${urgencyInfo.color}`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Mini Graph */}
          <div className="col-span-12 md:col-span-2 flex items-center justify-center">
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <MiniGoalGraph
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
              {urgencyText.urgency}
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
              className={`w-3 h-3 rounded-full ${
                urgencyInfo.level === "critical"
                  ? "bg-red-500"
                  : urgencyInfo.level === "urgent"
                  ? "bg-orange-500"
                  : urgencyInfo.level === "soon"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              title={urgencyText.text}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

