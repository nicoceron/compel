import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getTodayLocal } from "@/utils/dateUtils";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  
  // Get user's timezone from metadata or from the request
  let userTimezone = user.user_metadata?.timezone || body.timezone;
  
  if (!userTimezone) {
    // If still no timezone, just use local server time
    userTimezone = undefined;
  }

  const { data: checkIn, error } = await supabase
    .from("check_ins")
    .insert({
      user_id: user.id,
      goal_id: body.goal_id,
      check_in_date: body.check_in_date || getTodayLocal(userTimezone),
      status: body.status,
      value: body.value || 1,
      notes: body.notes,
      evidence_url: body.evidence_url,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ checkIn }, { status: 201 });
}

