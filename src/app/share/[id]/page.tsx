import Link from "next/link";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Project, Script, Video, Subtitle } from "@/types";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabase();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-6xl">🎬</div>
          <h1 className="text-3xl font-bold text-white">Video not found</h1>
          <p className="text-gray-400 max-w-md">
            This video may have been removed or the link is invalid.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity glow"
          >
            Create your own viral content
          </Link>
        </div>
      </div>
    );
  }

  const [
    { data: script },
    { data: video },
    { data: subtitles },
  ] = await Promise.all([
    supabase
      .from("scripts")
      .select("*")
      .eq("project_id", id)
      .single<Script>(),
    supabase
      .from("videos")
      .select("*")
      .eq("project_id", id)
      .single<Video>(),
    supabase
      .from("subtitles")
      .select("*")
      .eq("project_id", id)
      .single<Subtitle>(),
  ]);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://viralcontent.ai"}/share/${id}`;
  const shareText = `Check out this viral video: ${project.title}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const toneEmojis: Record<string, string> = {
    funny: "😂",
    motivational: "🔥",
    aggressive: "💪",
    storytelling: "📖",
  };

  const languageLabels: Record<string, string> = {
    en: "English",
    ru: "Russian",
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Logo Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-center border-b border-white/10">
        <Link href="/" className="text-xl font-bold glow">
          <span className="text-primary">Viral</span>
          <span className="text-white">Content</span>
          <span className="text-primary ml-1">AI</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Video Player or Script Preview */}
          {video?.video_url ? (
            <div className="mx-auto max-w-xs animate-slide-up">
              <div
                className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl shadow-primary/20"
                style={{ aspectRatio: "9/16" }}
              >
                <video
                  src={video.video_url}
                  controls
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : script ? (
            <div className="mx-auto max-w-sm animate-slide-up">
              <div className="rounded-2xl bg-gray-900 border border-white/10 p-6 space-y-4">
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                  Script Preview
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hook</p>
                    <p className="text-white font-medium">{script.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Body</p>
                    <p className="text-gray-300 text-sm line-clamp-4">
                      {script.body}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CTA</p>
                    <p className="text-primary font-medium">{script.cta}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Project Info */}
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm">
                {toneEmojis[project.tone] || "🎬"} {project.tone}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm">
                🌐 {languageLabels[project.language] || project.language}
              </span>
            </div>
          </div>

          {/* Remix Button */}
          <div className="flex justify-center">
            <Link
              href={`/remix/${project.id}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all glow animate-slide-up"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Remix This Video
            </Link>
          </div>

          {/* Social Share Row */}
          <div className="flex items-center justify-center gap-3">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share
            </a>
            <button
              data-copy-url={shareUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Copy Link
            </button>
            {script && (
              <button
                data-copy-caption={script.hook}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy Caption
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              🔥 Trending
            </span>
            <span>•</span>
            <span>
              Created{" "}
              {new Date(project.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom CTA Banner */}
      <div className="w-full border-t border-white/10 bg-gradient-to-t from-primary/10 to-transparent">
        <div className="max-w-md mx-auto px-4 py-8 text-center space-y-4">
          <h2 className="text-xl font-bold">
            Create your own viral content in 60 seconds
          </h2>
          <p className="text-gray-400 text-sm">
            AI-powered scripts, voiceovers, subtitles, and video — all free.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:opacity-90 transition-all glow"
          >
            Get Started Free
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-gray-500 border-t border-white/10">
        Made with{" "}
        <span className="text-primary font-semibold">ViralContent AI</span>{" "}
        — Free AI Video Generator
      </footer>
    </div>
  );
}
