import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Navigation } from "@/components/layout/Navigation";
import { GoalRow } from "@/components/dashboard/GoalRow";
import { CheckIn } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("end_date", { ascending: true });

  // Fetch check-ins for all goals
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .order("check_in_date", { ascending: true });

  // Group check-ins by goal
  const checkInsByGoal = (checkIns || []).reduce((acc, checkIn) => {
    if (!acc[checkIn.goal_id]) {
      acc[checkIn.goal_id] = [];
    }
    acc[checkIn.goal_id].push(checkIn);
    return acc;
  }, {} as Record<string, CheckIn[]>);

  // Calculate stats
  const completedGoals = goals?.filter((g) => g.status === "completed").length || 0;
  const failedGoals = goals?.filter((g) => g.status === "failed").length || 0;

  const activeGoalsList = goals?.filter((g) => g.status === "active") || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Active Goals
            </h2>
          </div>

          {activeGoalsList.length > 0 ? (
            <div className="space-y-3">
              {/* Header Row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-gray-300">
                <div className="col-span-2 text-xs font-semibold text-gray-600 text-center uppercase">
                  Graph
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                  Goal
                </div>
                <div className="col-span-4 text-xs font-semibold text-gray-600 uppercase">
                  Urgency
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 text-center uppercase">
                  Pledge
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Goal Rows */}
              {activeGoalsList.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  checkIns={checkInsByGoal[goal.id] || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No active goals yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first commitment goal.
              </p>
              <div className="mt-6">
                <Link href="/goals/new">
                  <Button>Create Your First Goal</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Create New Goal and Archived Goals Links */}
        <div className="mt-8 text-center flex gap-4 justify-center items-center">
          <Link href="/goals/new">
            <Button>Create New Goal</Button>
          </Link>
          {(completedGoals > 0 || failedGoals > 0) && (
            <Link href="/goals?filter=archived" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              ARCHIVED GOALS
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

