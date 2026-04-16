import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  timestamp: number;
  read: boolean;
  link?: string;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read"> & { id?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const STORAGE_KEY = "notifications_v1";

function loadFromStorage(): Notification[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Notification[];
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore quota errors
  }
}

function seedNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      title: "Your video is ready!",
      description: "Your latest TikTok video has finished rendering.",
      icon: "Film",
      timestamp: now - 1000 * 60 * 5,
      read: false,
    },
    {
      id: "seed-2",
      title: "Trending topic updated",
      description: "A new viral trend matches your niche — check it out.",
      icon: "TrendingUp",
      timestamp: now - 1000 * 60 * 60,
      read: false,
    },
    {
      id: "seed-3",
      title: "New AI coach tip",
      description: "Tip of the day: hooks under 3 seconds get 2x retention.",
      icon: "Sparkles",
      timestamp: now - 1000 * 60 * 60 * 3,
      read: false,
    },
  ];
}

export const useNotificationsStore = create<NotificationsState>((set, get) => {
  let initial = loadFromStorage();
  if (!initial) {
    initial = seedNotifications();
    saveToStorage(initial);
  }

  return {
    notifications: initial,
    addNotification: (n) => {
      const next: Notification = {
        id: n.id ?? `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: n.title,
        description: n.description,
        icon: n.icon,
        link: n.link,
        timestamp: Date.now(),
        read: false,
      };
      const updated = [next, ...get().notifications];
      saveToStorage(updated);
      set({ notifications: updated });
    },
    markRead: (id) => {
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      saveToStorage(updated);
      set({ notifications: updated });
    },
    markAllRead: () => {
      const updated = get().notifications.map((n) => ({ ...n, read: true }));
      saveToStorage(updated);
      set({ notifications: updated });
    },
    clear: () => {
      saveToStorage([]);
      set({ notifications: [] });
    },
  };
});
