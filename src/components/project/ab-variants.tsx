"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, FlaskConical, Check } from "lucide-react";
import { toast } from "sonner";

interface Variant {
  variant: string;
  strategy: string;
  hook: string;
  full_text: string;
}

interface ABVariantsProps {
  script: string;
  topic: string;
  tone: string;
  language: string;
  onSelectVariant: (text: string) => void;
}

export default function ABVariants({
  script,
  topic,
  tone,
  language,
  onSelectVariant,
}: ABVariantsProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  async function generateVariants() {
    setLoading(true);
    setVariants([]);
    setSelected(null);

    try {
      const res = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, topic, tone, language }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error("Failed to generate variants");
        return;
      }
      if (data.variants) {
        setVariants(data.variants);
        toast.success("3 variants generated!");
      }
    } catch {
      toast.error("Failed to generate variants");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(v: Variant) {
    setSelected(v.variant);
    onSelectVariant(v.full_text);
    toast.success(`Variant ${v.variant} selected`);
  }

  const variantColors: Record<string, string> = {
    A: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    B: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    C: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  };

  if (variants.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <FlaskConical className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Generate A/B variants to test different hook strategies
          </p>
          <Button onClick={generateVariants} disabled={!script}>
            <FlaskConical className="mr-2 h-4 w-4" />
            Generate A/B Variants
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">A/B Variants</h3>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">A/B Variants</h3>
        <Button variant="outline" size="sm" onClick={generateVariants}>
          Regenerate
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {variants.map((v) => (
          <Card
            key={v.variant}
            className={`transition-all ${
              selected === v.variant
                ? "border-primary glow"
                : "hover:border-primary/40"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-lg px-3 py-1 font-bold ${variantColors[v.variant] || ""}`}
                >
                  {v.variant}
                </Badge>
                {selected === v.variant && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <CardTitle className="text-sm text-muted-foreground mt-1">
                {v.strategy} Hook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                  Hook
                </p>
                <p className="text-sm font-medium bg-primary/5 p-2 rounded">
                  {v.hook}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                  Full Script
                </p>
                <p className="text-xs text-muted-foreground line-clamp-4">
                  {v.full_text}
                </p>
              </div>
              <Button
                onClick={() => handleSelect(v)}
                variant={selected === v.variant ? "default" : "outline"}
                className="w-full"
                size="sm"
              >
                {selected === v.variant ? "Selected" : "Use This Version"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
