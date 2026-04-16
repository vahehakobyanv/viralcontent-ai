import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // Count totals
    const [
      { count: totalUsers },
      { count: totalProjects },
      { count: totalVideos },
      { count: totalScripts },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("scripts").select("*", { count: "exact", head: true }),
    ]);

    // Recent users
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Projects by status
    const { data: projects } = await supabase
      .from("projects")
      .select("status");

    const statusMap: Record<string, number> = {};
    (projects || []).forEach((p) => {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).map(
      ([status, count]) => ({ status, count })
    );

    // Projects per day (last 7 days)
    const dailyProjects: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const nextStr = nextD.toISOString().split("T")[0];

      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateStr)
        .lt("created_at", nextStr);

      dailyProjects.push({ date: dateStr, count: count || 0 });
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalProjects: totalProjects || 0,
      totalVideos: totalVideos || 0,
      totalScripts: totalScripts || 0,
      statusBreakdown,
      recentUsers: recentUsers || [],
      dailyProjects,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
