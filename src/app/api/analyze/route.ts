import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { script, topic, tone } = await req.json();

    const groq = getOpenAI();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a viral content analyst for TikTok / Reels / Shorts. Return ONLY valid JSON, no markdown.",
        },
        {
          role: "user",
          content: `Analyze this short-form video script for viral potential.

Topic: ${topic}
Tone: ${tone}
Script:
${script}

Return a JSON object with these fields (scores 0-100):
{
  "overall": <number>,
  "hook_strength": <number>,
  "retention_potential": <number>,
  "cta_effectiveness": <number>,
  "tips": [<string>, <string>, <string>]
}

Be critical but constructive. Provide 3-5 actionable tips to improve virality.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const score = JSON.parse(cleaned);

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze script" },
      { status: 500 }
    );
  }
}
