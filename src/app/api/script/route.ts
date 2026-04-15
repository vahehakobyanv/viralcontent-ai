import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { projectId, topic, language, tone, existingHook } = await req.json();

    const langInstruction =
      language === "ru"
        ? "Write the ENTIRE script in Russian. Use modern Russian slang, short punchy sentences. Make it sound natural for Russian TikTok."
        : "Write in English. Use short, punchy sentences.";

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert TikTok script writer. Write a 30-60 second script optimized for maximum retention.

${langInstruction}

Tone: ${tone}

Structure:
1. HOOK (first 2 seconds): Must stop the scroll. ${existingHook ? `Base it on: "${existingHook}"` : ""}
2. BODY (15-40 seconds): Deliver value or tell a story. Short sentences. One idea per line. Keep viewers watching.
3. CTA (last 5 seconds): Drive engagement — follow, comment, share.

Rules:
- Each sentence on its own line
- No emojis in the script text
- Optimize for TikTok algorithm (high watch time, comments)
- Make every sentence earn the next second of attention

Respond with JSON: { "hook": "...", "body": "...", "cta": "...", "full_text": "..." }
full_text should be the complete script with hook, body, and cta combined with blank lines between sections.
Respond ONLY with JSON, no other text.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || "{}";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const scriptData = JSON.parse(cleaned);

    // Save to database
    const supabase = getAdminSupabase();
    const { data: savedScript } = await supabase
      .from("scripts")
      .upsert(
        {
          project_id: projectId,
          hook: scriptData.hook,
          body: scriptData.body,
          cta: scriptData.cta,
          full_text: scriptData.full_text,
        },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "script" })
      .eq("id", projectId);

    return NextResponse.json({ script: savedScript || scriptData });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}
