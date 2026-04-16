import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { script, topic, tone, language } = await req.json();

    const langInstruction =
      language === "ru"
        ? "Write all variants in Russian. Use modern Russian slang, short punchy sentences."
        : "Write in English. Use short, punchy sentences.";

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert TikTok script writer specializing in A/B testing hooks.

${langInstruction}

Generate 3 alternate versions of this TikTok script, each with a different hook strategy. Keep the body and CTA similar but adapt the hook.

Hook strategies:
- Variant A: Curiosity-based hook ("You won't believe...")
- Variant B: Shock/controversy hook ("Everyone is wrong about...")
- Variant C: Question hook ("What if I told you...")

Return JSON array of 3 objects: [{"variant": "A", "strategy": "Curiosity", "hook": "...", "full_text": "..."}, {"variant": "B", "strategy": "Shock", "hook": "...", "full_text": "..."}, {"variant": "C", "strategy": "Question", "hook": "...", "full_text": "..."}]

Respond ONLY with the JSON array, no other text.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}\nTone: ${tone}\n\nOriginal script:\n${script}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "[]";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const variants = JSON.parse(cleaned);

    return NextResponse.json({ variants });
  } catch (error) {
    console.error("Variant generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate variants" },
      { status: 500 }
    );
  }
}
