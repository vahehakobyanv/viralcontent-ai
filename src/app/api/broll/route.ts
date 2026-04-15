import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

interface PexelsVideo {
  id: number;
  image: string;
  duration: number;
  video_files: Array<{
    link: string;
    quality: string;
    width: number;
    height: number;
  }>;
}

interface BRollClip {
  id: number;
  url: string;
  thumbnail: string;
  duration: number;
  keyword: string;
}

const MOCK_CLIPS: BRollClip[] = [
  { id: 1001, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+1", duration: 8, keyword: "stock" },
  { id: 1002, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+2", duration: 12, keyword: "stock" },
  { id: 1003, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+3", duration: 6, keyword: "stock" },
  { id: 1004, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+4", duration: 10, keyword: "stock" },
  { id: 1005, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+5", duration: 15, keyword: "stock" },
  { id: 1006, url: "https://placeholder.co/1080x1920.mp4", thumbnail: "https://placeholder.co/270x480?text=B-Roll+6", duration: 9, keyword: "stock" },
];

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords: providedKeywords } = await req.json();

    let keywords: string[] = providedKeywords;

    if (!keywords || keywords.length === 0) {
      const response = await getOpenAI().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Generate 5 short search keywords for finding B-roll stock video footage related to the given topic. Return ONLY a JSON array of strings, no other text.",
          },
          {
            role: "user",
            content: `Topic: ${topic}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const content = response.choices[0].message.content || "[]";
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      keywords = JSON.parse(cleaned);
    }

    const pexelsKey = process.env.PEXELS_API_KEY;

    if (!pexelsKey) {
      return NextResponse.json({ clips: MOCK_CLIPS });
    }

    const allClips: BRollClip[] = [];
    const seenIds = new Set<number>();

    for (const keyword of keywords) {
      try {
        const res = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(keyword)}&per_page=3&orientation=portrait`,
          {
            headers: { Authorization: pexelsKey },
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const videos: PexelsVideo[] = data.videos || [];

        for (const video of videos) {
          if (seenIds.has(video.id)) continue;
          seenIds.add(video.id);

          const portraitFile = video.video_files.find(
            (f) => f.quality === "sd" || f.quality === "hd"
          );

          allClips.push({
            id: video.id,
            url: portraitFile?.link || video.video_files[0]?.link || "",
            thumbnail: video.image,
            duration: video.duration,
            keyword,
          });
        }
      } catch {
        // Skip failed keyword searches
      }
    }

    return NextResponse.json({ clips: allClips.length > 0 ? allClips : MOCK_CLIPS });
  } catch (error) {
    console.error("B-roll fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch B-roll clips" },
      { status: 500 }
    );
  }
}
