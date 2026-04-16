"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Film,
  TrendingUp,
  Sparkles,
  Check,
  Inbox,
  LucideIcon,
} from "lucide-react";
import { useNotificationsStore, Notification } from "@/store/notifications";

const ICON_MAP: Record<string, LucideIcon> = {
  Film,
  TrendingUp,
  Sparkles,
  Bell,
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function NotificationsPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const notifications = useNotificationsStore((s) => s.notifications);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const hasUnread = notifications.some((n) => !n.read);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  const onItemClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-background/60 text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-fade-in rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-xl">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
            <div className="text-sm font-medium">Notifications</div>
            {hasUnread && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-muted-foreground transition hover:text-foreground"
              >
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> Mark all as read
                </span>
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
                <Inbox className="h-6 w-6 opacity-60" />
                <div>No notifications yet</div>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {notifications.map((n) => {
                  const Icon = ICON_MAP[n.icon] ?? Bell;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onItemClick(n)}
                        className={`flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-accent ${
                          n.read ? "opacity-70" : ""
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            n.read
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                            )}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {n.description}
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground/80">
                            {relativeTime(n.timestamp)}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border/60 p-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center text-xs"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
