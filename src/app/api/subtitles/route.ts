import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSRT(
  segments: { start: number; end: number; text: string }[]
): string {
  return segments
    .map((seg, i) => {
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
      };
      return `${i + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}\n`;
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, text, language } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a subtitle generator for TikTok-style videos. Break the script into short subtitle segments optimized for vertical video.

Rules:
- Each segment should be 2-5 words maximum (TikTok style)
- Include timing based on natural speech pace (~150 words per minute)
- Identify 1-2 keywords per segment to highlight
- Language: ${language === "ru" ? "Russian" : "English"}

Respond with JSON array of objects:
[{ "start": 0.0, "end": 1.5, "text": "short phrase", "highlighted_words": ["keyword"] }]

Make timestamps realistic for a 30-60 second video.
Respond ONLY with the JSON array, no other text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "[]";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const captionsJson = JSON.parse(cleaned);

    const srtContent = generateSRT(captionsJson);

    // Save to database
    const { data: savedSubtitle } = await supabase
      .from("subtitles")
      .upsert(
        {
          project_id: projectId,
          srt_content: srtContent,
          captions_json: captionsJson,
        },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "subtitles" })
      .eq("id", projectId);

    return NextResponse.json({ subtitle: savedSubtitle });
  } catch (error) {
    console.error("Subtitles generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate subtitles" },
      { status: 500 }
    );
  }
}
