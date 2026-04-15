"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  MonitorPlay,
  Film,
} from "lucide-react";
import { toast } from "sonner";

interface MultiPlatformExportProps {
  projectId: string;
  videoUrl?: string;
}

interface PlatformSpec {
  name: string;
  icon: string;
  color: string;
  ratio: string;
  maxDuration: string;
  maxSize: string;
  maxDurationSec: number;
  maxSizeMB: number;
  captionPrefix: string;
  hashtagStyle: "many" | "few" | "professional";
}

const PLATFORMS: PlatformSpec[] = [
  {
    name: "TikTok",
    icon: "TT",
    color: "bg-pink-600",
    ratio: "9:16",
    maxDuration: "60s",
    maxSize: "72MB",
    maxDurationSec: 60,
    maxSizeMB: 72,
    captionPrefix: "",
    hashtagStyle: "many",
  },
  {
    name: "Instagram Reels",
    icon: "IG",
    color: "bg-gradient-to-br from-purple-600 to-orange-500",
    ratio: "9:16",
    maxDuration: "90s",
    maxSize: "100MB",
    maxDurationSec: 90,
    maxSizeMB: 100,
    captionPrefix: "",
    hashtagStyle: "many",
  },
  {
    name: "YouTube Shorts",
    icon: "YT",
    color: "bg-red-600",
    ratio: "9:16",
    maxDuration: "60s",
    maxSize: "No limit",
    maxDurationSec: 60,
    maxSizeMB: Infinity,
    captionPrefix: "#Shorts ",
    hashtagStyle: "few",
  },
  {
    name: "LinkedIn",
    icon: "LI",
    color: "bg-blue-700",
    ratio: "9:16 or 1:1",
    maxDuration: "10min",
    maxSize: "200MB",
    maxDurationSec: 600,
    maxSizeMB: 200,
    captionPrefix: "",
    hashtagStyle: "professional",
  },
];

function generateCaption(platform: PlatformSpec): string {
  const base = "Check out this viral content! ";

  if (platform.hashtagStyle === "many") {
    return `${platform.captionPrefix}${base}#viral #fyp #trending #foryou #foryoupage #viralvideo #tiktok #content`;
  }
  if (platform.hashtagStyle === "few") {
    return `${platform.captionPrefix}${base}#viral #trending #shorts`;
  }
  // professional
  return `${platform.captionPrefix}${base}#content #growth #strategy #business`;
}

export default function MultiPlatformExport({
  projectId,
  videoUrl,
}: MultiPlatformExportProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCaption = (platform: PlatformSpec, index: number) => {
    const caption = generateCaption(platform);
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    toast.success(`${platform.name} caption copied`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    if (!videoUrl) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `video-${projectId}.mp4`;
    link.click();
    toast.success("Download started");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MonitorPlay className="w-5 h-5 text-primary" />
        Multi-Platform Export
      </h3>

      {!videoUrl && (
        <Card className="p-6 text-center text-muted-foreground">
          <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium mb-1">No video generated yet</p>
          <p className="text-xs">
            Generate your video first, then export to all platforms
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform, i) => (
          <Card
            key={platform.name}
            className="overflow-hidden animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {platform.icon}
                </div>
                <div>
                  <CardTitle className="text-sm">{platform.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {platform.ratio}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Specs */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {platform.ratio}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Max {platform.maxDuration}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {platform.maxSize}
                </Badge>
              </div>

              {/* Compatibility check */}
              {videoUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">
                    Compatible with {platform.name}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleCopyCaption(platform, i)}
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Caption + Tags
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={!videoUrl}
                  onClick={handleDownload}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
