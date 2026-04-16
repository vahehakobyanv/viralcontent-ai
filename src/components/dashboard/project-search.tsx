"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

type StatusFilter = "all" | Project["status"];
type LanguageFilter = "all" | Project["language"];
type ToneFilter = "all" | Project["tone"];
type SortMode = "newest" | "oldest" | "alpha";

interface ProjectSearchProps {
  projects: Project[];
  onFilter: (filtered: Project[]) => void;
}

const STATUSES: StatusFilter[] = [
  "all",
  "draft",
  "script",
  "voice",
  "subtitles",
  "video",
  "complete",
];
const LANGUAGES: LanguageFilter[] = ["all", "en", "ru"];
const TONES: ToneFilter[] = [
  "all",
  "funny",
  "motivational",
  "aggressive",
  "storytelling",
];

function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function fuzzyMatch(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return true;
  if (h.includes(n)) return true;
  // char-subsequence fuzzy fallback
  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i >= n.length) return true;
  }
  return false;
}

function selectClass() {
  return "h-9 rounded-md border border-border/60 bg-background px-2 text-sm capitalize text-foreground outline-none transition focus:border-primary";
}

export default function ProjectSearch({ projects, onFilter }: ProjectSearchProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [language, setLanguage] = useState<LanguageFilter>("all");
  const [tone, setTone] = useState<ToneFilter>("all");
  const [sort, setSort] = useState<SortMode>("newest");

  const debounced = useDebounced(search, 200);

  const filtered = useMemo(() => {
    let arr = projects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (language !== "all" && p.language !== language) return false;
      if (tone !== "all" && p.tone !== tone) return false;
      if (debounced) {
        const hay = `${p.title} ${p.topic}`;
        if (!fuzzyMatch(hay, debounced)) return false;
      }
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      return a.title.localeCompare(b.title);
    });
    return arr;
  }, [projects, debounced, status, language, tone, sort]);

  const onFilterRef = useRef(onFilter);
  useEffect(() => {
    onFilterRef.current = onFilter;
  }, [onFilter]);

  useEffect(() => {
    onFilterRef.current(filtered);
  }, [filtered]);

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (debounced)
    activeFilters.push({
      key: "search",
      label: `Search: "${debounced}"`,
      clear: () => setSearch(""),
    });
  if (status !== "all")
    activeFilters.push({
      key: "status",
      label: `Status: ${status}`,
      clear: () => setStatus("all"),
    });
  if (language !== "all")
    activeFilters.push({
      key: "lang",
      label: `Lang: ${language}`,
      clear: () => setLanguage("all"),
    });
  if (tone !== "all")
    activeFilters.push({
      key: "tone",
      label: `Tone: ${tone}`,
      clear: () => setTone("all"),
    });

  const clearAll = () => {
    setSearch("");
    setStatus("all");
    setLanguage("all");
    setTone("all");
    setSort("newest");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or topic..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Status filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={selectClass()}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>

          <select
            aria-label="Language filter"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageFilter)}
            className={selectClass()}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l === "all" ? "All languages" : l.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            aria-label="Tone filter"
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneFilter)}
            className={selectClass()}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All tones" : t}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className={selectClass()}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <Badge
              key={f.key}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5"
            >
              <span className="text-xs">{f.label}</span>
              <button
                type="button"
                onClick={f.clear}
                aria-label={`Remove ${f.label}`}
                className="rounded-full p-0.5 transition hover:bg-background/60"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 px-2 text-xs text-muted-foreground"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
