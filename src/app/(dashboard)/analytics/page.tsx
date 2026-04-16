"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Video,
  FileText,
  CheckCircle2,
  TrendingUp,
  Target,
  Calendar,
} from "lucide-react";
import type { Project } from "@/types";

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("weeklyGoal");
    if (saved) setWeeklyGoal(parseInt(saved, 10));
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setProjects((data as Project[]) || []);
    setLoading(false);
  }

  function saveGoal(val: number) {
    const clamped = Math.max(1, Math.min(val, 50));
    setWeeklyGoal(clamped);
    localStorage.setItem("weeklyGoal", clamped.toString());
    setEditingGoal(false);
  }

  // Stats
  const totalVideos = projects.filter((p) => p.status === "complete").length;
  const totalScripts = projects.length;
  const completionRate =
    totalScripts > 0 ? Math.round((totalVideos / totalScripts) * 100) : 0;

  // Streak calculation
  const streak = useMemo(() => {
    if (projects.length === 0) return 0;
    const dates = new Set(
      projects.map((p) => new Date(p.created_at).toISOString().split("T")[0])
    );
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (dates.has(key)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [projects]);

  // Heatmap data (last 12 weeks)
  const heatmapData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const key = new Date(p.created_at).toISOString().split("T")[0];
      counts[key] = (counts[key] || 0) + 1;
    });

    const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let w = 11; w >= 0; w--) {
      const week: { date: string; count: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() - w * 7 + d);
        const key = date.toISOString().split("T")[0];
        week.push({ date: key, count: counts[key] || 0, dayOfWeek: d });
      }
      weeks.push(week);
    }
    return weeks;
  }, [projects]);

  // Tone breakdown
  const toneBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.tone] = (counts[p.tone] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // Language breakdown
  const langBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.language] = (counts[p.language] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // Weekly progress
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return projects.filter((p) => new Date(p.created_at) >= startOfWeek).length;
  }, [projects]);

  const toneColors: Record<string, string> = {
    funny: "bg-yellow-500",
    motivational: "bg-orange-500",
    aggressive: "bg-red-500",
    storytelling: "bg-blue-500",
  };

  const langLabels: Record<string, string> = {
    en: "English",
    ru: "Russian",
  };

  const langColors: Record<string, string> = {
    en: "bg-blue-400",
    ru: "bg-purple-400",
  };

  function heatColor(count: number) {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    return "bg-primary/80";
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 h-24 animate-pulse bg-muted/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your content creation journey
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVideos}</p>
              <p className="text-xs text-muted-foreground">Total Videos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalScripts}</p>
              <p className="text-xs text-muted-foreground">Total Scripts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">--</p>
              <p className="text-xs text-muted-foreground">Avg Viral Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creation Streak + Weekly Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Creation Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Flame className="h-12 w-12 text-orange-500" />
              <span className="text-5xl font-bold glow-text">{streak}</span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>

            {/* Heatmap */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last 12 weeks
              </p>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {heatmapData.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${heatColor(day.count)} transition-colors`}
                        title={`${day.date}: ${day.count} project${day.count !== 1 ? "s" : ""}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-muted/30" />
                <div className="w-3 h-3 rounded-sm bg-primary/30" />
                <div className="w-3 h-3 rounded-sm bg-primary/50" />
                <div className="w-3 h-3 rounded-sm bg-primary/80" />
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">{weeklyProgress}</span>
              <span className="text-xl text-muted-foreground">
                {" "}
                / {weeklyGoal}
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                videos this week
              </p>
            </div>
            <Progress
              value={Math.min((weeklyProgress / weeklyGoal) * 100, 100)}
              className="h-3"
            />
            {weeklyProgress >= weeklyGoal && (
              <p className="text-center text-sm text-green-500 font-medium">
                Goal reached! Great work!
              </p>
            )}
            <div className="flex items-center justify-center gap-2">
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={weeklyGoal}
                    className="w-20 h-8 text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveGoal(
                          parseInt((e.target as HTMLInputElement).value, 10)
                        );
                      }
                    }}
                    onBlur={(e) =>
                      saveGoal(parseInt(e.target.value, 10))
                    }
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">
                    /week
                  </span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGoal(true)}
                  className="text-xs"
                >
                  Change goal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone Breakdown */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Breakdown by Tone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(toneBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet
              </p>
            ) : (
              <>
                {/* CSS pie chart */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{
                      background: `conic-gradient(${Object.entries(toneBreakdown)
                        .reduce(
                          (acc, [tone, count], i) => {
                            const pct = (count / totalScripts) * 100;
                            const colors: Record<string, string> = {
                              funny: "#eab308",
                              motivational: "#f97316",
                              aggressive: "#ef4444",
                              storytelling: "#3b82f6",
                            };
                            const color = colors[tone] || "#6b7280";
                            const start = acc.offset;
                            const end = start + pct;
                            acc.segments.push(
                              `${color} ${start}% ${end}%`
                            );
                            acc.offset = end;
                            return acc;
                          },
                          { segments: [] as string[], offset: 0 }
                        )
                        .segments.join(", ")})`,
                    }}
                  />
                </div>
                {Object.entries(toneBreakdown).map(([t, count]) => (
                  <div key={t} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${toneColors[t] || "bg-gray-500"}`}
                      />
                      <span className="text-sm capitalize">{t}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Breakdown by Language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(langBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet
              </p>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div
                    className="w-32 h-32 rounded-full"
                    style={{
                      background: `conic-gradient(${Object.entries(langBreakdown)
                        .reduce(
                          (acc, [lang, count]) => {
                            const pct = (count / totalScripts) * 100;
                            const colors: Record<string, string> = {
                              en: "#60a5fa",
                              ru: "#a78bfa",
                            };
                            const color = colors[lang] || "#6b7280";
                            const start = acc.offset;
                            const end = start + pct;
                            acc.segments.push(
                              `${color} ${start}% ${end}%`
                            );
                            acc.offset = end;
                            return acc;
                          },
                          { segments: [] as string[], offset: 0 }
                        )
                        .segments.join(", ")})`,
                    }}
                  />
                </div>
                {Object.entries(langBreakdown).map(([l, count]) => (
                  <div key={l} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${langColors[l] || "bg-gray-500"}`}
                      />
                      <span className="text-sm">
                        {langLabels[l] || l}
                      </span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Performing */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.filter((p) => p.status === "complete").length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No completed projects yet. Keep creating!
            </p>
          ) : (
            <div className="space-y-3">
              {projects
                .filter((p) => p.status === "complete")
                .slice(0, 10)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {p.tone}
                      </Badge>
                      <Badge variant="secondary" className="text-xs uppercase">
                        {p.language}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
