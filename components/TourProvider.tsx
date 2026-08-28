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
  const [autoStarted, setAutoStarted] = useState(false);

  const startTour = useCallback((tourId: string) => {
    const tour = getTour(tourId);
    if (!tour) return;
    setActiveTour(tour);
    setStepIndex(0);
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

  useEffect(() => {
    if (!loaded || autoStarted || pathname !== "/") return;
    if (!progress.completedTours.includes("welcome")) {
      const timer = setTimeout(() => {
        startTour("welcome");
        setAutoStarted(true);
      }, 800);
      return () => clearTimeout(timer);
    }
    setAutoStarted(true);
  }, [loaded, pathname, progress.completedTours, autoStarted, startTour]);

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
      }}
    >
      {children}
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
