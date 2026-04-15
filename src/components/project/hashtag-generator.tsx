"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Hash, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { HashtagSet } from "@/types";

interface HashtagGeneratorProps {
  topic: string;
  script: string;
}

export default function HashtagGenerator({
  topic,
  script,
}: HashtagGeneratorProps) {
  const [hashtags, setHashtags] = useState<HashtagSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script }),
      });
      const data = await res.json();
      if (data.hashtags) {
        setHashtags(data.hashtags);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!hashtags) return;
    const text = hashtags.hashtags.join(" ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All hashtags copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyOne(tag: string) {
    await navigator.clipboard.writeText(tag);
    toast.success(`${tag} copied!`);
  }

  if (!hashtags) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <Hash className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Generate optimized hashtags for maximum reach
          </p>
          <Button onClick={generate} disabled={loading || !topic}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Hashtags"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Hashtags
          <Button variant="outline" size="sm" onClick={copyAll}>
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copy All
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Volume */}
        {hashtags.high_volume.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              High Volume
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.high_volume.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer bg-green-500/15 text-green-400 hover:bg-green-500/25"
                  onClick={() => copyOne(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Niche */}
        {hashtags.niche.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Niche
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.niche.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                  onClick={() => copyOne(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* All */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            All Hashtags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {hashtags.hashtags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => copyOne(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Regenerate"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
