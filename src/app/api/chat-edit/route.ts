import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { message, currentScript, topic, tone, language } = await req.json();

    const langInstruction =
      language === "ru"
        ? "Respond in Russian. Keep the script in Russian."
        : "Respond in English.";

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a TikTok script editor. The user will ask you to modify their script. Apply the requested change and return the FULL updated script. Also provide a brief explanation of what you changed.

${langInstruction}
Topic: ${topic}
Tone: ${tone}

Rules:
- Always return the complete updated script, not just the changed parts
- Keep the Hook / Body / CTA structure
- Each sentence on its own line
- Maintain the same approximate length unless asked to change it
- Be creative but respect the user's intent

Respond with JSON: { "updatedScript": "...", "explanation": "..." }
Respond ONLY with JSON, no other text.`,
        },
        {
          role: "user",
          content: `Current script:\n${currentScript}\n\nRequested change: ${message}`,
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
    console.error("Chat edit error:", error);
    return NextResponse.json(
      { error: "Failed to edit script" },
      { status: 500 }
    );
  }
}
