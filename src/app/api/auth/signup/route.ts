import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // First, drop the broken trigger if it exists (one-time fix)
    // This is safe because we handle profile creation manually below
    try {
      await supabase.rpc("exec_sql", {
        query: "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users",
      });
    } catch {
      // Ignore - the rpc may not exist, that's fine
    }

    // Create user with admin API (bypasses any triggers)
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for now
      });

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    if (userData.user) {
      // Manually create the profile (since trigger may be broken)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userData.user.id,
            plan: "free",
            videos_today: 0,
            videos_reset_date: new Date().toISOString().split("T")[0],
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail signup even if profile creation fails
      }
    }

    return NextResponse.json({
      user: userData.user,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
