"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Image,
  Loader2,
  Check,
  Copy,
  Download,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Thumbnail {
  text: string;
  emoji: string;
  style: "bold" | "minimal" | "gradient" | "neon";
}

interface ThumbnailGeneratorProps {
  topic: string;
  script: string;
}

const STYLE_CONFIG: Record<
  string,
  {
    bg: string;
    textClass: string;
    textStyle?: React.CSSProperties;
  }
> = {
  bold: {
    bg: "bg-black",
    textClass: "text-3xl font-black text-white tracking-tight leading-tight",
  },
  minimal: {
    bg: "bg-zinc-900",
    textClass: "text-base font-light text-zinc-200 tracking-wide leading-relaxed",
  },
  gradient: {
    bg: "bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900",
    textClass: "text-2xl font-bold leading-tight",
    textStyle: {
      background: "linear-gradient(135deg, #c084fc, #f472b6, #fb923c)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  neon: {
    bg: "bg-gray-950",
    textClass: "text-2xl font-bold text-cyan-400 leading-tight",
    textStyle: {
      textShadow:
        "0 0 7px #22d3ee, 0 0 10px #22d3ee, 0 0 21px #22d3ee, 0 0 42px #0ea5e9",
    },
  },
};

export default function ThumbnailGenerator({
  topic,
  script,
}: ThumbnailGeneratorProps) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = async () => {
    setLoading(true);
    setThumbnails([]);
    setSelected(null);

    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script }),
      });

      const data = await res.json();
      if (data.thumbnails) {
        setThumbnails(data.thumbnails);
      }
    } catch {
      toast.error("Failed to generate thumbnails");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadThumbnail = useCallback(
    (thumb: Thumbnail) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 9:16 ratio
      canvas.width = 540;
      canvas.height = 960;

      // Background
      const bgColors: Record<string, string> = {
        bold: "#000000",
        minimal: "#18181b",
        gradient: "#581c87",
        neon: "#030712",
      };
      ctx.fillStyle = bgColors[thumb.style] || "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Emoji
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.fillText(thumb.emoji, canvas.width / 2, canvas.height / 2 - 60);

      // Text
      const fontSize =
        thumb.style === "bold"
          ? 48
          : thumb.style === "minimal"
            ? 28
            : 40;
      ctx.font = `${thumb.style === "minimal" ? "300" : "800"} ${fontSize}px sans-serif`;
      ctx.textAlign = "center";

      if (thumb.style === "neon") {
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#22d3ee";
      } else if (thumb.style === "gradient") {
        const grad = ctx.createLinearGradient(100, 0, canvas.width - 100, 0);
        grad.addColorStop(0, "#c084fc");
        grad.addColorStop(0.5, "#f472b6");
        grad.addColorStop(1, "#fb923c");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = thumb.style === "minimal" ? "#d4d4d8" : "#ffffff";
      }

      // Wrap text
      const words = thumb.text.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxWidth = canvas.width - 80;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = fontSize * 1.3;
      const startY =
        canvas.height / 2 + 20 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });

      ctx.shadowBlur = 0;

      // Download
      const link = document.createElement("a");
      link.download = `thumbnail-${thumb.style}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Thumbnail downloaded");
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Image className="w-5 h-5 text-primary" />
          Thumbnails
        </h3>
        <Button onClick={generate} disabled={loading} size="sm">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Thumbnails
            </>
          )}
        </Button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-lg bg-muted animate-pulse"
              style={{ maxWidth: 120 }}
            />
          ))}
        </div>
      )}

      {!loading && thumbnails.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {thumbnails.map((thumb, i) => {
            const config = STYLE_CONFIG[thumb.style] || STYLE_CONFIG.bold;
            return (
              <div key={i} className="space-y-2">
                <div
                  onClick={() => setSelected(i)}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition-all flex flex-col items-center justify-center p-3 ${config.bg} ${
                    selected === i
                      ? "border-green-500 ring-2 ring-green-500/30"
                      : "border-transparent hover:border-primary/40"
                  }`}
                  style={{ maxWidth: 120 }}
                >
                  <span className="text-2xl mb-2">{thumb.emoji}</span>
                  <p
                    className={`text-center ${config.textClass}`}
                    style={{
                      ...config.textStyle,
                      fontSize:
                        thumb.style === "bold"
                          ? 14
                          : thumb.style === "minimal"
                            ? 10
                            : 12,
                    }}
                  >
                    {thumb.text}
                  </p>

                  {selected === i && (
                    <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-green-500 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex gap-1" style={{ maxWidth: 120 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => copyText(thumb.text)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => downloadThumbnail(thumb)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && thumbnails.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">
            Generate AI-powered thumbnail text for your video
          </p>
        </Card>
      )}
    </div>
  );
}
