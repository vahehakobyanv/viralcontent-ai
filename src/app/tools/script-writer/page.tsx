"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Copy, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ContentIdea } from "@/types";

export default function ScriptWriterPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("funny");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<ContentIdea | null>(null);

  async function generate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    setIdea(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.ideas && data.ideas.length > 0) {
        setIdea(data.ideas[0]);
      }
    } catch {
      toast.error("Failed to generate script. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyScript() {
    if (!idea) return;
    const text = `Hook: ${idea.hook}\n\n${idea.core_message}\n\nCTA: ${idea.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Script copied to clipboard!");
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center rounded-full bg-fuchsia-500/10 p-3 mb-2">
          <FileText className="h-8 w-8 text-fuchsia-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Free AI TikTok Script Writer
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Write viral TikTok scripts in seconds. Powered by AI.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. 5 productivity hacks, day in my life as a developer"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) => v && setTone(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => v && setLanguage(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={loading}
            className="w-full glow bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Writing...
              </>
            ) : (
              "Write My Script"
            )}
          </Button>
        </CardContent>
      </Card>

      {idea && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{idea.title}</h2>
            <Button variant="outline" size="sm" onClick={copyScript}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Script
            </Button>
          </div>

          <Card className="border-yellow-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-400 uppercase tracking-wide">
                Hook — First 2 Seconds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-yellow-300">
                {idea.hook}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                Body
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">
                {idea.core_message}
              </p>
            </CardContent>
          </Card>

          <Card className="border-fuchsia-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-fuchsia-400 uppercase tracking-wide">
                Call to Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-fuchsia-300">{idea.cta}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6 text-center space-y-3">
        <h3 className="text-lg font-semibold">
          Turn this script into a full video with AI
        </h3>
        <p className="text-sm text-muted-foreground">
          Voiceover, subtitles, b-roll, and editing — all automated.
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
