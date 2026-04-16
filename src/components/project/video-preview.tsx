"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubtitleSegment } from "@/types";

interface VideoPreviewProps {
  script: string;
  segments: SubtitleSegment[];
  captionStyle: string;
}

export default function VideoPreview({
  script,
  segments,
  captionStyle,
}: VideoPreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration =
    segments.length > 0
      ? Math.max(...segments.map((s) => s.end))
      : 10;

  const tick = useCallback(() => {
    setCurrentTime((prev) => {
      const next = prev + 0.05;
      if (next >= totalDuration) {
        setPlaying(false);
        return 0;
      }
      return next;
    });
  }, [totalDuration]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(tick, 50);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, tick]);

  useEffect(() => {
    const idx = segments.findIndex(
      (s) => currentTime >= s.start && currentTime < s.end
    );
    setCurrentSegmentIndex(idx);
  }, [currentTime, segments]);

  function togglePlay() {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setPlaying((p) => !p);
  }

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const currentSegment =
    currentSegmentIndex >= 0 ? segments[currentSegmentIndex] : null;

  return (
    <div className="space-y-3">
      <div
        className="relative mx-auto overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 via-gray-800 to-black"
        style={{ maxWidth: 280, aspectRatio: "9/16" }}
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-transparent to-blue-900/20" />

        {/* Script text faded in background */}
        <div className="absolute inset-0 flex items-start justify-center p-6 pt-12 overflow-hidden">
          <p className="text-[10px] text-white/10 leading-relaxed line-clamp-[20]">
            {script}
          </p>
        </div>

        {/* Gradient overlay for caption readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Caption display */}
        <div className="absolute inset-x-0 bottom-16 flex items-center justify-center px-4">
          {currentSegment ? (
            <p
              className={`text-center text-lg font-bold leading-tight drop-shadow-lg ${captionStyle}`}
            >
              {currentSegment.text.split(" ").map((word, wi) => {
                const isHighlighted =
                  currentSegment.highlighted_words?.includes(word.toLowerCase());
                return (
                  <span
                    key={wi}
                    className={
                      isHighlighted ? "text-fuchsia-400" : "text-white"
                    }
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          ) : (
            <p className="text-white/30 text-sm text-center">
              {segments.length === 0
                ? "No subtitle segments"
                : playing
                  ? ""
                  : "Press play to preview"}
            </p>
          )}
        </div>

        {/* Play/pause overlay button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group cursor-pointer"
          aria-label={playing ? "Pause" : "Play"}
        >
          {!playing && (
            <div className="rounded-full bg-black/40 p-4 group-hover:bg-black/60 transition-colors">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          )}
        </button>

        {/* Progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div
            className="h-full bg-fuchsia-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls below */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlay}
          className="gap-2"
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Play
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
        </span>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Preview — actual video may differ
      </p>
    </div>
  );
}
