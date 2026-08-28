"use client";

import { useEffect, useState, useCallback } from "react";
import type { TourStep } from "@/lib/tours";

interface TourBubbleProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourBubble({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourBubbleProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const isCenter = !step.target || step.placement === "center";
  const isLast = stepIndex === totalSteps - 1;

  const measureTarget = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [step.target]);

  useEffect(() => {
    measureTarget();
    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const timer = setTimeout(measureTarget, 100);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      clearTimeout(timer);
    };
  }, [measureTarget, stepIndex]);

  const bubbleStyle = getBubblePosition(targetRect, step.placement ?? "bottom");

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="App tour">
      {/* Backdrop — pointer-events only on bubble controls */}
      <div className="tour-backdrop" onClick={onSkip} aria-hidden="true" />

      {/* Spotlight ring */}
      {targetRect && !isCenter && (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Bubble */}
      <div
        className={`tour-bubble ${isCenter ? "tour-bubble-center" : ""}`}
        style={isCenter ? undefined : bubbleStyle}
      >
        <div className="tour-bubble-glow" />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span className="tour-step-badge">
              {stepIndex + 1} / {totalSteps}
            </span>
            <button onClick={onSkip} className="tour-skip" aria-label="Skip tour">
              Skip
            </button>
          </div>

          <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={onPrev}
              disabled={stepIndex === 0}
              className="tour-btn-secondary disabled:opacity-30"
            >
              Back
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? "w-4 bg-accent" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <button onClick={onNext} className="tour-btn-primary">
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>

        {!isCenter && targetRect && (
          <div
            className={`tour-arrow tour-arrow-${step.placement ?? "bottom"}`}
          />
        )}
      </div>
    </div>
  );
}

function getBubblePosition(
  rect: Rect | null,
  placement: string
): React.CSSProperties {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const gap = 16;
  const bubbleWidth = 340;

  switch (placement) {
    case "top":
      return {
        top: rect.top - gap,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - gap,
        transform: "translate(-100%, -50%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + gap,
        transform: "translateY(-50%)",
      };
    default:
      return {
        top: rect.top + rect.height + gap,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - bubbleWidth / 2, window.innerWidth - bubbleWidth - 16)),
      };
  }
}
