import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Video not found</h1>
          <p className="text-muted-foreground">
            This video may have been removed or the link is invalid.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create your own viral content
          </Link>
        </div>
      </div>
    );
  }

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("project_id", id)
    .single();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 text-center">
        {/* Video Player */}
        {video?.video_url && (
          <div className="mx-auto max-w-xs">
            <div
              className="relative rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: "9/16" }}
            >
              <video
                src={video.video_url}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold">{project.title}</h1>

        {/* Branding */}
        <p className="text-sm text-muted-foreground">
          Made with{" "}
          <span className="glow-text font-semibold">ViralContent AI</span>
        </p>

        {/* CTA */}
        <Link
          href="/signup"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity glow"
        >
          Create your own viral content
        </Link>
      </div>
    </div>
  );
}
