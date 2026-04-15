import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: SupabaseUser | null;
  loading: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
