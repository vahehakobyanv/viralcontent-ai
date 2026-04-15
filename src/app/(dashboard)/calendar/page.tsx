"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BEST_POSTING_TIMES } from "@/lib/constants";
import type { Project } from "@/types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setProjects(data);
    }
    fetchProjects();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getProjectsForDay(day: number) {
    return projects.filter((p) => {
      const d = new Date(p.created_at);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Build best posting time lookup
  const bestTimeLookup = new Set<string>();
  BEST_POSTING_TIMES.forEach((entry) => {
    entry.slots.forEach((hour) => {
      bestTimeLookup.add(`${entry.day}-${hour}`);
    });
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Plan and schedule your content for maximum impact
        </p>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">
              {monthName} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayProjects = getProjectsForDay(day);
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg border border-border/50 p-1 flex flex-col items-center justify-start gap-0.5 text-xs hover:bg-accent/50 transition-colors relative group ${
                    isToday(day) ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isToday(day) ? "text-primary" : ""
                    }`}
                  >
                    {day}
                  </span>
                  {dayProjects.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayProjects.slice(0, 3).map((_, j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  )}
                  {dayProjects.length > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                        {dayProjects.length} project
                        {dayProjects.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Best Posting Times */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Best Posting Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour headers */}
              <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-0.5 mb-1">
                <div />
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="text-center text-[10px] text-muted-foreground"
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {BEST_POSTING_TIMES.map((entry) => (
                <div
                  key={entry.day}
                  className="grid grid-cols-[60px_repeat(24,1fr)] gap-0.5 mb-0.5"
                >
                  <div className="text-xs font-medium flex items-center">
                    {entry.day}
                  </div>
                  {HOURS.map((h) => {
                    const isOptimal = bestTimeLookup.has(`${entry.day}-${h}`);
                    return (
                      <div
                        key={h}
                        className={`h-6 rounded-sm transition-colors ${
                          isOptimal
                            ? "bg-primary/60 hover:bg-primary/80"
                            : "bg-muted/20 hover:bg-muted/30"
                        }`}
                        title={
                          isOptimal
                            ? `${entry.day} ${h}:00 - Optimal time`
                            : `${entry.day} ${h}:00`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Highlighted cells indicate optimal posting times based on engagement
            data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
