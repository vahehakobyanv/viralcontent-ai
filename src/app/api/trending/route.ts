import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { category } = await req.json();

    const groq = getOpenAI();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a TikTok trend analyst. Return ONLY valid JSON, no markdown.",
        },
        {
          role: "user",
          content: `Generate 8 trending TikTok video topic ideas for the "${category}" category. Return a JSON array of objects with these fields: title (string), category (string), description (string, 1 sentence), popularity ("hot" | "rising" | "steady"). Make them current, viral-worthy, and specific.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const topics = JSON.parse(cleaned);

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Failed to generate trending topics" },
      { status: 500 }
    );
  }
}
