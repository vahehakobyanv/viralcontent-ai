"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Sparkles, Loader2, Rocket } from "lucide-react";

type Idea = {
  title: string;
  hook: string;
  core_message: string;
  cta: string;
};

export default function BatchPage() {
  const router = useRouter();
  const [strategy, setStrategy] = useState("");
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState("en");
  const [tone, setTone] = useState("energetic");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = async () => {
    if (!strategy.trim()) {
      toast.error("Describe your content strategy first");
      return;
    }
    setGenerating(true);
    setIdeas([]);
    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, count, language, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setIdeas(data.ideas || []);
      toast.success(`Generated ${data.ideas?.length || 0} ideas`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const createOne = async (idea: Idea) => {
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: u.user.id,
        title: idea.title,
        topic: idea.title,
        tone,
        language,
        script: `${idea.hook}\n\n${idea.core_message}\n\n${idea.cta}`,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const createAll = async () => {
    setCreating(true);
    setProgress(0);
    let done = 0;
    try {
      for (const idea of ideas) {
        try {
          await createOne(idea);
        } catch (e) {
          console.error(e);
        }
        done += 1;
        setProgress(Math.round((done / ideas.length) * 100));
      }
      toast.success("All projects created!");
      router.push("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Zap className="h-3 w-3 mr-1" /> Pro Feature
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight glow-text">
            Batch Mode — Generate a Week of Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Spin up an entire week of viral TikToks in a single click.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Content Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">
              Describe your content strategy for the week
            </Label>
            <Textarea
              id="strategy"
              rows={4}
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="e.g. 5 motivation videos about success, mixing storytelling and hot takes"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="count">How many videos? (2-10)</Label>
              <Input
                id="count"
                type="number"
                min={2}
                max={10}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.max(2, Math.min(10, parseInt(e.target.value) || 2))
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="energetic">Energetic</option>
                <option value="educational">Educational</option>
                <option value="funny">Funny</option>
                <option value="inspirational">Inspirational</option>
                <option value="controversial">Controversial</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {count} ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="animate-slide-up">
          <Separator className="my-6" />
          <h2 className="text-2xl font-semibold mb-4">
            Your {ideas.length}-Video Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {ideas.map((idea, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-1">
                    Video {i + 1}
                  </Badge>
                  <CardTitle className="text-base">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-1">
                      Hook
                    </p>
                    <p className="text-sm">{idea.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-1">
                      CTA
                    </p>
                    <p className="text-sm">{idea.cta}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-auto"
                    onClick={async () => {
                      try {
                        const p = await createOne(idea);
                        toast.success("Project created");
                        router.push(`/project/${p.id}`);
                      } catch (e) {
                        toast.error(
                          e instanceof Error ? e.message : "Failed"
                        );
                      }
                    }}
                  >
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {creating && (
            <div className="mb-4">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Creating projects... {progress}%
              </p>
            </div>
          )}

          <Button
            onClick={createAll}
            disabled={creating}
            size="lg"
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" /> Create All {ideas.length}{" "}
                Projects
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
