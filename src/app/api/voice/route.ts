import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Voice ID mapping for ElevenLabs
const voiceMap: Record<string, string> = {
  "female-energetic": "21m00Tcm4TlvDq8ikWAM", // Rachel
  "female-calm": "EXAVITQu4vr4xnSDxMaL", // Bella
  "male-energetic": "ErXwobaYiN019PkySvjV", // Antoni
  "male-calm": "VR6AewLTigWG4xSOukaG", // Arnold
  "male-aggressive": "pNInz6obpgDQGcFmaJgB", // Adam
};

export async function POST(req: NextRequest) {
  try {
    const { projectId, text, voiceId, speed } = await req.json();

    const elevenLabsVoiceId = voiceMap[voiceId] || voiceMap["female-energetic"];

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: speed || 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const fileName = `voice_${projectId}_${Date.now()}.mp3`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
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
          voice_id: voiceId,
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
    console.error("Voice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate voice" },
      { status: 500 }
    );
  }
}
