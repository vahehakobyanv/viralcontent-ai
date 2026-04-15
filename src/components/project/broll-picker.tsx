"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  Loader2,
  Check,
  Play,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface BRollClip {
  id: number;
  url: string;
  thumbnail: string;
  duration: number;
  keyword: string;
}

interface BRollPickerProps {
  topic: string;
  onSelect: (clips: BRollClip[]) => void;
}

export default function BRollPicker({ topic, onSelect }: BRollPickerProps) {
  const [clips, setClips] = useState<BRollClip[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const fetchClips = async () => {
    setLoading(true);
    setClips([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/broll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords: [] }),
      });

      const data = await res.json();
      if (data.clips) {
        setClips(data.clips);
      }
    } catch {
      toast.error("Failed to fetch B-roll clips");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUseSelected = () => {
    const selectedClips = clips.filter((c) => selected.has(c.id));
    onSelect(selectedClips);
    toast.success(`${selectedClips.length} clip(s) added`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          B-Roll Clips
        </h3>
        <Button onClick={fetchClips} disabled={loading} size="sm">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            <>
              <Film className="w-4 h-4 mr-2" />
              Find B-Roll
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && clips.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className={`relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                  selected.has(clip.id)
                    ? "border-green-500 ring-2 ring-green-500/30"
                    : "border-transparent hover:border-primary/40"
                }`}
                onClick={() => toggleSelect(clip.id)}
              >
                {previewId === clip.id ? (
                  <div className="absolute inset-0 bg-black z-10">
                    <video
                      src={clip.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewId(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <img
                    src={clip.thumbnail}
                    alt={clip.keyword}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Duration overlay */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
                  <Clock className="w-3 h-3" />
                  {clip.duration}s
                </div>

                {/* Keyword badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {clip.keyword}
                  </Badge>
                </div>

                {/* Play icon */}
                {previewId !== clip.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewId(clip.id);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="p-2 rounded-full bg-black/60 text-white">
                      <Play className="w-5 h-5" />
                    </div>
                  </button>
                )}

                {/* Selection checkmark */}
                {selected.has(clip.id) && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-green-500 text-white">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <Button onClick={handleUseSelected} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Use Selected ({selected.size})
            </Button>
          )}
        </>
      )}

      {!loading && clips.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">
            Click &quot;Find B-Roll&quot; to search for stock footage matching
            your topic
          </p>
        </Card>
      )}
    </div>
  );
}
