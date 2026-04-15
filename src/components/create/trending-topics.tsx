"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, TrendingUp, Minus, Sparkles, Loader2 } from "lucide-react";
import { TRENDING_CATEGORIES, CURATED_TRENDING_TOPICS } from "@/lib/constants";
import type { TrendingTopic } from "@/types";

interface TrendingTopicsProps {
  onSelectTopic: (topic: string) => void;
}

export default function TrendingTopics({ onSelectTopic }: TrendingTopicsProps) {
  const [category, setCategory] = useState<string>("All");
  const [aiTopics, setAiTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);

  const allTopics = [...CURATED_TRENDING_TOPICS, ...aiTopics];
  const filtered =
    category === "All"
      ? allTopics
      : allTopics.filter((t) => t.category === category);

  async function fetchAiSuggestions() {
    setLoading(true);
    try {
      const res = await fetch("/api/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.topics) {
        setAiTopics((prev) => [...prev, ...data.topics]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function popularityIcon(popularity: TrendingTopic["popularity"]) {
    switch (popularity) {
      case "hot":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "rising":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case "steady":
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {TRENDING_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((topic, i) => (
          <Card
            key={`${topic.title}-${i}`}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onSelectTopic(topic.title)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm leading-tight">
                  {topic.title}
                </h3>
                {popularityIcon(topic.popularity)}
              </div>
              <p className="text-xs text-muted-foreground">
                {topic.description}
              </p>
              <Badge variant="secondary" className="text-[10px]">
                {topic.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={fetchAiSuggestions}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating suggestions...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Suggestions
          </>
        )}
      </Button>
    </div>
  );
}
