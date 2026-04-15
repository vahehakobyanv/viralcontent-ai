"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Mic, Subtitles, Video } from "lucide-react";
import type { Project } from "@/types";

const steps = [
  { key: "script", label: "Script", icon: FileText },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "subtitles", label: "Subtitles", icon: Subtitles },
  { key: "video", label: "Video", icon: Video },
] as const;

function getCurrentStepIndex(status: Project["status"]): number {
  const map: Record<string, number> = {
    draft: 0,
    script: 1,
    voice: 2,
    subtitles: 3,
    video: 3,
  };
  return map[status] ?? 0;
}

interface ContinueCardProps {
  project: Project;
}

export function ContinueCard({ project }: ContinueCardProps) {
  const currentIdx = getCurrentStepIndex(project.status);

  return (
    <Card className="border-l-4 border-l-primary glow animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Continue where you left off
            </p>
            <h3 className="font-semibold text-lg truncate">
              {project.title || project.topic}
            </h3>
            <div className="flex items-center gap-1 mt-3">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="flex items-center gap-1">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                        isComplete
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-4 h-px ${
                          idx < currentIdx ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <Link href={`/project/${project.id}`}>
            <Button className="glow gap-2 shrink-0">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
