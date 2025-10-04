"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Goal } from "@/types";
import { useRouter } from "next/navigation";
import { getBrowserTimezone } from "@/utils/dateUtils";

interface GoalActionsProps {
  goal: Goal;
}

export function GoalActions({ goal }: GoalActionsProps) {
  const router = useRouter();
  const [isAddingCheckIn, setIsAddingCheckIn] = useState(false);
  const [checkInValue, setCheckInValue] = useState(goal.target_value?.toString() || "1");
  const [checkInNotes, setCheckInNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCheckIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_id: goal.id,
          status: "success",
          value: parseFloat(checkInValue),
          notes: checkInNotes,
          timezone: getBrowserTimezone(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add check-in");
      }

      setCheckInValue(goal.target_value?.toString() || "1");
      setCheckInNotes("");
      setIsAddingCheckIn(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseGoal = async () => {
    if (!confirm("Are you sure you want to pause this goal?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });

      if (!response.ok) throw new Error("Failed to pause goal");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this goal? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded">
            {error}
          </div>
        )}

        {!isAddingCheckIn ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              variant="primary"
              onClick={() => setIsAddingCheckIn(true)}
              disabled={isLoading}
            >
              Add Check-in
            </Button>
            <Button
              className="w-full"
              variant="ghost"
              onClick={() => router.push(`/goals/${goal.id}/edit`)}
              disabled={isLoading}
            >
              Edit Goal
            </Button>
            {goal.status === "active" && (
              <Button
                className="w-full"
                variant="ghost"
                onClick={handlePauseGoal}
                disabled={isLoading}
              >
                Pause Goal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How much did you do? ({goal.unit_type})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., ${goal.target_value}`}
                value={checkInValue}
                onChange={(e) => setCheckInValue(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">
                Target: {goal.target_value} {goal.unit_type} per {goal.check_in_frequency}
              </p>
            </div>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes (optional)"
              rows={2}
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="primary"
                onClick={handleAddCheckIn}
                isLoading={isLoading}
              >
                Submit
              </Button>
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() => {
                  setIsAddingCheckIn(false);
                  setCheckInValue(goal.target_value?.toString() || "1");
                  setCheckInNotes("");
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {goal.status === "active" && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete a goal, there is no going back. This action cannot
            be undone.
          </p>
          <Button
            className="w-full"
            variant="ghost"
            onClick={handleDeleteGoal}
            disabled={isLoading}
          >
            Delete Goal
          </Button>
        </div>
      )}
    </>
  );
}

