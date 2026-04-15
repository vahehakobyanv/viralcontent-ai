"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BarChart3, RefreshCw } from "lucide-react";
import type { ViralScore as ViralScoreType } from "@/types";

interface ViralScoreProps {
  script: string;
  topic: string;
  tone: string;
}

export default function ViralScore({ script, topic, tone }: ViralScoreProps) {
  const [score, setScore] = useState<ViralScoreType | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, topic, tone }),
      });
      const data = await res.json();
      if (data.score) {
        setScore(data.score);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const circumference = 2 * Math.PI * 54;
  const offset = score
    ? circumference - (score.overall / 100) * circumference
    : circumference;

  function scoreColor(val: number) {
    if (val >= 75) return "text-green-500";
    if (val >= 50) return "text-yellow-500";
    return "text-red-500";
  }

  function barColor(val: number) {
    if (val >= 75) return "bg-green-500";
    if (val >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  if (!score) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Analyze your script to see its viral potential score
          </p>
          <Button onClick={analyze} disabled={loading || !script}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Viral Potential"
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
          Viral Score
          <Button variant="ghost" size="sm" onClick={analyze} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Score */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className="text-primary transition-all duration-1000 ease-out"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor(score.overall)}`}>
                {score.overall}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Hook Strength</span>
              <span className={scoreColor(score.hook_strength)}>
                {score.hook_strength}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor(score.hook_strength)}`}
                style={{ width: `${score.hook_strength}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Retention Potential</span>
              <span className={scoreColor(score.retention_potential)}>
                {score.retention_potential}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor(score.retention_potential)}`}
                style={{ width: `${score.retention_potential}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>CTA Effectiveness</span>
              <span className={scoreColor(score.cta_effectiveness)}>
                {score.cta_effectiveness}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor(score.cta_effectiveness)}`}
                style={{ width: `${score.cta_effectiveness}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        {score.tips && score.tips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Tips to Improve</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              {score.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
