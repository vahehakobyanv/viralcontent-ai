import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

async function fetchStockVideo(topic: string): Promise<Buffer | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(topic)}&per_page=3&orientation=portrait`,
      { headers: { Authorization: apiKey } }
    );
    const data = await res.json();

    if (data.videos && data.videos.length > 0) {
      // Pick a random video from results
      const video =
        data.videos[Math.floor(Math.random() * data.videos.length)];
      // Get the HD quality portrait file
      const videoFile =
        video.video_files.find(
          (f: { quality: string; width: number }) =>
            f.quality === "hd" && f.width < f.width
        ) || video.video_files[0];

      const videoRes = await fetch(videoFile.link);
      return Buffer.from(await videoRes.arrayBuffer());
    }
  } catch (e) {
    console.error("Pexels API error:", e);
  }
  return null;
}

async function generatePlaceholderVideo(
  workDir: string,
  outputPath: string,
  duration: number
): Promise<void> {
  // Generate a simple gradient background video as placeholder
  await execAsync(
    `ffmpeg -y -f lavfi -i "color=c=black:s=1080x1920:d=${duration}" -vf "drawtext=text='ViralContent AI':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`,
    { cwd: workDir }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminSupabase();
    const { projectId, topic } = await req.json();

    // Fetch project data
    const [voiceRes, subtitleRes] = await Promise.all([
      supabase
        .from("voices")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("subtitles")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const voiceData = voiceRes.data;
    const subtitleData = subtitleRes.data;

    if (!voiceData || !subtitleData) {
      return NextResponse.json(
        { error: "Voice and subtitles are required" },
        { status: 400 }
      );
    }

    // Create working directory
    const workDir = join(tmpdir(), `viral_${projectId}_${Date.now()}`);
    await mkdir(workDir, { recursive: true });

    const audioPath = join(workDir, "audio.mp3");
    const srtPath = join(workDir, "subtitles.srt");
    const bgVideoPath = join(workDir, "background.mp4");
    const outputPath = join(workDir, "output.mp4");

    // Download audio
    const audioRes = await fetch(voiceData.audio_url);
    await writeFile(audioPath, Buffer.from(await audioRes.arrayBuffer()));

    // Write SRT file
    await writeFile(srtPath, subtitleData.srt_content);

    // Get audio duration
    let duration = 30;
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath}"`
      );
      duration = Math.ceil(parseFloat(stdout.trim()) || 30);
    } catch {
      // Use default duration
    }

    // Try to get stock video, or generate placeholder
    const stockVideo = await fetchStockVideo(topic);
    if (stockVideo) {
      await writeFile(bgVideoPath, stockVideo);
    } else {
      await generatePlaceholderVideo(workDir, bgVideoPath, duration);
    }

    // Render final video with FFmpeg
    // Combine: background video + audio + subtitles with TikTok-style effects
    const ffmpegCmd = [
      "ffmpeg -y",
      `-i "${bgVideoPath}"`,
      `-i "${audioPath}"`,
      `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles='${srtPath}':force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,MarginV=120,Alignment=2',zoompan=z='min(zoom+0.0005,1.2)':d=${duration * 25}:s=1080x1920:fps=25"`,
      "-c:v libx264 -preset fast -crf 23",
      "-c:a aac -b:a 192k",
      `-t ${duration}`,
      "-movflags +faststart",
      `"${outputPath}"`,
    ].join(" ");

    try {
      await execAsync(ffmpegCmd, { cwd: workDir, timeout: 120000 });
    } catch {
      // Fallback: simpler render without zoom effect
      const fallbackCmd = [
        "ffmpeg -y",
        `-i "${bgVideoPath}"`,
        `-i "${audioPath}"`,
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"`,
        "-c:v libx264 -preset fast -crf 23",
        "-c:a aac -b:a 192k",
        `-t ${duration}`,
        "-movflags +faststart",
        `"${outputPath}"`,
      ].join(" ");
      await execAsync(fallbackCmd, { cwd: workDir, timeout: 120000 });
    }

    // Read output file and upload
    const { readFile } = await import("fs/promises");
    const videoBuffer = await readFile(outputPath);
    const fileName = `video_${projectId}_${Date.now()}.mp4`;

    await supabase.storage.from("videos").upload(fileName, videoBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

    const {
      data: { publicUrl },
    } = supabase.storage.from("videos").getPublicUrl(fileName);

    // Check if user is on free plan (add watermark info)
    const hasWatermark = true; // TODO: check user plan

    // Save to database
    const { data: savedVideo } = await supabase
      .from("videos")
      .upsert(
        {
          project_id: projectId,
          video_url: publicUrl,
          format: "9:16",
          has_watermark: hasWatermark,
        },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "complete" })
      .eq("id", projectId);

    // Cleanup temp files
    await Promise.allSettled([
      unlink(audioPath),
      unlink(srtPath),
      unlink(bgVideoPath),
      unlink(outputPath),
    ]);

    return NextResponse.json({ video: savedVideo });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}
