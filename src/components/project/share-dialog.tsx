"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  projectId: string;
  projectTitle: string;
}

export default function ShareDialog({
  projectId,
  projectTitle,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${projectId}`
      : `/share/${projectId}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOnTwitter() {
    const tweetText = encodeURIComponent("Check out my viral video!");
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`,
      "_blank"
    );
  }

  async function copyForTikTok() {
    const text = `${projectTitle}\n\nMade with ViralContent AI\n${shareUrl}`;
    await navigator.clipboard.writeText(text);
    toast.success("Caption copied for TikTok!");
  }

  async function copyForInstagram() {
    const text = `${projectTitle}\n\nMade with ViralContent AI`;
    await navigator.clipboard.writeText(text);
    toast.success("Caption copied for Instagram!");
  }

  return (
    <Dialog>
      <DialogTrigger>
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background px-3 h-8 cursor-pointer hover:bg-accent hover:text-accent-foreground">
          <Share2 className="h-4 w-4" />
          Share
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Shareable link */}
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Separator />

          {/* Social buttons */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={shareOnTwitter} className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Share on Twitter
            </Button>
            <Button variant="outline" onClick={copyForTikTok} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy for TikTok
            </Button>
            <Button
              variant="outline"
              onClick={copyForInstagram}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy for Instagram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
