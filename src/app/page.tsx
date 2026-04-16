import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lightbulb,
  Download,
  Hash,
  FileText,
  BarChart3,
  Zap,
  MessageSquare,
  Palette,
  FlaskConical,
  Play,
  ArrowRight,
  Check,
  Crown,
  Repeat2,
} from "lucide-react";

const avatars = [
  { initials: "JK", from: "from-pink-500", to: "to-violet-500" },
  { initials: "AL", from: "from-cyan-500", to: "to-blue-500" },
  { initials: "MR", from: "from-orange-500", to: "to-red-500" },
  { initials: "SC", from: "from-emerald-500", to: "to-teal-500" },
  { initials: "DP", from: "from-yellow-500", to: "to-amber-500" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span className="text-lg font-bold">ViralContent AI</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#tools" className="transition-colors hover:text-foreground">Tools</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="glow">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div
            className="animate-slide-up mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            <span>&#128293; #1 AI Video Creator &mdash; 100% Free</span>
          </div>

          <h1
            className="animate-slide-up text-5xl font-bold leading-tight tracking-tight sm:text-7xl"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            Turn Any Idea Into a{" "}
            <span className="text-primary glow-text">Viral Video</span> in 60&nbsp;Seconds
          </h1>

          <p
            className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            Script &rarr; Voice &rarr; Subtitles &rarr; Video. All AI&#8209;powered. No camera needed.
          </p>

          <div
            className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-lg glow">
                Start Creating Free
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                <Play className="mr-2 size-4" />
                See How It Works
              </Button>
            </a>
          </div>

          {/* Mock dashboard preview */}
          <div
            className="animate-slide-up relative mx-auto mt-16 max-w-3xl"
            style={{ animationDelay: "0.45s", animationFillMode: "both" }}
          >
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500/70" />
                <div className="size-3 rounded-full bg-yellow-500/70" />
                <div className="size-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-muted-foreground">ViralContent AI &mdash; Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-left">
                  <div className="mb-2 text-xs text-muted-foreground">Step 1</div>
                  <div className="text-sm font-medium">Topic Selected</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-primary/20">
                    <div className="h-2 w-full rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-left">
                  <div className="mb-2 text-xs text-muted-foreground">Step 2</div>
                  <div className="text-sm font-medium">Script &amp; Voice</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-primary/20">
                    <div className="h-2 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-left">
                  <div className="mb-2 text-xs text-muted-foreground">Step 3</div>
                  <div className="text-sm font-medium">Rendering...</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-primary/20">
                    <div className="h-2 w-1/3 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div
              className="animate-slide-up absolute -left-4 -top-4 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-lg sm:-left-8"
              style={{ animationDelay: "0.6s", animationFillMode: "both", transform: "rotate(-3deg)" }}
            >
              <span className="text-sm font-medium">Script Generated &#10003;</span>
            </div>
            <div
              className="animate-slide-up absolute -right-4 top-8 rounded-lg border border-border/50 bg-card px-4 py-2 shadow-lg sm:-right-8"
              style={{ animationDelay: "0.7s", animationFillMode: "both", transform: "rotate(2deg)" }}
            >
              <span className="text-sm font-medium">Voice Added &#10003;</span>
            </div>
            <div
              className="animate-slide-up absolute -bottom-4 right-8 rounded-lg border border-primary/50 bg-card px-4 py-2 shadow-lg glow"
              style={{ animationDelay: "0.8s", animationFillMode: "both", transform: "rotate(1deg)" }}
            >
              <span className="text-sm font-medium">Video Ready &#127916;</span>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="animate-slide-up mx-auto mt-20 flex flex-col items-center justify-center gap-8 text-center sm:flex-row sm:gap-16"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            {[
              { value: "10,000+", label: "Videos Created" },
              { value: "5,000+", label: "Creators" },
              { value: "30+", label: "Trending Topics Daily" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="border-y border-border/50 bg-card/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <span className="text-sm text-muted-foreground">Trusted by creators worldwide</span>
          <div className="flex -space-x-2">
            {avatars.map((a) => (
              <div
                key={a.initials}
                className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${a.from} ${a.to} text-xs font-bold text-white ring-2 ring-background`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-sm font-medium">Join 5,000+ creators</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="animate-slide-up mb-4 text-center text-3xl font-bold sm:text-4xl"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            How It Works
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
            Three steps. Sixty seconds. Zero filming.
          </p>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Dashed connector line */}
            <div className="absolute left-0 right-0 top-16 hidden border-t-2 border-dashed border-border/50 md:block" />

            {[
              {
                step: 1,
                icon: <Lightbulb className="size-6 text-primary" />,
                title: "Pick a Topic or Speak Your Idea",
                desc: "Choose from trending topics, paste a URL, use a template, or just speak your idea out loud.",
              },
              {
                step: 2,
                icon: <Sparkles className="size-6 text-primary" />,
                title: "AI Creates Everything",
                desc: "Scripts, voiceover, subtitles, B-roll footage — all generated in seconds by AI.",
              },
              {
                step: 3,
                icon: <Download className="size-6 text-primary" />,
                title: "Download & Go Viral",
                desc: "Export for TikTok, Instagram Reels, YouTube Shorts. One click to download.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="animate-slide-up relative rounded-xl border border-border/50 bg-card p-6 text-center"
                style={{ animationDelay: `${s.step * 0.1}s`, animationFillMode: "both" }}
              >
                <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </div>
                <div className="mb-3 flex justify-center">{s.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="animate-slide-up mb-4 text-center text-3xl font-bold sm:text-4xl"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            Everything You Need to Go Viral
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
            One platform. Every tool. No editing skills required.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Large card - spans 2 cols */}
            <div
              className="animate-slide-up col-span-1 rounded-xl border border-border/50 bg-card p-6 sm:col-span-2"
              style={{ animationDelay: "0.05s", animationFillMode: "both" }}
            >
              <FileText className="mb-3 size-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">AI Script Generator</h3>
              <p className="text-muted-foreground">
                Viral hooks, storytelling arcs, calls-to-action. Every script is optimized for the
                algorithm so you get maximum reach.
              </p>
            </div>

            {/* Large card - spans 2 cols */}
            <div
              className="animate-slide-up col-span-1 rounded-xl border border-border/50 bg-card p-6 sm:col-span-2"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              <Zap className="mb-3 size-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Voice &amp; Subtitles</h3>
              <p className="text-muted-foreground">
                5 voice styles, 4 caption presets, automatic timing. Perfectly synced and
                TikTok-ready out of the box.
              </p>
            </div>

            {/* Small cards */}
            {[
              {
                icon: <BarChart3 className="mb-2 size-5 text-primary" />,
                title: "Trending Topics",
                desc: "30+ daily trending ideas curated by AI",
              },
              {
                icon: <FlaskConical className="mb-2 size-5 text-primary" />,
                title: "Viral Score",
                desc: "AI rates your script 0-100 before you post",
              },
              {
                icon: <Repeat2 className="mb-2 size-5 text-primary" />,
                title: "A/B Testing",
                desc: "3 hook variants per script to find winners",
              },
              {
                icon: <Play className="mb-2 size-5 text-primary" />,
                title: "Remix Videos",
                desc: "Fork any shared video and make it yours",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="animate-slide-up rounded-xl border border-border/50 bg-card p-5"
                style={{ animationDelay: `${0.15 + i * 0.05}s`, animationFillMode: "both" }}
              >
                {f.icon}
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}

            {/* Medium cards - span 2 cols each */}
            <div
              className="animate-slide-up col-span-1 rounded-xl border border-border/50 bg-card p-6 sm:col-span-2"
              style={{ animationDelay: "0.35s", animationFillMode: "both" }}
            >
              <MessageSquare className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 text-lg font-semibold">Chat Editor</h3>
              <p className="text-sm text-muted-foreground">
                Edit your videos by talking: &ldquo;Make it funnier,&rdquo; &ldquo;Add a plot twist,&rdquo; &ldquo;Change
                the voice to energetic.&rdquo;
              </p>
            </div>
            <div
              className="animate-slide-up col-span-1 rounded-xl border border-border/50 bg-card p-6 sm:col-span-2"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              <Palette className="mb-3 size-6 text-primary" />
              <h3 className="mb-1 text-lg font-semibold">Brand Kit</h3>
              <p className="text-sm text-muted-foreground">
                Upload your logo, set brand colors, choose fonts, and add watermark presets.
                Every video stays on brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FREE TOOLS ── */}
      <section id="tools" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="animate-slide-up mb-4 text-center text-3xl font-bold sm:text-4xl"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            Free AI Tools &mdash; No Sign-Up Required
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
            Try our standalone tools instantly. No account needed.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                href: "/tools/hashtag-generator",
                icon: <Hash className="size-8 text-primary" />,
                title: "Hashtag Generator",
                desc: "Get trending, niche-relevant hashtags for maximum discoverability on any platform.",
              },
              {
                href: "/tools/script-writer",
                icon: <FileText className="size-8 text-primary" />,
                title: "Script Writer",
                desc: "Generate a complete short-form video script with hook, story, and CTA in seconds.",
              },
              {
                href: "/tools/viral-score",
                icon: <BarChart3 className="size-8 text-primary" />,
                title: "Viral Score Checker",
                desc: "Paste any script and get an AI-powered virality score from 0 to 100 with tips.",
              },
            ].map((tool, i) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="animate-slide-up group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-primary/50"
                style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
              >
                <div className="mb-4">{tool.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{tool.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{tool.desc}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Try Free <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2
            className="animate-slide-up mb-4 text-center text-3xl font-bold sm:text-4xl"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
            Start free. Upgrade when you&apos;re ready to scale.
          </p>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Free plan */}
            <div
              className="animate-slide-up rounded-xl border border-border/50 bg-card p-8"
              style={{ animationDelay: "0.05s", animationFillMode: "both" }}
            >
              <h3 className="mb-1 text-xl font-semibold">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                {[
                  "5 videos per month",
                  "Watermark included",
                  "All core features",
                  "Standard voices",
                  "Community support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro plan */}
            <div
              className="animate-slide-up relative rounded-xl border-2 border-primary bg-card p-8 glow"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              <div className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                <Crown className="size-3" /> Most Popular
              </div>
              <h3 className="mb-1 text-xl font-semibold">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                {[
                  "Unlimited videos",
                  "No watermark",
                  "Premium voices",
                  "Priority rendering",
                  "Brand kit & presets",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="block">
                <Button className="w-full glow">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2
            className="animate-slide-up mb-4 text-4xl font-bold glow-text sm:text-5xl"
            style={{ animationDelay: "0s", animationFillMode: "both" }}
          >
            Ready to Go Viral?
          </h2>
          <p
            className="animate-slide-up mb-10 text-lg text-muted-foreground"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            Join 5,000+ creators making viral content with AI.
          </p>
          <div
            className="animate-slide-up"
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-lg glow">
                Start Creating &mdash; It&apos;s Free
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-bold">ViralContent AI</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-powered short-form video creation
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#tools" className="transition-colors hover:text-foreground">Tools</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <Link href="/login" className="transition-colors hover:text-foreground">Login</Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">Sign Up</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            Built with AI &#10084;&#65039;
          </p>
        </div>
      </footer>
    </div>
  );
}
