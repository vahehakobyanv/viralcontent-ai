"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Trophy,
  Copy,
  ExternalLink,
  MessageCircle,
  Gift,
  Users,
  Sparkles,
  Share2,
} from "lucide-react";

export default function InvitePage() {
  const [code, setCode] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? "anonuser";
      const c = id.replace(/-/g, "").slice(0, 8).toUpperCase();
      setCode(c);
      if (typeof window !== "undefined") {
        setLink(`${window.location.origin}/signup?ref=${c}`);
      }
      setLoading(false);
    };
    load();
  }, []);

  const inviteMessage = `I've been using ViralContent AI to create TikToks in minutes — it's insane. Sign up with my link and we both get Pro free: ${link}`;

  const copy = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Could not copy");
    }
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      inviteMessage
    )}`;
    window.open(url, "_blank");
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 animate-fade-in">
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="glow rounded-full p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight glow-text mb-3">
          Invite Friends, Get Pro Free
        </h1>
        <p className="text-lg text-muted-foreground">
          Share ViralContent AI with your network and earn free Pro days.
        </p>
      </div>

      <Card className="mb-6 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={loading ? "Loading..." : link}
              className="font-mono text-sm"
            />
            <Button onClick={() => copy(link, "Link copied!")}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Your code:{" "}
            <Badge variant="secondary" className="font-mono">
              {code || "…"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={shareTwitter}>
              <ExternalLink className="h-4 w-4 mr-2" /> Share on Twitter
            </Button>
            <Button variant="outline" onClick={shareWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" /> Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => copy(inviteMessage, "Message copied!")}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <Gift className="h-8 w-8 text-emerald-500 mb-2" />
            <CardTitle>Invite 1 friend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold glow-text">7 days Pro free</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-primary/40">
          <CardHeader>
            <Gift className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Invite 3 friends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold glow-text">30 days Pro free</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-yellow-500/40">
          <CardHeader>
            <Sparkles className="h-8 w-8 text-yellow-500 mb-2" />
            <CardTitle>Invite 10 friends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold glow-text">3 months Pro free</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Invites Sent</p>
            </div>
            <div>
              <p className="text-3xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Signups</p>
            </div>
            <div>
              <p className="text-3xl font-bold glow-text">0</p>
              <p className="text-xs text-muted-foreground">Pro Days Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
