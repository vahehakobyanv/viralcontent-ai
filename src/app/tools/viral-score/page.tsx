"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Loader2,
  ArrowRight,
  Lightbulb,
  Zap,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { ViralScore } from "@/types";

function ScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "text-green-500"
      : score >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <span className="absolute text-2xl font-bold">{score}</span>
    </div>
  );
}

export default function ViralScorePage() {
  const [script, setScript] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralScore | null>(null);

  async function analyze() {
    if (!script.trim()) {
      toast.error("Please paste a script to analyze");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, topic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.score);
    } catch {
      toast.error("Failed to analyze script. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const subScores = result
    ? [
        {
          label: "Hook Strength",
          value: result.hook_strength,
          icon: Zap,
        },
        {
          label: "Retention Potential",
          value: result.retention_potential,
          icon: Eye,
        },
        {
          label: "CTA Effectiveness",
          value: result.cta_effectiveness,
          icon: MousePointerClick,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center rounded-full bg-fuchsia-500/10 p-3 mb-2">
          <BarChart3 className="h-8 w-8 text-fuchsia-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Free Viral Score Checker
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Test if your TikTok script will go viral. AI-powered analysis.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              placeholder="e.g. fitness, cooking, tech reviews"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="script">Your Script</Label>
            <Textarea
              id="script"
              placeholder="Paste your TikTok script here..."
              rows={6}
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>
          <Button
            onClick={analyze}
            disabled={loading}
            className="w-full glow bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Check Viral Score"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-slide-up">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <h2 className="text-lg font-semibold">Overall Viral Score</h2>
              <ScoreRing score={result.overall} size={140} />
              <p className="text-sm text-muted-foreground">
                {result.overall >= 75
                  ? "Strong viral potential!"
                  : result.overall >= 50
                    ? "Decent, but there is room to improve."
                    : "Needs significant work to go viral."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {subScores.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="pt-6 text-center space-y-2">
                  <Icon className="h-5 w-5 mx-auto text-fuchsia-400" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        value >= 75
                          ? "bg-green-500"
                          : value >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.tips && result.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Tips to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-6 text-center space-y-3">
        <h3 className="text-lg font-semibold">
          Ready to create the video? Let AI handle everything.
        </h3>
        <p className="text-sm text-muted-foreground">
          From script to published video — fully automated.
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
