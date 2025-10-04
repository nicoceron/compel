"use client";

import { CheckIn } from "@/types";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface MiniGoalGraphProps {
  checkIns: CheckIn[];
  startDate: string;
  endDate: string;
}

export function MiniGoalGraph({
  checkIns,
  startDate,
  endDate,
}: MiniGoalGraphProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate datapoints
  const dataPoints: { day: number; progress: number; goal: number }[] = [];

  const sortedCheckIns = [...checkIns]
    .filter((ci) => ci.status === "success")
    .sort(
      (a, b) =>
        new Date(a.check_in_date).getTime() -
        new Date(b.check_in_date).getTime()
    );

  // Total days in the goal period
  const totalDays =
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const totalExpected = Math.max(sortedCheckIns.length, 5);

  // Generate data points
  const dataPointsCount = 20;
  for (let i = 0; i <= dataPointsCount; i++) {
    const day = (i / dataPointsCount) * totalDays;
    const dayDate = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);

    // Count check-ins up to this day
    const checkInsUpToDay = sortedCheckIns.filter(
      (ci) => new Date(ci.check_in_date) <= dayDate
    ).length;

    // Goal line (linear from 0 to totalExpected)
    const goalValue = (i / dataPointsCount) * totalExpected;

    dataPoints.push({
      day: i,
      progress: checkInsUpToDay,
      goal: goalValue,
    });
  }

  return (
    <ResponsiveContainer width={120} height={60}>
      <LineChart data={dataPoints} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis dataKey="day" hide />
        <YAxis hide domain={[0, totalExpected]} />
        <Line
          type="monotone"
          dataKey="goal"
          stroke="#FCD34D"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="progress"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

