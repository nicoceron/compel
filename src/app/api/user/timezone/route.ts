import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { timezone } = await request.json();

  if (!timezone || typeof timezone !== "string") {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }

  // Update user metadata with timezone
  const { error } = await supabase.auth.updateUser({
    data: { timezone }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, timezone });
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timezone = user.user_metadata?.timezone || null;

  return NextResponse.json({ timezone });
}

