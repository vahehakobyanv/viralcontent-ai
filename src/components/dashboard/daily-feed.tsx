"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import type { TrendingTopic, ContentIdea } from "@/types";

const categories = [
  "Business & Finance",
  "Health & Fitness",
  "Tech & AI",
  "Lifestyle",
  "Comedy & Entertainment",
  "Education",
  "Food & Cooking",
  "Travel",
  "Fashion & Beauty",
  "Motivation",
];

export default function DailyFeed() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHooks, setPreviewHooks] = useState<Record<number, string>>({});
  const [loadingIdea, setLoadingIdea] = useState<number | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  async function fetchTrending() {
    setLoading(true);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    try {
      const res = await fetch("/api/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: randomCategory }),
      });

      const data = await res.json();
      const topicsList = Array.isArray(data.topics) ? data.topics.slice(0, 3) : [];
      setTopics(topicsList);
      setPreviewHooks({});
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrending();
  }, []);

  async function handleQuickStart(index: number, topic: TrendingTopic) {
    setLoadingIdea(index);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.title,
          language: "en",
          tone: "funny",
        }),
      });

      const data = await res.json();
      const ideas: ContentIdea[] = Array.isArray(data.ideas) ? data.ideas : [];
      if (ideas.length > 0) {
        setPreviewHooks((prev) => ({ ...prev, [index]: ideas[0].hook }));
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingIdea(null);
    }
  }

  const popularityColors: Record<string, string> = {
    hot: "bg-red-500/10 text-red-400 border-red-500/20",
    rising: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    steady: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            Today&apos;s Trending
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{today}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTrending}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No trending topics available right now. Try refreshing.
          </p>
        ) : (
          topics.map((topic, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <h3 className="font-medium text-sm truncate">{topic.title}</h3>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-xs ${popularityColors[topic.popularity] || ""}`}
                >
                  {topic.popularity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {topic.description}
              </p>
              {previewHooks[index] && (
                <div className="text-xs bg-primary/5 border border-primary/10 rounded-md p-2 italic text-muted-foreground">
                  <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                  &ldquo;{previewHooks[index]}&rdquo;
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                disabled={loadingIdea === index}
                onClick={() => handleQuickStart(index, topic)}
              >
                {loadingIdea === index ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3 h-3" />
                    Quick Start
                  </>
                )}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
