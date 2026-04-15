"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Mic,
  Video,
  Subtitles,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import type { Project } from "@/types";

const statusConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  draft: { icon: PenLine, label: "Draft", color: "bg-muted text-muted-foreground" },
  script: { icon: FileText, label: "Script", color: "bg-blue-500/20 text-blue-400" },
  voice: { icon: Mic, label: "Voice", color: "bg-purple-500/20 text-purple-400" },
  subtitles: { icon: Subtitles, label: "Subtitles", color: "bg-yellow-500/20 text-yellow-400" },
  video: { icon: Video, label: "Video", color: "bg-orange-500/20 text-orange-400" },
  complete: { icon: CheckCircle2, label: "Complete", color: "bg-green-500/20 text-green-400" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ActivityFeedProps {
  projects: Project[];
}

export function ActivityFeed({ projects }: ActivityFeedProps) {
  const recent = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Vertical timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          {recent.map((project) => {
            const config = statusConfig[project.status] || statusConfig.draft;
            const Icon = config.icon;

            return (
              <div key={project.id} className="relative flex items-start gap-3 pl-1">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium truncate">
                    {project.title || project.topic}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={config.color}>
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(project.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
