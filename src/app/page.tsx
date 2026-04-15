import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            V
          </div>
          <span className="font-bold text-lg">ViralContent AI</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="glow">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          AI-Powered Content Creation
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight mb-6">
          Go Viral
          <br />
          <span className="text-primary glow-text">Without Showing</span>
          <br />
          Your Face
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-10">
          Generate scripts, voiceovers, subtitles, and full videos for TikTok &
          Instagram Reels — all powered by AI. No camera needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6 glow">
              Start Creating — It&apos;s Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              I have an account
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 w-full">
          {[
            {
              title: "Script Generator",
              desc: "AI writes viral hooks, stories & CTAs optimized for the algorithm",
            },
            {
              title: "AI Voiceover",
              desc: "Multiple voices, speeds & tones — male, female, energetic, calm",
            },
            {
              title: "Auto Video",
              desc: "Stock footage + subtitles + music assembled into ready-to-upload videos",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl bg-card border border-border/50 text-left"
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-20 mb-20 w-full">
          <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border/50 text-left">
              <h3 className="font-semibold text-xl mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">
                $0<span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>3 videos per day</li>
                <li>Standard voices</li>
                <li>Watermark included</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-card border-2 border-primary text-left glow">
              <h3 className="font-semibold text-xl mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">
                $19<span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Unlimited videos</li>
                <li>Premium voices</li>
                <li>No watermark</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
