"use client";

import { useEffect } from "react";

/**
 * Registers global keyboard shortcuts.
 *
 * Keys are lowercase key names. Modifiers: "meta", "ctrl", "shift", "alt".
 * Combine with "+". Examples:
 *   "c"            -> just the "c" key
 *   "meta+k"       -> Cmd+K on macOS
 *   "ctrl+k"       -> Ctrl+K
 *   "shift+n"      -> Shift+N
 *   "meta+shift+p" -> Cmd+Shift+P
 *
 * Ignores events fired while the user is typing in an <input>, <textarea>,
 * <select> or any contentEditable element.
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>
): void {
  useEffect(() => {
    if (!shortcuts || Object.keys(shortcuts).length === 0) return;

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (target.isContentEditable) return true;
      return false;
    };

    const normalize = (combo: string) =>
      combo
        .toLowerCase()
        .split("+")
        .map((s) => s.trim())
        .sort()
        .join("+");

    const map: Record<string, () => void> = {};
    for (const [combo, fn] of Object.entries(shortcuts)) {
      map[normalize(combo)] = fn;
    }

    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const parts: string[] = [];
      if (e.metaKey) parts.push("meta");
      if (e.ctrlKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      const key = (e.key || "").toLowerCase();
      if (key && !["meta", "control", "shift", "alt"].includes(key)) {
        parts.push(key);
      }
      const combo = parts.sort().join("+");
      const fn = map[combo];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}

export default useKeyboardShortcuts;
