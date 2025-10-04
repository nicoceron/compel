"use client";

import { useState, useEffect } from "react";
import { getBrowserTimezone, isTimezoneMismatch } from "@/utils/dateUtils";
import { Button } from "@/components/ui";

interface TimezoneBannerProps {
  userTimezone: string | null;
  userId: string;
}

export function TimezoneBanner({ userTimezone, userId }: TimezoneBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [browserTimezone, setBrowserTimezone] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const tz = getBrowserTimezone();
    setBrowserTimezone(tz);
    
    if (isTimezoneMismatch(userTimezone)) {
      setShowBanner(true);
    }
  }, [userTimezone]);

  const handleUpdateTimezone = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch("/api/user/timezone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: browserTimezone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update timezone");
      }

      // Refresh the page to reload with new timezone
      window.location.reload();
    } catch (error) {
      console.error("Error updating timezone:", error);
      alert("Failed to update timezone. Please try again.");
      setIsUpdating(false);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Your device timezone ({browserTimezone}) doesn't match your
                account timezone ({userTimezone || "not set"})
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                This may cause check-in dates and deadlines to appear incorrect.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setShowDialog(true)}
            >
              Update Timezone
            </Button>
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ⚠️ Warning: Changing Timezone
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Changing your timezone may have immediate consequences:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong className="text-red-600">Instant derails:</strong> If
                      today's date changes (e.g., it's Oct 5 in your old timezone
                      but Oct 4 in the new one), you may instantly derail on goals
                      where you haven't checked in yet.
                    </li>
                    <li>
                      <strong className="text-green-600">Buffer changes:</strong> Your
                      safety buffer may increase or decrease for active goals.
                    </li>
                    <li>
                      <strong className="text-yellow-600">Deadline shifts:</strong> All
                      check-in deadlines will shift to match the new timezone.
                    </li>
                  </ul>
                  <p className="font-medium text-gray-900">
                    New timezone: <span className="text-blue-600">{browserTimezone}</span>
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    Tip: If you're just traveling temporarily, you may want to keep
                    your home timezone and dismiss this warning.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleUpdateTimezone}
                isLoading={isUpdating}
              >
                I Understand, Update Timezone
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

