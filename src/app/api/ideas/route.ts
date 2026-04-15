import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { topic, language, tone, viralMode } = await req.json();

    const langInstruction =
      language === "ru"
        ? "Write ALL content in Russian. Use modern Russian internet slang where appropriate."
        : "Write all content in English.";

    const viralInstruction = viralMode
      ? "Make hooks EXTREMELY controversial, provocative, and attention-grabbing. Use pattern interrupts. Challenge common beliefs. Make people NEED to watch."
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a viral TikTok content strategist. Generate 5 viral video ideas for the given topic.

${langInstruction}
${viralInstruction}

Tone: ${tone}

For each idea, provide:
- title: A short catchy title
- hook: The first 2 seconds — must stop the scroll immediately
- core_message: The main value/story (2-3 sentences)
- cta: A strong call to action that drives engagement

Respond with a JSON array of 5 objects with these exact fields: title, hook, core_message, cta
Respond ONLY with the JSON array, no other text.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}`,
        },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "[]";
    // Parse JSON from response, handling possible markdown code blocks
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const ideas = JSON.parse(cleaned);

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Ideas generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
