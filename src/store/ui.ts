import { create } from "zustand";

interface UiState {
  onboardingComplete: boolean;
  setOnboardingComplete: () => void;
  captionStyle: string;
  setCaptionStyle: (style: string) => void;
}

export const useUiStore = create<UiState>((set) => {
  // Hydrate from localStorage on creation (client-side only)
  let initialOnboarding = false;
  let initialCaptionStyle = "classic";
  if (typeof window !== "undefined") {
    initialOnboarding = localStorage.getItem("onboarding_complete") === "true";
    initialCaptionStyle = localStorage.getItem("caption_style") || "classic";
  }

  return {
    onboardingComplete: initialOnboarding,
    setOnboardingComplete: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_complete", "true");
      }
      set({ onboardingComplete: true });
    },
    captionStyle: initialCaptionStyle,
    setCaptionStyle: (style: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("caption_style", style);
      }
      set({ captionStyle: style });
    },
  };
});
