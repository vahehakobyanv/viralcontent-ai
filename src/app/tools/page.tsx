import Link from "next/link";
import { Hash, FileText, BarChart3, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Tools for TikTok Creators | ViralContent AI",
  description:
    "Free AI-powered tools for TikTok creators. Generate hashtags, write viral scripts, and check your viral score — no sign-up required.",
};

const tools = [
  {
    href: "/tools/hashtag-generator",
    icon: Hash,
    name: "TikTok Hashtag Generator",
    description:
      "Generate 20 trending, optimized hashtags for your TikTok videos. Includes high-volume and niche hashtags grouped by reach potential.",
  },
  {
    href: "/tools/script-writer",
    icon: FileText,
    name: "AI TikTok Script Writer",
    description:
      "Write scroll-stopping TikTok scripts in seconds. Choose your tone, language, and get a complete hook-body-CTA structure.",
  },
  {
    href: "/tools/viral-score",
    icon: BarChart3,
    name: "Viral Score Checker",
    description:
      "Paste your script and get an AI-powered viral score with actionable tips to boost hook strength, retention, and CTA effectiveness.",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold glow-text">
          Free AI Tools for TikTok Creators
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Supercharge your short-form content with AI-powered tools. No sign-up
          required — start creating viral content now.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block rounded-xl border border-border/60 bg-card p-6 hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-500/5 transition-all"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-fuchsia-500/10 p-3">
              <tool.icon className="h-6 w-6 text-fuchsia-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{tool.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {tool.description}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-fuchsia-400 group-hover:gap-2 transition-all">
              Try Free <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">
          Want the full AI video creation pipeline?
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Go from idea to published video — AI scripts, voiceover, subtitles,
          and video assembly, all in one platform.
        </p>
        <Link
          href="/signup"
          className="glow inline-block px-6 py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium transition-colors"
        >
          Create Your Free Account
        </Link>
      </div>
    </div>
  );
}
