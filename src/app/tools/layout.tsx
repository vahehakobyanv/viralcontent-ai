import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-500" />
            <span className="font-bold text-lg glow-text">ViralContent AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/signup"
              className="glow text-sm font-medium px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Made with ViralContent AI — Free AI Tools
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/tools/hashtag-generator"
              className="hover:text-foreground transition-colors"
            >
              Hashtag Generator
            </Link>
            <Link
              href="/tools/script-writer"
              className="hover:text-foreground transition-colors"
            >
              Script Writer
            </Link>
            <Link
              href="/tools/viral-score"
              className="hover:text-foreground transition-colors"
            >
              Viral Score Checker
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
