"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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

const PADDING = 10;
const BUBBLE_WIDTH = 340;
const BUBBLE_GAP = 16;

export function TourBubble({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourBubbleProps) {
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const highlightedRef = useRef<Element | null>(null);
  const isCenter = !step.target || step.placement === "center";
  const isLast = stepIndex === totalSteps - 1;

  const measureTarget = useCallback(() => {
    setViewport({ w: window.innerWidth, h: window.innerHeight });

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

  useLayoutEffect(() => {
    if (isCenter || !step.target) return;

    const el = document.querySelector(step.target);
    if (!el) return;

    highlightedRef.current = el;
    el.classList.add("tour-target-highlight");

    return () => {
      el.classList.remove("tour-target-highlight");
      if (highlightedRef.current === el) highlightedRef.current = null;
    };
  }, [step.target, stepIndex, isCenter]);

  useLayoutEffect(() => {
    // DOM measurement requires syncing layout reads into state for bubble positioning.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- measureTarget reads DOM geometry
    measureTarget();

    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    const timers = [100, 350, 600].map((ms) => setTimeout(measureTarget, ms));

    let observer: ResizeObserver | undefined;
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        observer = new ResizeObserver(measureTarget);
        observer.observe(el);
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      timers.forEach(clearTimeout);
      observer?.disconnect();
    };
  }, [measureTarget, stepIndex, step.target]);

  const hole = targetRect
    ? {
        top: Math.max(0, targetRect.top - PADDING),
        left: Math.max(0, targetRect.left - PADDING),
        width: targetRect.width + PADDING * 2,
        height: targetRect.height + PADDING * 2,
      }
    : null;

  const bubbleStyle = getBubblePosition(
    targetRect,
    step.placement ?? "bottom",
    viewport.w,
    viewport.h
  );

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="App tour">
      {/* Cutout overlay — dims everything EXCEPT the highlighted hole */}
      {isCenter || !hole ? (
        <div className="tour-backdrop-full" onClick={onSkip} aria-hidden="true" />
      ) : (
        <TourCutoutOverlay hole={hole} viewport={viewport} onDismiss={onSkip} />
      )}

      {/* Spotlight ring around the clear hole */}
      {hole && !isCenter && (
        <div
          className="tour-spotlight-ring"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
          aria-hidden="true"
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
            <button type="button" onClick={onSkip} className="tour-skip" aria-label="Skip tour">
              Skip
            </button>
          </div>

          <h3 className="mt-3 text-base font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
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
            <button type="button" onClick={onNext} className="tour-btn-primary">
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TourCutoutOverlay({
  hole,
  viewport,
  onDismiss,
}: {
  hole: Rect;
  viewport: { w: number; h: number };
  onDismiss: () => void;
}) {
  const { w, h } = viewport;
  const top = hole.top;
  const left = hole.left;
  const bottom = top + hole.height;
  const right = left + hole.width;

  const panel = (style: React.CSSProperties, key: string) => (
    <div
      key={key}
      className="tour-panel"
      style={style}
      onClick={onDismiss}
      aria-hidden="true"
    />
  );

  return (
    <>
      {panel({ top: 0, left: 0, width: w, height: top }, "top")}
      {panel({ top: bottom, left: 0, width: w, height: h - bottom }, "bottom")}
      {panel({ top, left: 0, width: left, height: hole.height }, "left")}
      {panel({ top, left: right, width: w - right, height: hole.height }, "right")}
    </>
  );
}

function getBubblePosition(
  rect: Rect | null,
  placement: string,
  vw: number,
  vh: number
): React.CSSProperties {
  if (!rect || vw === 0) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const gap = BUBBLE_GAP;
  const bubbleW = Math.min(BUBBLE_WIDTH, vw - 32);
  const bubbleH = 200;
  const margin = 16;

  let top = 0;
  let left = 0;
  let transform = "";

  switch (placement) {
    case "top":
      top = rect.top - gap;
      left = rect.left + rect.width / 2;
      transform = "translate(-50%, -100%)";
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - gap;
      transform = "translate(-100%, -50%)";
      break;
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + gap;
      transform = "translateY(-50%)";
      break;
    default:
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2;
      transform = "translateX(-50%)";
      break;
  }

  // Parse computed top/left after transform — use approximate bubble box for clamping
  let boxTop = top;
  let boxLeft = left;

  if (placement === "top") {
    boxTop = top - bubbleH;
    boxLeft = left - bubbleW / 2;
  } else if (placement === "left") {
    boxTop = top - bubbleH / 2;
    boxLeft = left - bubbleW;
  } else if (placement === "right") {
    boxTop = top - bubbleH / 2;
  } else {
    boxLeft = left - bubbleW / 2;
  }

  // Flip if overflowing viewport
  if (boxLeft + bubbleW > vw - margin) {
    if (placement === "right") {
      left = rect.left - gap;
      transform = "translate(-100%, -50%)";
      boxLeft = left - bubbleW;
    } else {
      boxLeft = vw - bubbleW - margin;
      left = boxLeft + bubbleW / 2;
      transform = placement === "bottom" ? "translateX(-50%)" : transform;
    }
  }
  if (boxLeft < margin) {
    boxLeft = margin;
    left = margin + bubbleW / 2;
    if (placement === "bottom") transform = "translateX(-50%)";
  }
  if (boxTop + bubbleH > vh - margin && placement === "bottom") {
    top = rect.top - gap;
    transform = "translate(-50%, -100%)";
    boxTop = top - bubbleH;
  }
  if (boxTop < margin) {
    top = margin + (transform.includes("-100%") ? bubbleH : 0);
    boxTop = margin;
  }

  return {
    top,
    left,
    transform,
    maxWidth: bubbleW,
    width: bubbleW,
  };
}
