"use client";

import { useEffect, useMemo } from "react";

const PARTICLE_COUNT = 24;
const COLORS = ["#38bdf8", "#34d399", "#a78bfa", "#fbbf24", "#f472b6"];

type ConfettiBurstProps = {
  onDone?: () => void;
};

export function ConfettiBurst({ onDone }: ConfettiBurstProps) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 17) % 84)}%`,
        delay: `${(i % 6) * 0.04}s`,
        duration: `${0.9 + (i % 5) * 0.12}s`,
        color: COLORS[i % COLORS.length],
        rotate: `${(i * 37) % 360}deg`,
      })),
    [],
  );

  useEffect(() => {
    if (reducedMotion) {
      onDone?.();
      return;
    }
    const timer = window.setTimeout(() => onDone?.(), 1600);
    return () => window.clearTimeout(timer);
  }, [onDone, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden
      data-testid="confetti-burst"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle absolute top-0 block h-2 w-1.5 rounded-sm opacity-90"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
