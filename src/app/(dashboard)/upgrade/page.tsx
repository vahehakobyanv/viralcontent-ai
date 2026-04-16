"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Check, X, Sparkles, Loader2 } from "lucide-react";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const start = async (plan: "monthly" | "yearly") => {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDialogOpen(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  const features: {
    label: string;
    free: string | boolean;
    pro: string | boolean;
  }[] = [
    { label: "Videos per month", free: "5", pro: "Unlimited" },
    { label: "Watermark", free: "Yes", pro: "No" },
    { label: "Voices", free: "Standard", pro: "Premium" },
    { label: "AI features", free: "Limited", pro: "Unlimited" },
    { label: "Batch mode", free: false, pro: true },
    { label: "Priority support", free: false, pro: true },
    { label: "Team seats", free: false, pro: true },
    { label: "API access", free: false, pro: true },
    { label: "Brand kit", free: "Basic", pro: "Advanced" },
  ];

  const renderCell = (v: string | boolean) => {
    if (v === true) return <Check className="h-4 w-4 text-emerald-500" />;
    if (v === false) return <X className="h-4 w-4 text-muted-foreground" />;
    return <span className="text-sm">{v}</span>;
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 animate-fade-in">
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="glow rounded-full p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold glow-text">
          Upgrade to Pro
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Unlock unlimited viral videos, premium voices, and pro-only features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <p className="text-4xl font-bold mt-2">
              $19<span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Billed monthly. Cancel anytime.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              disabled={loading !== null}
              onClick={() => start("monthly")}
            >
              {loading === "monthly" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Start Pro Trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-primary/40 glow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              2 months free
            </Badge>
          </div>
          <CardHeader>
            <CardTitle>Yearly</CardTitle>
            <p className="text-4xl font-bold mt-2">
              $190<span className="text-base font-normal text-muted-foreground">/yr</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Save $38 — just $15.83/mo.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              disabled={loading !== null}
              onClick={() => start("yearly")}
            >
              {loading === "yearly" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" /> Start Pro Trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Free vs Pro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Feature</th>
                  <th className="text-center py-3 font-medium">Free</th>
                  <th className="text-center py-3 font-medium">
                    <span className="flex items-center justify-center gap-1 glow-text">
                      <Crown className="h-4 w-4" /> Pro
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.label} className="border-b last:border-0">
                    <td className="py-3">{f.label}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex justify-center">
                        {renderCell(f.free)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex justify-center">
                        {renderCell(f.pro)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center">What creators say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Maria R.",
              handle: "@mariacreates",
              avatar: "M",
              text:
                "Went from 200 to 40k followers in 6 weeks. ViralContent AI writes better hooks than I do.",
            },
            {
              name: "Dev K.",
              handle: "@devbuilds",
              avatar: "D",
              text:
                "Batch mode is a cheat code. I schedule a month of videos on Sunday mornings now.",
            },
            {
              name: "Priya S.",
              handle: "@priyatalks",
              avatar: "P",
              text:
                "The Pro voices are indistinguishable from real creators. Worth 10x the price.",
            },
          ].map((t) => (
            <Card key={t.handle}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.handle}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-center">FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Yes. Cancel from settings with one click — no phone calls, no
              emails.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Every Pro plan starts with a 7-day free trial. You won&apos;t be
              charged until day 8.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Yes. 30-day money-back guarantee if Pro isn&apos;t right for you.
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl glow-text">
              Pro trial activated!
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Demo mode — no payment processed. In production this would open a
              Stripe checkout flow.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setDialogOpen(false)}>Start creating</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
