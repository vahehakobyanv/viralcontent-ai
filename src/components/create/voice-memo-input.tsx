"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Mic,
  MicOff,
  Square,
  Loader2,
  Sparkles,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ScriptResult {
  hook: string;
  body: string;
  cta: string;
  full_text: string;
}

export default function VoiceMemoInput() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<"en" | "ru">("en");
  const [tone, setTone] = useState("motivational");
  const [hasSpeechAPI, setHasSpeechAPI] = useState(false);
  const [useManual, setUseManual] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setHasSpeechAPI(supported);
    if (!supported) {
      setUseManual(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  function startRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition not supported in this browser");
      setUseManual(true);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "ru" ? "ru-RU" : "en-US";

    let finalTranscript = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast.error("Recording error: " + event.error);
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        try {
          recognition.start();
        } catch {
          // recognition already stopped
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
    setDuration(0);
    setScriptResult(null);

    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    toast.success("Recording started");
  }

  async function handleStopAndConvert() {
    stopRecording();
    const text = transcript.trim();
    if (!text) {
      toast.error("No speech detected. Try again or paste your transcript.");
      return;
    }
    await convertTranscript(text);
  }

  async function handleManualConvert() {
    const text = manualTranscript.trim();
    if (!text) {
      toast.error("Please enter a transcript");
      return;
    }
    await convertTranscript(text);
  }

  async function convertTranscript(text: string) {
    setProcessing(true);
    try {
      const res = await fetch("/api/voice-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, language, tone }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error("Failed to process transcript");
        return;
      }
      setScriptResult(data.script);
      setTitle(data.title || "Voice Memo Script");
      toast.success("Script generated from your voice memo!");
    } catch {
      toast.error("Failed to process transcript");
    } finally {
      setProcessing(false);
    }
  }

  async function handleUseScript() {
    if (!scriptResult) return;
    setCreating(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to continue");
        setCreating(false);
        return;
      }

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title,
          topic: title,
          language,
          tone,
          status: "draft",
        })
        .select()
        .single();

      if (error || !project) {
        toast.error("Failed to create project");
        setCreating(false);
        return;
      }

      await supabase.from("scripts").insert({
        project_id: project.id,
        hook: scriptResult.hook,
        body: scriptResult.body,
        cta: scriptResult.cta,
        full_text: scriptResult.full_text,
      });

      await supabase
        .from("projects")
        .update({ status: "script" })
        .eq("id", project.id);

      router.push(`/project/${project.id}`);
    } catch {
      toast.error("Failed to create project");
      setCreating(false);
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as "en" | "ru")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Section */}
      {hasSpeechAPI && !useManual && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Voice Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* Record Button */}
            <button
              onClick={isRecording ? handleStopAndConvert : startRecording}
              disabled={processing}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-primary hover:bg-primary/90 glow"
              }`}
            >
              {isRecording ? (
                <Square className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </button>

            {isRecording && (
              <div className="flex items-center gap-3 animate-fade-in">
                <Badge variant="destructive" className="animate-pulse">
                  REC
                </Badge>
                <span className="font-mono text-lg flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {!isRecording && !transcript && (
              <p className="text-sm text-muted-foreground text-center">
                Tap to start recording your voice memo.
                <br />
                Speak naturally — we will polish it into a TikTok script.
              </p>
            )}

            {/* Live Transcript */}
            {transcript && (
              <div className="w-full animate-fade-in">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Live Transcript
                </Label>
                <div className="mt-2 p-4 rounded-lg bg-muted/50 text-sm max-h-40 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}

            {isRecording && (
              <Button
                onClick={handleStopAndConvert}
                variant="destructive"
                className="w-full"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop & Convert to Script
                  </>
                )}
              </Button>
            )}

            {/* Switch to manual */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseManual(true)}
              className="text-xs text-muted-foreground"
            >
              <FileText className="mr-1 h-3 w-3" />
              Paste transcript instead
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Manual Transcript Input */}
      {useManual && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Paste Transcript
              </CardTitle>
              {hasSpeechAPI && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseManual(false)}
                  className="text-xs"
                >
                  <Mic className="mr-1 h-3 w-3" />
                  Use microphone
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your voice memo transcript or type your raw ideas here..."
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button
              onClick={handleManualConvert}
              disabled={processing || !manualTranscript.trim()}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Convert to TikTok Script
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {processing && (
        <Card className="border-primary/30">
          <CardContent className="p-6 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              AI is polishing your transcript into a viral script...
            </span>
          </CardContent>
        </Card>
      )}

      {/* Script Result */}
      {scriptResult && (
        <Card className="border-primary/30 glow animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                Hook
              </p>
              <p className="text-sm font-medium bg-primary/5 p-3 rounded">
                {scriptResult.hook}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                Body
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {scriptResult.body}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                CTA
              </p>
              <p className="text-sm text-muted-foreground">
                {scriptResult.cta}
              </p>
            </div>
            <Button
              onClick={handleUseScript}
              disabled={creating}
              className="w-full glow"
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Use This Script
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
