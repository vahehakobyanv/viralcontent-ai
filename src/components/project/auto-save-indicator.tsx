"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
}

export default function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  const [visibleStatus, setVisibleStatus] = useState<SaveStatus>(status);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setFadeOut(false);
    setVisibleStatus(status);
    if (status === "saved") {
      const t = setTimeout(() => setFadeOut(true), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  let icon;
  let text;
  let className = "text-muted-foreground";

  switch (visibleStatus) {
    case "saving":
      icon = <Loader2 className="h-3 w-3 animate-spin" />;
      text = "Saving...";
      className = "text-muted-foreground";
      break;
    case "saved":
      icon = <CheckCircle2 className="h-3 w-3" />;
      text = "Saved";
      className = "text-emerald-500";
      break;
    case "error":
      icon = <AlertTriangle className="h-3 w-3" />;
      text = "Error saving";
      className = "text-red-500";
      break;
    case "idle":
    default:
      icon = <Cloud className="h-3 w-3" />;
      text = "Ready";
      className = "text-muted-foreground";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs transition-opacity duration-500 ${className} ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
    >
      {icon}
      <span>{text}</span>
    </span>
  );
}
