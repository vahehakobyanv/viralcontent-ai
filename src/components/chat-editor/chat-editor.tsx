"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  updatedScript?: string;
  explanation?: string;
  applied?: boolean;
}

interface ChatEditorProps {
  projectId: string;
  currentScript: string;
  onScriptUpdate: (newScript: string) => void;
  topic: string;
  tone: string;
  language: string;
}

export default function ChatEditor({
  projectId,
  currentScript,
  onScriptUpdate,
  topic,
  tone,
  language,
}: ChatEditorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // keep projectId referenced to avoid lint warnings
  void projectId;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          currentScript,
          topic,
          tone,
          language,
        }),
      });

      const data = await res.json();
      if (data.error) {
        toast.error("Failed to edit script");
        return;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.explanation || "Here is the updated script.",
        updatedScript: data.updatedScript,
        applied: false,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error("Failed to edit script");
    } finally {
      setLoading(false);
    }
  }

  function handleApply(msgId: string, script: string) {
    onScriptUpdate(script);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
    toast.success("Changes applied!");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Collapsed bar
  if (!expanded) {
    return (
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        <Card className="shadow-lg border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-3 flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground flex-1">
              Tell me what to change...
            </span>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl animate-slide-up">
      <Card className="shadow-xl border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Script Editor Chat</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setExpanded(false)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="max-h-72 overflow-y-auto p-3 space-y-3"
        >
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              Ask me to change your script.
              <br />
              <span className="text-xs">
                e.g. &quot;Make the hook more dramatic&quot; or &quot;Add a plot
                twist&quot;
              </span>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-muted text-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <p>{msg.content}</p>

                {msg.updatedScript && (
                  <div className="mt-2 space-y-2">
                    <div className="p-2 rounded bg-muted/50 text-xs max-h-24 overflow-y-auto whitespace-pre-line">
                      {msg.updatedScript}
                    </div>
                    {msg.applied ? (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <Check className="h-3 w-3" />
                        Applied
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          handleApply(msg.id, msg.updatedScript!)
                        }
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Apply Changes
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what to change..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
