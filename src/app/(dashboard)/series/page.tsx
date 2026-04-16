"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Layers,
  Calendar,
  ArrowRight,
  ChevronLeft,
  Clapperboard,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";

interface Series {
  id: string;
  name: string;
  description: string;
  schedule: string;
  tone: string;
  language: string;
  createdAt: string;
}

export default function SeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("Every Monday");
  const [tone, setTone] = useState("motivational");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("contentSeries");
    if (saved) {
      try {
        setSeries(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setProjects((data as Project[]) || []);
    setLoading(false);
  }

  function saveSeries(updated: Series[]) {
    setSeries(updated);
    localStorage.setItem("contentSeries", JSON.stringify(updated));
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Please enter a series name");
      return;
    }

    const newSeries: Series = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      schedule,
      tone,
      language,
      createdAt: new Date().toISOString(),
    };

    saveSeries([...series, newSeries]);
    setDialogOpen(false);
    resetForm();
    toast.success("Series created!");
  }

  function handleDelete(id: string) {
    saveSeries(series.filter((s) => s.id !== id));
    if (selectedSeries?.id === id) setSelectedSeries(null);
    toast.success("Series deleted");
  }

  function resetForm() {
    setName("");
    setDescription("");
    setSchedule("Every Monday");
    setTone("motivational");
    setLanguage("en");
  }

  function getSeriesProjects(s: Series) {
    const lowerName = s.name.toLowerCase();
    return projects.filter((p) =>
      p.title.toLowerCase().includes(lowerName)
    );
  }

  function getLastPublished(s: Series) {
    const sp = getSeriesProjects(s);
    if (sp.length === 0) return null;
    return new Date(sp[0].created_at).toLocaleDateString();
  }

  function handleAddEpisode(s: Series) {
    const params = new URLSearchParams({
      topic: s.name,
      tone: s.tone,
      language: s.language,
    });
    router.push(`/create?${params.toString()}`);
  }

  // Detail view for a selected series
  if (selectedSeries) {
    const seriesProjects = getSeriesProjects(selectedSeries);

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedSeries(null)}
          className="mb-2"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Series
        </Button>

        <div className="animate-slide-up">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{selectedSeries.name}</h1>
              {selectedSeries.description && (
                <p className="text-muted-foreground mt-1">
                  {selectedSeries.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="shrink-0">
              <Calendar className="mr-1 h-3 w-3" />
              {selectedSeries.schedule}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {selectedSeries.tone}
          </Badge>
          <Badge variant="secondary" className="uppercase">
            {selectedSeries.language}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {seriesProjects.length} episode
            {seriesProjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        <Button onClick={() => handleAddEpisode(selectedSeries)} className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Episode
        </Button>

        {seriesProjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clapperboard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No episodes yet. Add your first episode to this series.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {seriesProjects.map((p, i) => (
              <Card
                key={p.id}
                className="hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => router.push(`/project/${p.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-8">
                      #{seriesProjects.length - i}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        p.status === "complete" ? "default" : "secondary"
                      }
                      className="text-xs capitalize"
                    >
                      {p.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main series list view
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Series</h1>
          <p className="text-muted-foreground">
            Organize your content into recurring series for consistent posting
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground px-4 py-2 cursor-pointer glow">
              <Plus className="h-4 w-4" />
              New Series
            </span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Series</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="series-name">Series Name</Label>
                <Input
                  id="series-name"
                  placeholder='e.g. "Monday Motivation", "Tech Tips"'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series-desc">Description</Label>
                <Textarea
                  id="series-desc"
                  placeholder="What is this series about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Recurring Schedule</Label>
                <Select value={schedule} onValueChange={(v) => v && setSchedule(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Every Monday">Every Monday</SelectItem>
                    <SelectItem value="Every Wednesday">
                      Every Wednesday
                    </SelectItem>
                    <SelectItem value="Every Friday">Every Friday</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekdays">Weekdays</SelectItem>
                    <SelectItem value="Twice a week">Twice a week</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funny">Funny</SelectItem>
                      <SelectItem value="motivational">
                        Motivational
                      </SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="storytelling">
                        Storytelling
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Series
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 h-32 animate-pulse bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : series.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Series Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Organize your content into recurring series for consistent
              posting. Create your first series to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {series.map((s) => {
            const episodeCount = getSeriesProjects(s).length;
            const lastPub = getLastPublished(s);

            return (
              <Card
                key={s.id}
                className="hover:border-primary/40 transition-colors cursor-pointer group"
                onClick={() => setSelectedSeries(s)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(s.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      {s.schedule}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {s.tone}
                    </Badge>
                    <Badge variant="secondary" className="text-xs uppercase">
                      {s.language}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                      {episodeCount} episode{episodeCount !== 1 ? "s" : ""}
                    </span>
                    {lastPub && <span>Last: {lastPub}</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
