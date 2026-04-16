import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const { strategy, count, language, tone } = await req.json();
    if (!strategy || typeof strategy !== "string") {
      return NextResponse.json({ error: "strategy required" }, { status: 400 });
    }
    const n = Math.max(2, Math.min(10, Number(count) || 5));

    const client = getOpenAI();
    const prompt = `Generate ${n} unique TikTok video ideas based on this content strategy: ${strategy}.
Language: ${language || "en"}. Tone: ${tone || "energetic"}.
For each idea, provide:
- title (short, catchy)
- hook (the literal first 2 seconds of the video — scroll-stopping)
- core_message (2-3 sentences of the main message)
- cta (call to action)

Return ONLY a valid JSON object in the exact form:
{"ideas":[{"title":"...","hook":"...","core_message":"...","cta":"..."}]}
No prose, no markdown.`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a world-class viral TikTok strategist. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: { ideas?: unknown } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
    return NextResponse.json({ ideas });
  } catch (e) {
    console.error("[api/batch]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
