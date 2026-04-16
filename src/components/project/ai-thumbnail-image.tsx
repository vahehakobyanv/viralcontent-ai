"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, Download, Check, RefreshCw, Loader2 } from "lucide-react";

interface AiThumbnailImageProps {
  topic: string;
  script: string;
}

type Variation = {
  id: number;
  label: string;
  prompt: (topic: string) => string;
};

const VARIATIONS: Variation[] = [
  {
    id: 0,
    label: "Cinematic",
    prompt: (t) => `cinematic photo of ${t}, vertical 9:16, dramatic lighting`,
  },
  {
    id: 1,
    label: "Illustration",
    prompt: (t) =>
      `stylized illustration of ${t}, bold colors, tiktok thumbnail`,
  },
  {
    id: 2,
    label: "Minimalist",
    prompt: (t) => `minimalist graphic design, ${t}, vertical`,
  },
  {
    id: 3,
    label: "Viral",
    prompt: (t) => `shocking viral thumbnail, ${t}, high contrast`,
  },
];

function buildUrl(prompt: string, seed: number) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt
  )}?width=1080&height=1920&nologo=true&seed=${seed}`;
}

export default function AiThumbnailImage({
  topic,
  script,
}: AiThumbnailImageProps) {
  const [started, setStarted] = useState(false);
  const [urls, setUrls] = useState<(string | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState<boolean[]>([false, false, false, false]);
  const [selected, setSelected] = useState<number | null>(null);

  const effectiveTopic = (topic && topic.trim()) || script.slice(0, 80) || "viral video";

  const generateAll = () => {
    setStarted(true);
    const newUrls = VARIATIONS.map((v) =>
      buildUrl(v.prompt(effectiveTopic), Math.floor(Math.random() * 1_000_000))
    );
    setUrls(newUrls);
    setLoading([true, true, true, true]);
  };

  const regenerate = (i: number) => {
    const v = VARIATIONS[i];
    const url = buildUrl(
      v.prompt(effectiveTopic),
      Math.floor(Math.random() * 1_000_000)
    );
    setUrls((u) => u.map((x, idx) => (idx === i ? url : x)));
    setLoading((l) => l.map((x, idx) => (idx === i ? true : x)));
  };

  const onLoaded = (i: number) => {
    setLoading((l) => l.map((x, idx) => (idx === i ? false : x)));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Thumbnails
            </h3>
            <p className="text-xs text-muted-foreground">
              Free, watermark-free, generated via Pollinations.
            </p>
          </div>
          <Button onClick={generateAll} size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            {started ? "Regenerate All" : "Generate AI Thumbnails"}
          </Button>
        </div>

        {started && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VARIATIONS.map((v, i) => {
              const url = urls[i];
              const isLoading = loading[i];
              return (
                <div
                  key={v.id}
                  className={`flex flex-col gap-2 rounded-lg border p-2 max-w-[180px] ${
                    selected === i ? "border-primary" : ""
                  }`}
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md bg-muted">
                    {isLoading && (
                      <Skeleton className="absolute inset-0 z-10" />
                    )}
                    {url && (
                      <Image
                        src={url}
                        alt={v.label}
                        fill
                        unoptimized
                        className="object-cover"
                        onLoad={() => onLoaded(i)}
                        onError={() => onLoaded(i)}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-center font-medium">
                    {v.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant={selected === i ? "default" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => {
                        setSelected(i);
                        toast.success(`Using ${v.label} thumbnail`);
                      }}
                      disabled={!url || isLoading}
                    >
                      <Check className="h-3 w-3 mr-1" /> Use This
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => url && window.open(url, "_blank")}
                        disabled={!url || isLoading}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => regenerate(i)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
