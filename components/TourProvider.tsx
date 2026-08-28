"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { TourDefinition } from "@/lib/tours";
import { getTour } from "@/lib/tours";
import { useProgress } from "@/lib/progress";
import { TourBubble } from "./TourBubble";

interface TourContextValue {
  activeTour: TourDefinition | null;
  stepIndex: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: (completed?: boolean) => void;
  isActive: boolean;
  showWelcomeBanner: boolean;
  dismissWelcomeBanner: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { progress, loaded, completeTour } = useProgress();
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [dismissedWelcome, setDismissedWelcome] = useState(false);

  const showWelcomeBanner =
    loaded &&
    pathname === "/" &&
    !progress.completedTours.includes("welcome") &&
    !dismissedWelcome;

  const startTour = useCallback((tourId: string) => {
    const tour = getTour(tourId);
    if (!tour) return;
    setActiveTour(tour);
    setStepIndex(0);
    setDismissedWelcome(true);
  }, []);

  const endTour = useCallback(
    (completed = false) => {
      if (completed && activeTour) completeTour(activeTour.id);
      setActiveTour(null);
      setStepIndex(0);
    },
    [activeTour, completeTour]
  );

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (stepIndex < activeTour.steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      endTour(true);
    }
  }, [activeTour, stepIndex, endTour]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const dismissWelcomeBanner = useCallback(() => {
    setDismissedWelcome(true);
  }, []);

  useEffect(() => {
    if (!activeTour) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour(false);
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTour, endTour, nextStep, prevStep]);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        stepIndex,
        startTour,
        nextStep,
        prevStep,
        endTour,
        isActive: !!activeTour,
        showWelcomeBanner,
        dismissWelcomeBanner,
      }}
    >
      {children}
      {showWelcomeBanner && !activeTour && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 rounded-xl border border-border bg-surface p-4 shadow-lg">
          <p className="text-sm font-medium">New to NetForge?</p>
          <p className="mt-1 text-xs text-muted">
            Take a quick tour of the dashboard and study workflow.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => startTour("welcome")}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-dim"
            >
              Start tour
            </button>
            <button
              type="button"
              onClick={dismissWelcomeBanner}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface-hover"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {activeTour && (
        <TourBubble
          step={activeTour.steps[stepIndex]}
          stepIndex={stepIndex}
          totalSteps={activeTour.steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={() => endTour(false)}
        />
      )}
    </TourContext.Provider>
  );
}
