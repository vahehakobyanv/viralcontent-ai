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
  Clock,
  Sparkles,
} from "lucide-react";
import type { Project } from "@/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ videos: 0, scripts: 0, voices: 0 });

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setProjects(data);

      // Fetch stats
      const [videosRes, scriptsRes, voicesRes] = await Promise.all([
        supabase
          .from("videos")
          .select("id", { count: "exact", head: true })
          .in(
            "project_id",
            (data || []).map((p) => p.id)
          ),
        supabase
          .from("scripts")
          .select("id", { count: "exact", head: true })
          .in(
            "project_id",
            (data || []).map((p) => p.id)
          ),
        supabase
          .from("voices")
          .select("id", { count: "exact", head: true })
          .in(
            "project_id",
            (data || []).map((p) => p.id)
          ),
      ]);

      setStats({
        videos: videosRes.count || 0,
        scripts: scriptsRes.count || 0,
        voices: voicesRes.count || 0,
      });

      setLoading(false);
    };

    fetchProjects();
  }, []);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Videos Created", value: stats.videos, icon: Video },
          { label: "Scripts Written", value: stats.scripts, icon: FileText },
          { label: "Voiceovers", value: stats.voices, icon: Mic },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects */}
      <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first viral video in minutes
            </p>
            <Link href="/create">
              <Button className="glow">
                <Plus className="w-4 h-4 mr-2" />
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
  );
}
