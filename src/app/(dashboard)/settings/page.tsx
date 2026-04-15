"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Crown,
  Video,
  Shield,
  Trash2,
  Globe,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState<string>("");
  const [plan] = useState<"free" | "pro">("free");
  const [videosToday, setVideosToday] = useState(0);
  const [language, setLanguage] = useState("en");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("default_language");
      if (saved) setLanguage(saved);
    }

    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");

      // Count videos created today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      setVideosToday(count || 0);
    };

    load();
  }, []);

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;
    setLanguage(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("default_language", value);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app this would call an API endpoint
    setDeleteOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Info */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="text-sm font-medium">{email || "Loading..."}</p>
            </div>
            <Badge
              variant={plan === "pro" ? "default" : "secondary"}
              className="gap-1"
            >
              {plan === "pro" && <Crown className="w-3 h-3" />}
              {plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Videos created today
            </span>
            <span className="text-sm font-semibold">
              {videosToday} / {plan === "pro" ? "Unlimited" : "3"}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min((videosToday / 3) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold">Free</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>3 videos / day</li>
                <li>Basic voices</li>
                <li>Watermark</li>
              </ul>
            </div>
            <div className="rounded-lg border border-primary/50 p-4 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-medium">
                PRO
              </div>
              <h4 className="font-semibold">Pro</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Unlimited videos</li>
                <li>Premium voices</li>
                <li>No watermark</li>
              </ul>
            </div>
          </div>
          <Button disabled className="w-full glow gap-2">
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro - Coming Soon
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Preferences */}
      <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Default Language</Label>
              <p className="text-xs text-muted-foreground">
                Language for generated scripts
              </p>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-destructive/50 animate-slide-up"
        style={{ animationDelay: "0.25s" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete your account, all projects, scripts,
                  voiceovers, and videos. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
