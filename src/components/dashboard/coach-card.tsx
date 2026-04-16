"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Flame, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";

interface CoachSuggestion {
  title: string;
  topic: string;
  reason: string;
}

interface CoachResult {
  analysis: string;
  suggestions: CoachSuggestion[];
  streak: number;
  tip: string;
}

interface CoachCardProps {
  projects: Project[];
}

function calculateStreak(projects: Project[]): number {
  if (projects.length === 0) return 0;

  const dates = projects
    .map((p) => new Date(p.created_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (dates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function CoachCard({ projects }: CoachCardProps) {
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);

  const localStreak = calculateStreak(projects);

  async function fetchCoaching() {
    setLoading(true);
    try {
      const projectData = projects.map((p) => ({
        topic: p.topic,
        tone: p.tone,
        status: p.status,
        created_at: p.created_at,
      }));

      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: projectData, language: "en" }),
      });

      if (!res.ok) throw new Error("Failed to get coaching");

      const data: CoachResult = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to get AI coaching. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Content Coach
          </CardTitle>
          {localStreak > 0 && (
            <Badge variant="outline" className="gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {localStreak} day streak
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && !loading && (
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Get personalized content advice based on your {projects.length} project{projects.length !== 1 ? "s" : ""}.
            </p>
            <Button
              onClick={fetchCoaching}
              className="glow gap-2"
              disabled={projects.length === 0}
            >
              <Sparkles className="w-4 h-4" />
              Get AI Coaching
            </Button>
            {projects.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create your first project to unlock coaching.
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Analysis */}
            <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-3">
              <p className="text-sm">{result.analysis}</p>
            </div>

            {/* Daily Tip */}
            {result.tip && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{result.tip}</p>
              </div>
            )}

            {/* Streak from AI */}
            {(result.streak > 0 || localStreak > 0) && (
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">
                  {Math.max(result.streak, localStreak)} day streak
                </span>
                <span className="text-muted-foreground">— Keep going!</span>
              </div>
            )}

            {/* Suggestions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Personalized Ideas
              </h4>
              {result.suggestions?.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-medium text-sm">{suggestion.title}</h5>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {suggestion.topic}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.reason}
                  </p>
                  <Link
                    href={`/create?topic=${encodeURIComponent(suggestion.topic)}`}
                  >
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Create This
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoaching}
              className="w-full gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get Fresh Advice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
