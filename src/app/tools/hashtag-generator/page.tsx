"use client";

import { useState } from "react";
import Link from "next/link";
import { Hash, Copy, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { HashtagSet } from "@/types";

export default function HashtagGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashtagSet | null>(null);

  async function generate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.hashtags);
    } catch {
      toast.error("Failed to generate hashtags. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result) return;
    navigator.clipboard.writeText(result.hashtags.join(" "));
    toast.success("Hashtags copied to clipboard!");
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center rounded-full bg-fuchsia-500/10 p-3 mb-2">
          <Hash className="h-8 w-8 text-fuchsia-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Free TikTok Hashtag Generator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate trending hashtags for your TikTok videos instantly. No
          sign-up required.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">What is your video about?</Label>
            <Input
              id="topic"
              placeholder="e.g. morning routine, cooking pasta, gym motivation"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>
          <Button
            onClick={generate}
            disabled={loading}
            className="w-full glow bg-fuchsia-600 hover:bg-fuchsia-700"
          >
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

      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Hashtags</h2>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
          </div>

          {result.high_volume && result.high_volume.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  High Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.high_volume.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        toast.success(`Copied ${tag}`);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.niche && result.niche.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Niche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.niche.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        toast.success(`Copied ${tag}`);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">All Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => {
                      navigator.clipboard.writeText(tag);
                      toast.success(`Copied ${tag}`);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6 text-center space-y-3">
        <h3 className="text-lg font-semibold">
          Want the full experience? Create viral videos with AI
        </h3>
        <p className="text-sm text-muted-foreground">
          Scripts, voiceover, subtitles, and video — all automated.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
