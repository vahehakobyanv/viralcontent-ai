import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { projectId, audioBase64, voiceId, speed } = await req.json();

    if (!audioBase64) {
      return NextResponse.json(
        { error: "Audio data is required. Voice is generated in the browser." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // Decode base64 audio from browser recording
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const fileName = `voice_${projectId}_${Date.now()}.webm`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, audioBuffer, {
        contentType: "audio/webm",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("audio").getPublicUrl(fileName);

    // Save to database
    const { data: savedVoice } = await supabase
      .from("voices")
      .upsert(
        {
          project_id: projectId,
          audio_url: publicUrl,
          voice_id: voiceId || "browser-default",
          speed: speed || 1.0,
        },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "voice" })
      .eq("id", projectId);

    return NextResponse.json({ voice: savedVoice });
  } catch (error) {
    console.error("Voice upload error:", error);
    return NextResponse.json(
      { error: "Failed to save voice" },
      { status: 500 }
    );
  }
}
