"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa_dismissed";

export default function MobileInstallPrompt() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isStandalone = useMediaQuery("(display-mode: standalone)");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (isMobile && !isStandalone && !dismissed && deferredPrompt) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [isMobile, isStandalone, dismissed, deferredPrompt]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  const install = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // ignore
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-3 left-3 right-3 z-50 animate-slide-up md:hidden"
      role="dialog"
      aria-label="Install app"
    >
      <div className="rounded-xl border bg-background/95 backdrop-blur shadow-lg p-3 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-primary/10 p-2">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-medium">Install ViralContent AI as an app</p>
          <p className="text-xs text-muted-foreground">
            Faster launches. Works offline.
          </p>
        </div>
        <Button size="sm" onClick={install}>
          Install
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
