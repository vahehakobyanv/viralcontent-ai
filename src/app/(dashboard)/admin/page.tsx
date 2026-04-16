"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FolderKanban,
  Video,
  FileText,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalVideos: number;
  totalScripts: number;
  statusBreakdown: { status: string; count: number }[];
  recentUsers: { id: string; email: string; created_at: string }[];
  dailyProjects: { date: string; count: number }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load admin stats.
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban },
    { label: "Total Videos", value: stats.totalVideos, icon: Video },
    { label: "Total Scripts", value: stats.totalScripts, icon: FileText },
  ];

  const maxDaily = Math.max(...stats.dailyProjects.map((d) => d.count), 1);

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className="rounded-lg bg-fuchsia-500/10 p-3">
                  <Icon className="h-5 w-5 text-fuchsia-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projects per day chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.dailyProjects.map((d) => (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-fuchsia-500/70 transition-all"
                    style={{
                      height: `${(d.count / maxDaily) * 100}%`,
                      minHeight: d.count > 0 ? 4 : 2,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("en", {
                      weekday: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.statusBreakdown.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {status}
                  </Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {stats.statusBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recent signups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate max-w-[200px]">{user.email}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
