"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Video,
  FileText,
  Mic,
  Sparkles,
  Lightbulb,
  Clapperboard,
} from "lucide-react";
import type { Project } from "@/types";
import { SkeletonDashboard } from "@/components/shared/skeleton-card";
import { Sparkline } from "@/components/dashboard/sparkline";
import { ContinueCard } from "@/components/dashboard/continue-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { useUiStore } from "@/store/ui";

// Generate simple sparkline data from projects for the last 7 days
function getLast7DaysCounts(items: { created_at: string }[]): number[] {
  const counts = Array(7).fill(0);
  const now = new Date();
  for (const item of items) {
    const created = new Date(item.created_at);
    const diffDays = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays < 7) {
      counts[6 - diffDays]++;
    }
  }
  return counts;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ videos: 0, scripts: 0, voices: 0 });
  const [sparkData, setSparkData] = useState({
    videos: [0, 0, 0, 0, 0, 0, 0],
    scripts: [0, 0, 0, 0, 0, 0, 0],
    voices: [0, 0, 0, 0, 0, 0, 0],
  });

  const onboardingComplete = useUiStore((s) => s.onboardingComplete);

  useEffect(() => {
    const fetchProjects = async () => {
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

      const projectsList = data || [];
      setProjects(projectsList);

      const projectIds = projectsList.map((p) => p.id);

      if (projectIds.length > 0) {
        const [videosRes, scriptsRes, voicesRes] = await Promise.all([
          supabase
            .from("videos")
            .select("id, created_at", { count: "exact" })
            .in("project_id", projectIds),
          supabase
            .from("scripts")
            .select("id, created_at", { count: "exact" })
            .in("project_id", projectIds),
          supabase
            .from("voices")
            .select("id, created_at", { count: "exact" })
            .in("project_id", projectIds),
        ]);

        setStats({
          videos: videosRes.count || 0,
          scripts: scriptsRes.count || 0,
          voices: voicesRes.count || 0,
        });

        setSparkData({
          videos: getLast7DaysCounts(videosRes.data || []),
          scripts: getLast7DaysCounts(scriptsRes.data || []),
          voices: getLast7DaysCounts(voicesRes.data || []),
        });
      }

      setLoading(false);
    };

    fetchProjects();
  }, []);

  const incompleteProject = projects.find((p) => p.status !== "complete");

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    script: "bg-blue-500/20 text-blue-400",
    voice: "bg-purple-500/20 text-purple-400",
    subtitles: "bg-yellow-500/20 text-yellow-400",
    video: "bg-orange-500/20 text-orange-400",
    complete: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="p-8">
      {/* Onboarding modal */}
      {!onboardingComplete && <OnboardingModal />}

      {/* Header */}
      <div
        className="flex items-center justify-between mb-8 animate-slide-up"
        style={{ animationDelay: "0s" }}
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your viral content command center
          </p>
        </div>
        <Link href="/create">
          <Button className="glow gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        </Link>
      </div>

      {loading ? (
        <SkeletonDashboard />
      ) : (
        <>
          {/* Continue Card */}
          {incompleteProject && (
            <div
              className="mb-6 animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
              <ContinueCard project={incompleteProject} />
            </div>
          )}

          {/* Stats */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {[
              {
                label: "Videos Created",
                value: stats.videos,
                icon: Video,
                data: sparkData.videos,
              },
              {
                label: "Scripts Written",
                value: stats.scripts,
                icon: FileText,
                data: sparkData.scripts,
              },
              {
                label: "Voiceovers",
                value: stats.voices,
                icon: Mic,
                data: sparkData.voices,
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <Sparkline data={stat.data} className="opacity-60" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Feed */}
          {projects.length > 0 && (
            <div
              className="mb-8 animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <ActivityFeed projects={projects} />
            </div>
          )}

          {/* Projects */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-semibold mb-2">
                    Create your first viral video
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Get started in three simple steps
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
                    {[
                      {
                        step: 1,
                        icon: Lightbulb,
                        title: "Pick a Topic",
                        desc: "Choose a trending topic or enter your own",
                      },
                      {
                        step: 2,
                        icon: FileText,
                        title: "Generate Script",
                        desc: "AI writes a viral hook, body, and CTA",
                      },
                      {
                        step: 3,
                        icon: Clapperboard,
                        title: "Create Video",
                        desc: "Add voice, subtitles, and export",
                      },
                    ].map((item) => (
                      <Card key={item.step} className="text-left">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                              {item.step}
                            </span>
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <h4 className="text-sm font-semibold mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.desc}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Link href="/create">
                    <Button className="glow gap-2">
                      <Plus className="w-4 h-4" />
                      Create First Video
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold truncate pr-2">
                            {project.title || project.topic}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={statusColor[project.status]}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="uppercase">{project.language}</span>
                          <span className="capitalize">{project.tone}</span>
                          <span>
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
