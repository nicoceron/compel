"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { createClient } from "@/utils/supabase/client";
import { StakeRecipientType, CheckInFrequency } from "@/types";

export function CreateGoalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stakeAmount: "",
    stakeRecipientType: "compel" as StakeRecipientType,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    checkInFrequency: "weekly" as CheckInFrequency,
    targetValue: "1",
    unitType: "check-ins",
    initialBufferDays: "0",
  });
  
  const [noEndDate, setNoEndDate] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // If no end date is selected, set it to 100 years in the future
      const endDate = noEndDate 
        ? new Date(new Date(formData.startDate).getTime() + 100 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : formData.endDate;
      
      const { error: insertError } = await supabase.from("goals").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        stake_amount: parseFloat(formData.stakeAmount),
        stake_recipient_type: formData.stakeRecipientType,
        start_date: formData.startDate,
        end_date: endDate,
        check_in_frequency: formData.checkInFrequency,
        target_value: parseFloat(formData.targetValue),
        unit_type: formData.unitType,
        initial_buffer_days: parseInt(formData.initialBufferDays),
        status: "active",
      });

      if (insertError) {
        console.error("Supabase error:", insertError);
        throw new Error(insertError.message || insertError.hint || "Failed to create goal");
      }

      router.push("/goals");
      router.refresh();
    } catch (err) {
      console.error("Goal creation error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Goal Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="e.g., Exercise 3 times per week"
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Provide more details about your goal..."
        rows={4}
      />

      {/* Quantitative Goal Settings */}
      <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          Commit to at Least
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target Amount*"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.targetValue}
            onChange={(e) =>
              setFormData({ ...formData, targetValue: e.target.value })
            }
            required
            placeholder="60"
          />
          
          <Input
            label="Units*"
            type="text"
            value={formData.unitType}
            onChange={(e) =>
              setFormData({ ...formData, unitType: e.target.value })
            }
            required
            placeholder="minutes, sessions, miles, etc."
          />
        </div>
        
        <p className="text-xs text-gray-600 -mt-2">
          What are your units for this goal?
        </p>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="initialBuffer"
            checked={parseInt(formData.initialBufferDays) > 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                initialBufferDays: e.target.checked ? "7" : "0",
              })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="initialBuffer" className="text-sm text-gray-700">
            Start with extra leeway (7-day safety buffer)
          </label>
        </div>
      </div>

      <Input
        label="Stake Amount ($)"
        type="number"
        step="0.01"
        min="1"
        value={formData.stakeAmount}
        onChange={(e) =>
          setFormData({ ...formData, stakeAmount: e.target.value })
        }
        required
        placeholder="50.00"
        helperText="The amount you'll lose if you fail to meet your commitment"
      />

      <Select
        label="Where does the money go if you fail?"
        value={formData.stakeRecipientType}
        onChange={(e) =>
          setFormData({
            ...formData,
            stakeRecipientType: e.target.value as StakeRecipientType,
          })
        }
        required
        options={[
          { value: "compel", label: "Compel (Us)" },
          { value: "charity", label: "Charity" },
          { value: "anti_charity", label: "Anti-Charity" },
          { value: "friend", label: "Friend" },
        ]}
      />

      <Select
        label="Check-in Frequency"
        value={formData.checkInFrequency}
        onChange={(e) =>
          setFormData({
            ...formData,
            checkInFrequency: e.target.value as CheckInFrequency,
          })
        }
        required
        options={[
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "biweekly", label: "Bi-weekly" },
          { value: "monthly", label: "Monthly" },
        ]}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Start Date*"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
          />

          {!noEndDate && (
            <Input
              label="End Date*"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required={!noEndDate}
              min={formData.startDate}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="noEndDate"
            checked={noEndDate}
            onChange={(e) => {
              setNoEndDate(e.target.checked);
              if (e.target.checked) {
                setFormData({ ...formData, endDate: "" });
              }
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="noEndDate" className="text-sm text-gray-700">
            No end date (ongoing goal)
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" isLoading={loading}>
          Create Goal
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

