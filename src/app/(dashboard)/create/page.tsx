"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Zap,
  TrendingUp,
  ArrowRight,
  Layout,
  Flame,
  Link2,
} from "lucide-react";
import type { ContentIdea, ScriptTemplate } from "@/types";
import TrendingTopics from "@/components/create/trending-topics";
import ScriptTemplates from "@/components/create/script-templates";
import UrlToVideo from "@/app/(dashboard)/create/url-to-video";

const tones = [
  { value: "funny", label: "Funny", emoji: "😂" },
  { value: "motivational", label: "Motivational", emoji: "🔥" },
  { value: "aggressive", label: "Aggressive", emoji: "💪" },
  { value: "storytelling", label: "Storytelling", emoji: "📖" },
];

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageContent />
    </Suspense>
  );
}

function CreatePageContent() {
  const searchParams = useSearchParams();
  const isTrending = searchParams.get("mode") === "trending";

  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"en" | "ru">("en");
  const [tone, setTone] = useState<string>("motivational");
  const [viralMode, setViralMode] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(isTrending ? "trending" : "topic");
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);
  const router = useRouter();

  const generateIdeas = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setIdeas([]);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          tone,
          viralMode,
          templateId: selectedTemplate?.id,
        }),
      });
      const data = await res.json();
      if (data.ideas) setIdeas(data.ideas);
    } catch {
      // Error handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const selectIdea = async (idea: ContentIdea, index: number) => {
    setCreating(index);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: idea.title,
        topic,
        language,
        tone,
        status: "draft",
      })
      .select()
      .single();

    if (error || !project) {
      setCreating(null);
      return;
    }

    await supabase.from("scripts").insert({
      project_id: project.id,
      hook: idea.hook,
      body: idea.core_message,
      cta: idea.cta,
      full_text: `${idea.hook}\n\n${idea.core_message}\n\n${idea.cta}`,
    });

    await supabase
      .from("projects")
      .update({ status: "script" })
      .eq("id", project.id);

    router.push(`/project/${project.id}`);
  };

  const handleSelectTopic = (t: string) => {
    setTopic(t);
    setActiveTab("topic");
    setSelectedTemplate(null);
  };

  const handleSelectTemplate = (template: ScriptTemplate) => {
    setSelectedTemplate(template);
    setTopic(template.name);
    setActiveTab("topic");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Create Viral Content</h1>
        <p className="text-muted-foreground">
          Start with a topic, template, or trending idea
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="topic" className="gap-1 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">From</span> Topic
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1 text-xs sm:text-sm">
            <Layout className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="trending" className="gap-1 text-xs sm:text-sm">
            <Flame className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1 text-xs sm:text-sm">
            <Link2 className="w-4 h-4" />
            From URL
          </TabsTrigger>
        </TabsList>

        {/* From Topic Tab */}
        <TabsContent value="topic" className="animate-fade-in">
          <Card className="mb-8">
            <CardContent className="p-6 space-y-6">
              {/* Selected template indicator */}
              {selectedTemplate && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-lg">{selectedTemplate.emoji}</span>
                  <span className="text-sm font-medium">
                    Using template: {selectedTemplate.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 text-xs"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Clear
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder='e.g. "make money online", "fitness tips", "dating advice"'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-lg py-6"
                />
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

              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  viralMode
                    ? "border-primary bg-primary/5 glow"
                    : "border-border hover:border-primary/30"
                }`}
                onClick={() => setViralMode(!viralMode)}
              >
                <div className="flex items-center gap-3">
                  <Zap
                    className={`w-5 h-5 ${viralMode ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div>
                    <p className="font-semibold">Make It Viral Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Generate controversial, attention-grabbing hooks
                    </p>
                  </div>
                  {viralMode && <Badge className="ml-auto">ON</Badge>}
                </div>
              </div>

              <Button
                onClick={generateIdeas}
                disabled={loading || !topic.trim()}
                className="w-full py-6 text-lg glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate 5 Viral Ideas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="animate-fade-in">
          <ScriptTemplates onSelectTemplate={handleSelectTemplate} />
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="animate-fade-in">
          <TrendingTopics onSelectTopic={handleSelectTopic} />
        </TabsContent>

        {/* URL to Video Tab */}
        <TabsContent value="url" className="animate-fade-in">
          <UrlToVideo />
        </TabsContent>
      </Tabs>

      {/* Ideas Results */}
      {ideas.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Viral Ideas
          </h2>
          <div className="space-y-4">
            {ideas.map((idea, i) => (
              <Card
                key={i}
                className="hover:border-primary/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{idea.title}</span>
                    <Badge variant="secondary">#{i + 1}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                      Hook (First 2 Seconds)
                    </p>
                    <p className="text-sm">{idea.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Core Message
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {idea.core_message}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                      Call to Action
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {idea.cta}
                    </p>
                  </div>
                  <Button
                    onClick={() => selectIdea(idea, i)}
                    disabled={creating !== null}
                    className="w-full mt-2"
                  >
                    {creating === i ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Use This Idea
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
