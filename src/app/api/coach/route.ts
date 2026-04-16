import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { projects, language } = await req.json();

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: "At least one project is required for coaching." },
        { status: 400 }
      );
    }

    const langInstruction =
      language === "ru"
        ? "Respond in Russian."
        : "Respond in English.";

    const projectSummary = projects.map((p: { topic: string; tone: string; status: string; created_at: string }) =>
      `- Topic: "${p.topic}", Tone: ${p.tone}, Status: ${p.status}, Created: ${p.created_at}`
    ).join("\n");

    const groq = getOpenAI();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert AI content coach for short-form video creators (TikTok, Reels, Shorts). ${langInstruction}

Analyze the creator's content history and provide personalized coaching. Return ONLY valid JSON with this exact structure:
{
  "analysis": "2-3 sentence analysis of their content patterns, what's working, and areas to improve",
  "suggestions": [
    {
      "title": "suggested video title",
      "topic": "specific topic to create about",
      "reason": "why this would work well for them"
    }
  ],
  "streak": <number of consecutive days with at least one project>,
  "tip": "one actionable daily tip to improve their content"
}

Provide exactly 3 suggestions. Be encouraging, specific, and actionable. Don't be generic.`,
        },
        {
          role: "user",
          content: `Here's my content history:\n${projectSummary}\n\nTotal projects: ${projects.length}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching insights." },
      { status: 500 }
    );
  }
}
