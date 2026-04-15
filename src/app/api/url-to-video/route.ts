import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { url, language, tone } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Fetch the URL content
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ViralContentAI/1.0; +https://viralcontent.ai)",
      },
    });

    if (!pageRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch the URL" },
        { status: 400 }
      );
    }

    const html = await pageRes.text();
    const text = stripHtml(html);

    // Limit text to ~4000 chars to stay within token limits
    const truncatedText = text.slice(0, 4000);

    const langInstruction =
      language === "ru"
        ? "Write the script in Russian."
        : "Write the script in English.";

    const response = await getOpenAI().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a viral TikTok scriptwriter. Summarize the given article into a 30-60 second TikTok script.

Structure:
- hook: The first 2 seconds — must stop the scroll immediately (1-2 sentences)
- body: Key points from the article, delivered in a punchy engaging way (3-5 sentences)
- cta: A strong call to action (1 sentence)
- full_text: The complete script combining hook, body, and cta

Also provide:
- title: A catchy title for the video (under 10 words)
- summary: A 1-sentence summary of the article

Tone: ${tone || "motivational"}
${langInstruction}

Respond with a JSON object: { "script": { "hook": string, "body": string, "cta": string, "full_text": string }, "title": string, "summary": string }
Respond ONLY with the JSON, no other text.`,
        },
        {
          role: "user",
          content: `Article content:\n\n${truncatedText}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || "{}";
    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error("URL to video error:", error);
    return NextResponse.json(
      { error: "Failed to convert URL to script" },
      { status: 500 }
    );
  }
}
