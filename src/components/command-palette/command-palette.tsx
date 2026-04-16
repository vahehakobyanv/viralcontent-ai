"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Plus,
  TrendingUp,
  Layers,
  BarChart3,
  Calendar,
  Palette,
  Settings,
  Sparkles,
  Hash,
  FileText,
  Gauge,
} from "lucide-react";
import { create } from "zustand";

interface PaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<PaletteState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}));

function isMac() {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function useCommandPaletteShortcut() {
  const toggle = useCommandPaletteStore((s) => s.toggle);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);
}

export default function CommandPalette() {
  const router = useRouter();
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const [mac, setMac] = useState(false);

  useCommandPaletteShortcut();

  useEffect(() => {
    setMac(isMac());
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router, setOpen]
  );

  const shortcutLabel = mac ? "⌘K" : "Ctrl K";

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <span className="sr-only" id="command-palette-title">
        Command Palette
      </span>
      <span className="sr-only" id="command-palette-description">
        Search for pages, actions, and tools across ViralContent AI.
      </span>
      <CommandInput placeholder={`Search or jump to...  (${shortcutLabel})`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/create")}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/trending")}>
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Trending</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/series")}>
            <Layers className="mr-2 h-4 w-4" />
            <span>Series</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/calendar")}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/brand-kit")}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Brand Kit</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/create")}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Project</span>
            <CommandShortcut>{shortcutLabel === "⌘K" ? "⌘N" : "Ctrl N"}</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/create?tab=ideas")}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Generate Ideas</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>View Analytics</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => go("/tools/hashtag-generator")}>
            <Hash className="mr-2 h-4 w-4" />
            <span>Hashtag Generator</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/tools/script-writer")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Script Writer</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/tools/viral-score")}>
            <Gauge className="mr-2 h-4 w-4" />
            <span>Viral Score Checker</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
