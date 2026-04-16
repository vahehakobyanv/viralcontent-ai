"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCommandPaletteStore } from "@/components/command-palette/command-palette";
import NotificationsPopover from "@/components/notifications/notifications-popover";
import { useAuthStore } from "@/store/auth";

function isMac() {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export default function TopBar() {
  const openPalette = useCommandPaletteStore((s) => s.setOpen);
  const user = useAuthStore((s) => s.user);
  const [mac, setMac] = useState(false);

  useEffect(() => {
    setMac(isMac());
  }, []);

  const email = user?.email ?? "";
  const initial = email ? email.charAt(0).toUpperCase() : "U";
  const shortcut = mac ? "⌘K" : "Ctrl K";

  return (
    <div className="sticky top-0 md:top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
      {/* Left: search / palette trigger (desktop) */}
      <div className="hidden flex-1 md:flex">
        <button
          type="button"
          onClick={() => openPalette(true)}
          className="group flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/60"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search or jump to...</span>
          <span className="inline-flex items-center rounded border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {shortcut}
          </span>
        </button>
      </div>

      {/* Center: mobile gets empty spacer so right items hug right */}
      <div className="flex-1 md:hidden" />

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-2">
        <NotificationsPopover />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-border/60"
          title={email || "Account"}
          aria-label={email || "Account"}
        >
          {initial}
        </div>
      </div>
    </div>
  );
}
