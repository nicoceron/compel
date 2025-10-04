import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Navigation } from "@/components/layout/Navigation";
import { TimezoneBanner } from "@/components/layout/TimezoneBanner";
import { GoalGraph } from "@/components/goals/GoalGraph";
import { GoalActions } from "@/components/goals/GoalActions";
import { CheckIn, Goal } from "@/types";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatLocalDate } from "@/utils/dateUtils";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch goal
  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!goal) {
    redirect("/dashboard");
  }

  // Fetch check-ins
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("goal_id", id)
    .order("check_in_date", { ascending: true });

  const typedGoal = goal as Goal;
  const typedCheckIns = (checkIns || []) as CheckIn[];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "info";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "paused":
        return "warning";
      default:
        return "default";
    }
  };

  const getDaysRemaining = () => {
    const end = new Date(typedGoal.end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSuccessRate = () => {
    if (typedCheckIns.length === 0) return 0;
    const successCount = typedCheckIns.filter((ci) => ci.status === "success").length;
    return Math.round((successCount / typedCheckIns.length) * 100);
  };
  
  // Get user timezone from metadata
  const userTimezone = user.user_metadata?.timezone || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <TimezoneBanner userTimezone={userTimezone} userId={user.id} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {typedGoal.title}
                </h1>
                <Badge variant={getStatusColor(typedGoal.status)}>
                  {typedGoal.status.charAt(0).toUpperCase() + typedGoal.status.slice(1)}
                </Badge>
              </div>
              {typedGoal.description && (
                <p className="text-gray-600 text-lg">
                  {typedGoal.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Stake Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${typedGoal.stake_amount}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
            <p className="text-2xl font-bold text-gray-900">
              {getDaysRemaining()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Check-ins</p>
            <p className="text-2xl font-bold text-gray-900">
              {typedCheckIns.filter((ci) => ci.status === "success").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {getSuccessRate()}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Graph and Streak */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beeminder-style Graph */}
            <GoalGraph
              checkIns={typedCheckIns}
              startDate={typedGoal.start_date}
              endDate={typedGoal.end_date}
              frequency={typedGoal.check_in_frequency}
              goal={typedGoal}
            />

            {/* Recent Check-ins */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Check-ins
              </h3>
              {typedCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {typedCheckIns
                    .slice(-5)
                    .reverse()
                    .map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              checkIn.status === "success"
                                ? "bg-green-500"
                                : checkIn.status === "missed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatLocalDate(checkIn.check_in_date, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs font-semibold text-blue-600">
                              {checkIn.value} {typedGoal.unit_type}
                            </p>
                            {checkIn.notes && (
                              <p className="text-xs text-gray-600">
                                {checkIn.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            checkIn.status === "success"
                              ? "success"
                              : checkIn.status === "missed"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {checkIn.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No check-ins yet
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Goal Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Goal Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Commitment</p>
                  <p className="text-base font-medium text-gray-900">
                    {typedGoal.target_value} {typedGoal.unit_type} per {typedGoal.check_in_frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Check-in Frequency</p>
                  <p className="text-base font-medium text-gray-900 capitalize">
                    {typedGoal.check_in_frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(typedGoal.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">End Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(typedGoal.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stake Recipient</p>
                  <p className="text-base font-medium text-gray-900 capitalize">
                    {typedGoal.stake_recipient_type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <GoalActions goal={typedGoal} />
          </div>
        </div>
      </main>
    </div>
  );
}

