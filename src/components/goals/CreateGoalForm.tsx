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
  });

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

      const { error: insertError } = await supabase.from("goals").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        stake_amount: parseFloat(formData.stakeAmount),
        stake_recipient_type: formData.stakeRecipientType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        check_in_frequency: formData.checkInFrequency,
        status: "active",
      });

      if (insertError) throw insertError;

      router.push("/goals");
      router.refresh();
    } catch (err) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          required
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          required
          min={formData.startDate}
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
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

