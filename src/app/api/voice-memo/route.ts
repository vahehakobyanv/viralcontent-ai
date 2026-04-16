import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { transcript, language, tone } = await req.json();

    const langInstruction =
      language === "ru"
        ? "Write the ENTIRE polished script in Russian. Keep it natural for Russian TikTok."
        : "Write in English. Use short, punchy sentences.";

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert TikTok script editor. Transform raw voice memo transcripts into polished 30-60 second TikTok scripts.

${langInstruction}
Tone: ${tone}

Structure it as:
1. Hook (first 2 seconds) - Must stop the scroll
2. Body (15-40 seconds) - Deliver value or tell a story
3. CTA (last 5 seconds) - Drive engagement

Rules:
- Keep the speaker's original ideas and personality
- Clean up filler words and rambling
- Make every sentence earn the next second of attention
- Each sentence on its own line

Also generate a short, catchy title for this video.

Respond with JSON: { "script": { "hook": "...", "body": "...", "cta": "...", "full_text": "..." }, "title": "..." }
full_text should be the complete script with hook, body, and cta combined with blank lines between sections.
Respond ONLY with JSON, no other text.`,
        },
        {
          role: "user",
          content: `Voice memo transcript:\n${transcript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || "{}";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Voice memo processing error:", error);
    return NextResponse.json(
      { error: "Failed to process voice memo" },
      { status: 500 }
    );
  }
}
