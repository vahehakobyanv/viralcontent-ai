import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Temporary setup endpoint to fix the broken trigger
// This creates an RPC function that drops the trigger, then calls it
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  if (secret !== "fix-trigger-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  // Step 1: Create a helper RPC function to drop the trigger
  const createFnResult = await supabase.rpc("query", {
    sql: "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; DROP FUNCTION IF EXISTS handle_new_user();",
  });

  // Step 2: If RPC doesn't exist, try alternative approach
  // Use the SQL execution via PostgREST if available
  let result = { createFn: createFnResult };

  // Step 3: Try to create user directly to test
  const { data: testUser, error: testError } =
    await supabase.auth.admin.createUser({
      email: `setup-test-${Date.now()}@test.local`,
      password: "testpassword123",
      email_confirm: true,
    });

  if (testError) {
    result = {
      ...result,
      testError: testError.message,
      status: "trigger_still_broken",
      hint: "You need to manually run this SQL in the Supabase SQL Editor: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; DROP FUNCTION IF EXISTS public.handle_new_user();",
    } as typeof result & { testError: string; status: string; hint: string };
  } else {
    // Clean up test user
    if (testUser?.user) {
      await supabase.auth.admin.deleteUser(testUser.user.id);
    }
    result = {
      ...result,
      status: "working",
    } as typeof result & { status: string };
  }

  return NextResponse.json(result);
}
