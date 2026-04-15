"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { CAPTION_STYLES } from "@/lib/constants";
import { useUiStore } from "@/store/ui";
import type { SubtitleSegment } from "@/types";

interface CaptionPreviewProps {
  segments: SubtitleSegment[];
}

export default function CaptionPreview({ segments }: CaptionPreviewProps) {
  const { captionStyle, setCaptionStyle } = useUiStore();
  const [playing, setPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSegment = segments[currentSegmentIndex] || null;
  const words = currentSegment ? currentSegment.text.split(" ") : [];

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing || segments.length === 0) {
      stop();
      return;
    }

    setVisibleWordCount(0);

    const segment = segments[currentSegmentIndex];
    if (!segment) {
      setPlaying(false);
      return;
    }

    const segmentWords = segment.text.split(" ");
    const durationMs = (segment.end - segment.start) * 1000;
    const wordInterval = durationMs / segmentWords.length;
    let count = 0;

    timerRef.current = setInterval(() => {
      count++;
      setVisibleWordCount(count);
      if (count >= segmentWords.length) {
        stop();
        setTimeout(() => {
          setCurrentSegmentIndex((prev) => {
            const next = prev + 1;
            if (next >= segments.length) {
              setPlaying(false);
              return 0;
            }
            return next;
          });
        }, 300);
      }
    }, Math.max(wordInterval, 80));

    return stop;
  }, [playing, currentSegmentIndex, segments, stop]);

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      stop();
    } else {
      setCurrentSegmentIndex(0);
      setVisibleWordCount(0);
      setPlaying(true);
    }
  }

  const styleClassName =
    CAPTION_STYLES.find((s) => s.id === captionStyle)?.className ||
    "caption-classic";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Caption Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Frame */}
        <div className="mx-auto max-w-[200px]">
          <div
            className="relative rounded-2xl bg-black overflow-hidden"
            style={{ aspectRatio: "9/16" }}
          >
            <div className="absolute inset-0 flex items-end justify-center pb-8 px-3">
              <div className={`text-center ${styleClassName}`}>
                {words.map((word, i) => (
                  <span
                    key={`${currentSegmentIndex}-${i}`}
                    className={`inline-block mx-0.5 text-xs font-bold transition-opacity duration-150 ${
                      i < visibleWordCount
                        ? "opacity-100 animate-word-reveal"
                        : "opacity-0"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Play/Pause */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            disabled={segments.length === 0}
          >
            {playing ? (
              <>
                <Pause className="mr-1 h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" />
                Play
              </>
            )}
          </Button>
        </div>

        {/* Style Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {CAPTION_STYLES.map((style) => (
            <Button
              key={style.id}
              variant={captionStyle === style.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCaptionStyle(style.id)}
              className="text-xs"
            >
              {style.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
