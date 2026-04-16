"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function RemixPage() {
  const params = useParams();
  const router = useRouter();
  const sourceProjectId = params.id as string;

  const [status, setStatus] = useState<"loading" | "unauthenticated" | "remixing" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleRemix() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus("unauthenticated");
        return;
      }

      setStatus("remixing");

      try {
        const res = await fetch("/api/remix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceProjectId,
            userId: user.id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to remix");
        }

        toast.success("Video remixed! Redirecting to your project...");
        router.push(`/project/${data.project.id}`);
      } catch (err) {
        console.error("Remix error:", err);
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
        toast.error("Failed to remix video");
      }
    }

    handleRemix();
  }, [sourceProjectId, router]);

  if (status === "loading" || status === "remixing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Remixing...</h1>
            <p className="text-muted-foreground">
              Creating your own version of this viral content
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI is cloning the script for you</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full animate-fade-in">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Sign up to remix this video</h1>
              <p className="text-muted-foreground">
                Create a free account to remix viral content and make it your own.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block">
                <Button size="lg" className="w-full glow gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign Up Free
                </Button>
              </Link>
              <Link href="/login" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Already have an account? Log in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full animate-fade-in">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-5xl">😕</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Remix Failed</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setStatus("loading");
                setErrorMessage("");
              }}
            >
              Try Again
            </Button>
            <Link href="/dashboard" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
