"use client";

import { useEffect, useState, useCallback } from "react";

interface FocusTimerProps {
  initialMinutes?: number;
  blockTitle: string;
  onComplete?: () => void;
}

export function FocusTimer({
  initialMinutes = 120,
  blockTitle,
  onComplete,
}: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft, onComplete]);

  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  const display = h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const reset = useCallback(() => {
    setSecondsLeft(initialMinutes * 60);
    setRunning(false);
  }, [initialMinutes]);

  return (
    <div className="text-center">
      <p className="mb-2 text-sm uppercase tracking-widest text-muted">
        {blockTitle}
      </p>
      <div className="font-mono text-6xl font-light tabular-nums tracking-tight text-foreground">
        {display}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setRunning(!running)}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
        >
          {running ? "Pause" : secondsLeft < initialMinutes * 60 ? "Resume" : "Start"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border px-6 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
