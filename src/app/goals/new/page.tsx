import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { CreateGoalForm } from "@/components/goals/CreateGoalForm";

export default async function NewGoalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Goal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set up a new commitment with real stakes
          </p>
        </div>

        <Card variant="bordered">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Goal Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Define your commitment and what&apos;s at stake
            </p>
          </CardHeader>

          <CardBody>
            <CreateGoalForm />
          </CardBody>
        </Card>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How Compel Works
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Set a goal with a monetary stake</li>
            <li>• Choose where the money goes if you fail</li>
            <li>• Check in regularly to prove your progress</li>
            <li>• Miss check-ins and lose your stake</li>
            <li>• Complete your goal and get your money back</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

