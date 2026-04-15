import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { topic, script } = await req.json();

    const groq = getOpenAI();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a social media hashtag strategist. Return ONLY valid JSON, no markdown.",
        },
        {
          role: "user",
          content: `Generate 20 optimal hashtags for this TikTok / Reels video.

Topic: ${topic}
Script excerpt: ${script?.slice(0, 300)}

Return a JSON object:
{
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "high_volume": ["#hashtag1", "#hashtag2", ...],
  "niche": ["#hashtag1", "#hashtag2", ...]
}

- "hashtags" should contain all 20 hashtags
- "high_volume" should contain ~8 high-volume trending hashtags (millions of views)
- "niche" should contain ~6 niche-specific hashtags (targeted, smaller audience)
- All hashtags should start with #`,
        },
      ],
      temperature: 0.8,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const hashtags = JSON.parse(cleaned);

    return NextResponse.json({ hashtags });
  } catch (error) {
    console.error("Hashtags API error:", error);
    return NextResponse.json(
      { error: "Failed to generate hashtags" },
      { status: 500 }
    );
  }
}
