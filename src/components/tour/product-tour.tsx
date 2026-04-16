"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TourStep {
  target: string; // CSS selector or "body-center"
  title: string;
  description: string;
}

const STEPS: TourStep[] = [
  {
    target: ".tour-create-btn",
    title: "Create your first video",
    description: "Click here to start a new project from scratch.",
  },
  {
    target: ".tour-trending-tab",
    title: "Pick from trending topics",
    description: "Browse what's hot right now and ride the wave.",
  },
  {
    target: ".tour-script-tab",
    title: "Choose a script template",
    description: "Hand-crafted templates that are proven to convert.",
  },
  {
    target: ".tour-voice-tab",
    title: "Or speak your idea",
    description: "Record a voice note — we'll turn it into a script.",
  },
  {
    target: "body",
    title: "You're ready!",
    description: "Start creating and watch your content take off.",
  },
];

const STORAGE_KEY = "product_tour_complete";

interface ProductTourProps {
  hasProjects: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function ProductTour({ hasProjects }: ProductTourProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Initial mount check
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY) === "true";
    if (!done && !hasProjects) {
      setActive(true);
    }
  }, [hasProjects]);

  const isLast = step === STEPS.length - 1;
  const currentStep = STEPS[step];
  const isCenter = currentStep?.target === "body";

  const measure = useCallback(() => {
    if (!active || !currentStep) return;
    if (isCenter) {
      setRect(null);
      return;
    }
    const el = document.querySelector(currentStep.target) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [active, currentStep, isCenter]);

  useLayoutEffect(() => {
    measure();
  }, [measure, step]);

  useEffect(() => {
    if (!active) return;
    const h = () => measure();
    window.addEventListener("resize", h);
    window.addEventListener("scroll", h, true);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("scroll", h, true);
    };
  }, [active, measure]);

  const complete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setActive(false);
    setStep(0);
  }, []);

  const next = () => {
    if (isLast) {
      complete();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  if (!active || !currentStep) return null;

  const padding = 8;
  const cutoutTop = rect ? rect.top - padding : 0;
  const cutoutLeft = rect ? rect.left - padding : 0;
  const cutoutWidth = rect ? rect.width + padding * 2 : 0;
  const cutoutHeight = rect ? rect.height + padding * 2 : 0;

  // Tooltip placement — below target if room, else above; center if no target
  let tipStyle: React.CSSProperties;
  if (isCenter || !rect) {
    tipStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  } else {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
    const vh = typeof window !== "undefined" ? window.innerHeight : 768;
    const below = rect.top + rect.height + padding + 12;
    const placeBelow = below + 160 < vh;
    const top = placeBelow ? below : Math.max(12, rect.top - padding - 172);
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - 160),
      vw - 332
    );
    tipStyle = { top, left, width: 320 };
  }

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" role="dialog" aria-modal="true">
      {/* Darkened overlay with cutout — 4 slabs around the cutout */}
      {rect && !isCenter ? (
        <>
          {/* top */}
          <div
            className="absolute bg-black/70 transition-all"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, cutoutTop) }}
          />
          {/* bottom */}
          <div
            className="absolute bg-black/70 transition-all"
            style={{
              top: cutoutTop + cutoutHeight,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          {/* left */}
          <div
            className="absolute bg-black/70 transition-all"
            style={{
              top: cutoutTop,
              left: 0,
              width: Math.max(0, cutoutLeft),
              height: cutoutHeight,
            }}
          />
          {/* right */}
          <div
            className="absolute bg-black/70 transition-all"
            style={{
              top: cutoutTop,
              left: cutoutLeft + cutoutWidth,
              right: 0,
              height: cutoutHeight,
            }}
          />
          {/* cutout outline */}
          <div
            className="pointer-events-none absolute rounded-lg ring-2 ring-primary shadow-[0_0_0_9999px_rgba(0,0,0,0)] transition-all"
            style={{
              top: cutoutTop,
              left: cutoutLeft,
              width: cutoutWidth,
              height: cutoutHeight,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-80 rounded-xl border border-border/60 bg-popover p-4 text-popover-foreground shadow-2xl animate-slide-up"
        style={tipStyle}
      >
        <button
          type="button"
          aria-label="Skip tour"
          onClick={complete}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="text-xs font-medium text-primary">
          Step {step + 1} of {STEPS.length}
        </div>
        <div className="mt-1 text-base font-semibold">{currentStep.title}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {currentStep.description}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={complete}
            className="text-xs text-muted-foreground"
          >
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={back}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={next}>
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
