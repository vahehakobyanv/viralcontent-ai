"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const tones = [
  { value: "funny", label: "Funny", emoji: "😂" },
  { value: "motivational", label: "Motivational", emoji: "🔥" },
  { value: "aggressive", label: "Aggressive", emoji: "💪" },
  { value: "storytelling", label: "Storytelling", emoji: "📖" },
];

interface ScriptResult {
  script: {
    hook: string;
    body: string;
    cta: string;
    full_text: string;
  };
  title: string;
  summary: string;
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UrlToVideo() {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "ru">("en");
  const [tone, setTone] = useState("motivational");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const router = useRouter();

  const urlValid = isValidUrl(url);

  const handleConvert = async () => {
    if (!urlValid) {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/url-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, language, tone }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
    } catch {
      toast.error("Failed to convert URL");
    } finally {
      setLoading(false);
    }
  };

  const handleUseScript = async () => {
    if (!result) return;

    setCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please sign in to continue");
      setCreating(false);
      return;
    }

    try {
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: result.title,
          topic: url,
          language,
          tone,
          status: "draft",
        })
        .select()
        .single();

      if (error || !project) {
        toast.error("Failed to create project");
        setCreating(false);
        return;
      }

      await supabase.from("scripts").insert({
        project_id: project.id,
        hook: result.script.hook,
        body: result.script.body,
        cta: result.script.cta,
        full_text: result.script.full_text,
      });

      await supabase
        .from("projects")
        .update({ status: "script" })
        .eq("id", project.id);

      router.push(`/project/${project.id}`);
    } catch {
      toast.error("Failed to create project");
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="url">Article / Blog URL</Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://example.com/article..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 text-base py-5"
              />
            </div>
            {url && !urlValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as "en" | "ru")}
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

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            disabled={loading || !urlValid}
            className="w-full py-5 text-base glow"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Converting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Convert to Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {result.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-[10px]">
                  HOOK
                </Badge>
              </div>
              <p className="text-sm font-medium">{result.script.hook}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-[10px]">
                  BODY
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.script.body}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">
                  CTA
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.script.cta}
              </p>
            </div>

            <Button
              onClick={handleUseScript}
              disabled={creating}
              className="w-full mt-4 glow"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Use This Script
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
