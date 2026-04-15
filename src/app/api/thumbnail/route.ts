import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { topic, script } = await req.json();

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Generate 4 eye-catching TikTok thumbnail text overlays for this content. Each should be: 3-5 words max, use power words, create curiosity gap. Return JSON array of objects: [{ "text": string, "emoji": string, "style": "bold"|"minimal"|"gradient"|"neon" }]

Rules:
- Each thumbnail must use a different style
- Use strong emotional trigger words
- Make viewers NEED to click
- Keep text ultra-short (3-5 words)

Respond ONLY with the JSON array, no other text.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}\n\nScript: ${script || ""}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content || "[]";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const thumbnails = JSON.parse(cleaned);

    return NextResponse.json({ thumbnails });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate thumbnails" },
      { status: 500 }
    );
  }
}
