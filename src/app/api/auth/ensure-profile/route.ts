import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Get the current user from the session cookie
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use admin client to upsert profile (bypasses RLS)
    const admin = getAdminSupabase();
    const { error } = await admin.from("profiles").upsert(
      {
        id: user.id,
        plan: "free",
        videos_today: 0,
        videos_reset_date: new Date().toISOString().split("T")[0],
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    if (error) {
      console.error("Profile upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ensure profile error:", error);
    return NextResponse.json(
      { error: "Failed to ensure profile" },
      { status: 500 }
    );
  }
}
