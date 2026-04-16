import { NextResponse } from "next/server";

interface ApiNotification {
  id: string;
  title: string;
  description: string;
  type: "video" | "trend" | "tip" | "system";
  icon: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

// Mock data — replace with Supabase query once a notifications table exists.
function getMockNotifications(): ApiNotification[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      title: "Your video is ready!",
      description: "Your latest TikTok video has finished rendering.",
      type: "video",
      icon: "Film",
      timestamp: now - 1000 * 60 * 5,
      read: false,
      link: "/dashboard",
    },
    {
      id: "mock-2",
      title: "Trending topic updated",
      description: "A new viral trend matches your niche — check it out.",
      type: "trend",
      icon: "TrendingUp",
      timestamp: now - 1000 * 60 * 60,
      read: false,
      link: "/trending",
    },
    {
      id: "mock-3",
      title: "New AI coach tip",
      description: "Tip of the day: hooks under 3 seconds get 2x retention.",
      type: "tip",
      icon: "Sparkles",
      timestamp: now - 1000 * 60 * 60 * 3,
      read: true,
    },
  ];
}

export async function GET() {
  try {
    const notifications = getMockNotifications();
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[notifications GET]", err);
    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, type } = body ?? {};

    if (!title || !description) {
      return NextResponse.json(
        { error: "title and description are required" },
        { status: 400 }
      );
    }

    const notification: ApiNotification = {
      id: `n-${Date.now()}`,
      title: String(title),
      description: String(description),
      type: (type ?? "system") as ApiNotification["type"],
      icon: "Bell",
      timestamp: Date.now(),
      read: false,
    };

    return NextResponse.json({ success: true, notification });
  } catch (err) {
    console.error("[notifications POST]", err);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
