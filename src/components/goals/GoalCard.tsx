import Link from "next/link";
import { Card, CardHeader, CardBody, CardFooter, Badge, Button } from "@/components/ui";
import { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    const end = new Date(goal.end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Card variant="bordered" className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {goal.description}
              </p>
            )}
          </div>
          <Badge variant={getStatusColor(goal.status)}>
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stake Amount
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${goal.stake_amount}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Recipient
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {goal.stake_recipient_type.replace("_", " ")}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Check-in Frequency
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {goal.check_in_frequency.charAt(0).toUpperCase() +
                goal.check_in_frequency.slice(1)}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(goal.start_date)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(goal.end_date)}
              </span>
            </div>
            {goal.status === "active" && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                {getDaysRemaining()} days remaining
              </p>
            )}
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <Link href={`/goals/${goal.id}`} className="w-full">
          <Button variant="ghost" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

