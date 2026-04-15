"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  FileText,
  Mic,
  Video,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Rocket,
} from "lucide-react";
import { useUiStore } from "@/store/ui";

const totalSteps = 3;

export function OnboardingModal() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const setOnboardingComplete = useUiStore((s) => s.setOnboardingComplete);

  const handleComplete = () => {
    setOnboardingComplete();
    router.push("/create");
  };

  const handleClose = () => {
    setOnboardingComplete();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {/* Step 1: Welcome */}
        {step === 0 && (
          <>
            <DialogHeader className="text-center items-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">
                Welcome to ViralContent AI
              </DialogTitle>
              <DialogDescription className="text-center">
                Create viral short-form videos with AI-powered scripts, voiceovers,
                and subtitles in minutes.
              </DialogDescription>
            </DialogHeader>
          </>
        )}

        {/* Step 2: How it works */}
        {step === 1 && (
          <>
            <DialogHeader className="text-center items-center">
              <DialogTitle className="text-xl">How It Works</DialogTitle>
              <DialogDescription className="text-center">
                Four simple steps to viral content
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 py-4">
              {[
                { icon: Lightbulb, label: "Ideas" },
                { icon: FileText, label: "Script" },
                { icon: Mic, label: "Voice" },
                { icon: Video, label: "Video" },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mt-[-18px]" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Get Started */}
        {step === 2 && (
          <>
            <DialogHeader className="text-center items-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">
                Ready to Go Viral?
              </DialogTitle>
              <DialogDescription className="text-center">
                Create your first video now and see the magic happen.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-2">
              <Button onClick={handleComplete} className="glow gap-2">
                Create Your First Video
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step dots + navigation */}
        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === step
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {step < totalSteps - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              Skip
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
