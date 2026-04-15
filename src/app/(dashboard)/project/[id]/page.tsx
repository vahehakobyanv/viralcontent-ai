"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  FileText,
  Mic,
  Subtitles,
  Video,
  Download,
  RefreshCw,
  Play,
  Share2,
  Sparkles,
  Check,
} from "lucide-react";
import type { Project, Script, Voice, Subtitle, Video as VideoType } from "@/types";

const steps = [
  { key: "script", label: "Script", icon: FileText },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "subtitles", label: "Subtitles", icon: Subtitles },
  { key: "video", label: "Video", icon: Video },
];

const stepOrder = ["draft", "script", "voice", "subtitles", "video", "complete"];

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [subtitle, setSubtitle] = useState<Subtitle | null>(null);
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Editor state
  const [editedScript, setEditedScript] = useState("");
  const [voiceId, setVoiceId] = useState("female-energetic");
  const [speed, setSpeed] = useState([1.0]);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [projectRes, scriptRes, voiceRes, subtitleRes, videoRes] =
      await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase
          .from("scripts")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("voices")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("subtitles")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("videos")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]);

    if (projectRes.data) setProject(projectRes.data);
    if (scriptRes.data) {
      setScript(scriptRes.data);
      setEditedScript(scriptRes.data.full_text);
    }
    if (voiceRes.data) setVoice(voiceRes.data);
    if (subtitleRes.data) setSubtitle(subtitleRes.data);
    if (videoRes.data) setVideo(videoRes.data);

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentStepIndex = project
    ? stepOrder.indexOf(project.status)
    : 0;
  const progressPercent = (currentStepIndex / (stepOrder.length - 1)) * 100;

  const generateScript = async () => {
    setActionLoading("script");
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          topic: project?.topic,
          language: project?.language,
          tone: project?.tone,
          existingHook: script?.hook,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setScript(data.script);
        setEditedScript(data.script.full_text);
        setProject((p) => (p ? { ...p, status: "script" } : null));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const saveScript = async () => {
    if (!script) return;
    setActionLoading("save-script");
    const supabase = createClient();
    const parts = editedScript.split("\n\n");
    await supabase
      .from("scripts")
      .update({
        hook: parts[0] || "",
        body: parts.slice(1, -1).join("\n\n"),
        cta: parts[parts.length - 1] || "",
        full_text: editedScript,
      })
      .eq("id", script.id);
    setActionLoading(null);
  };

  const generateVoice = async () => {
    setActionLoading("voice");
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          text: editedScript,
          voiceId,
          speed: speed[0],
        }),
      });
      const data = await res.json();
      if (data.voice) {
        setVoice(data.voice);
        setProject((p) => (p ? { ...p, status: "voice" } : null));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const generateSubtitles = async () => {
    setActionLoading("subtitles");
    try {
      const res = await fetch("/api/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          text: editedScript,
          language: project?.language,
        }),
      });
      const data = await res.json();
      if (data.subtitle) {
        setSubtitle(data.subtitle);
        setProject((p) => (p ? { ...p, status: "subtitles" } : null));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const generateVideo = async () => {
    setActionLoading("video");
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          topic: project?.topic,
        }),
      });
      const data = await res.json();
      if (data.video) {
        setVideo(data.video);
        setProject((p) => (p ? { ...p, status: "complete" } : null));
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {project.title || project.topic}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary">{project.language.toUpperCase()}</Badge>
            <Badge variant="secondary" className="capitalize">
              {project.tone}
            </Badge>
          </div>
        </div>
        {video && (
          <div className="flex gap-2">
            <a href={video.video_url} download>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </a>
            <Button size="sm" className="gap-2 glow">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, i) => {
              const stepIdx = stepOrder.indexOf(step.key);
              const isComplete = currentStepIndex > stepIdx;
              const isCurrent = project.status === step.key;
              return (
                <div
                  key={step.key}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isComplete
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${
                      isCurrent
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < steps.length - 1 && (
                    <Separator className="w-8 sm:w-16" />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Script Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Script
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editedScript}
            onChange={(e) => setEditedScript(e.target.value)}
            placeholder="Your script will appear here..."
            rows={10}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveScript}
              disabled={actionLoading === "save-script"}
            >
              {actionLoading === "save-script" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              onClick={generateScript}
              disabled={actionLoading === "script"}
              className="gap-2"
            >
              {actionLoading === "script" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Script
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            AI Voice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={voiceId} onValueChange={(v) => v && setVoiceId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female-energetic">
                    Female - Energetic
                  </SelectItem>
                  <SelectItem value="female-calm">
                    Female - Calm
                  </SelectItem>
                  <SelectItem value="male-energetic">
                    Male - Energetic
                  </SelectItem>
                  <SelectItem value="male-calm">Male - Calm</SelectItem>
                  <SelectItem value="male-aggressive">
                    Male - Aggressive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Speed: {speed[0].toFixed(1)}x
              </label>
              <Slider
                value={speed}
                onValueChange={(v) => setSpeed(Array.isArray(v) ? v : [v])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-3"
              />
            </div>
          </div>

          {voice && (
            <div className="p-4 rounded-lg bg-accent/50 flex items-center gap-4">
              <a href={voice.audio_url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Play Audio
                </Button>
              </a>
              <span className="text-sm text-muted-foreground">
                Voice generated
              </span>
            </div>
          )}

          <Button
            onClick={generateVoice}
            disabled={actionLoading === "voice" || !editedScript.trim()}
            className="gap-2"
          >
            {actionLoading === "voice" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Voice...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {voice ? "Regenerate Voice" : "Generate Voice"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Subtitles Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-primary" />
            Subtitles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subtitle && (
            <div className="space-y-2">
              <div className="p-4 rounded-lg bg-accent/50 max-h-48 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {subtitle.srt_content}
                </pre>
              </div>
              <div className="flex gap-2">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(subtitle.srt_content)}`}
                  download="subtitles.srt"
                >
                  <Button variant="outline" size="sm">
                    Download SRT
                  </Button>
                </a>
                <a
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(subtitle.captions_json, null, 2))}`}
                  download="captions.json"
                >
                  <Button variant="outline" size="sm">
                    Download JSON
                  </Button>
                </a>
              </div>
            </div>
          )}

          <Button
            onClick={generateSubtitles}
            disabled={actionLoading === "subtitles" || !editedScript.trim()}
            className="gap-2"
          >
            {actionLoading === "subtitles" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Subtitles...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {subtitle ? "Regenerate Subtitles" : "Generate Subtitles"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Video Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {video && (
            <div className="space-y-4">
              <div className="aspect-[9/16] max-w-xs mx-auto rounded-xl overflow-hidden bg-black">
                <video
                  src={video.video_url}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex justify-center gap-2">
                <a href={video.video_url} download>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download MP4
                  </Button>
                </a>
                <Button className="gap-2 glow">
                  <Share2 className="w-4 h-4" />
                  Share Video
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={generateVideo}
            disabled={actionLoading === "video" || !voice || !subtitle}
            className="w-full py-6 text-lg glow gap-2"
          >
            {actionLoading === "video" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Rendering Video... This may take a minute
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {video ? "Regenerate Video" : "Generate Video"}
              </>
            )}
          </Button>
          {!voice && !subtitle && (
            <p className="text-sm text-muted-foreground text-center">
              Generate voice and subtitles first
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
