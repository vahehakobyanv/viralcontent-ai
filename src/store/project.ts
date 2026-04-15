import { create } from 'zustand';
import type { Project, Script, ContentIdea } from '@/types';

interface ProjectState {
  currentProject: Project | null;
  currentScript: Script | null;
  ideas: ContentIdea[];
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  setCurrentScript: (script: Script | null) => void;
  setIdeas: (ideas: ContentIdea[]) => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  currentScript: null,
  ideas: [],
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentScript: (script) => set({ currentScript: script }),
  setIdeas: (ideas) => set({ ideas }),
  setProjects: (projects) => set({ projects }),
}));
