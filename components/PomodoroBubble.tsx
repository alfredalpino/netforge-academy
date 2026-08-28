"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatTimer,
  getPhaseLabel,
  type PomodoroPhase,
  loadBubblePosition,
  saveBubblePosition,
  defaultBubblePosition,
} from "@/lib/pomodoro";

interface PomodoroBubbleProps {
  secondsLeft: number;
  totalSeconds: number;
  progress: number;
  phase: PomodoroPhase;
  running: boolean;
  completedSessions: number;
  sessionsBeforeLongBreak: number;
  onToggle: () => void;
  onSkip: () => void;
  onReset: () => void;
  visible: boolean;
}

const BUBBLE_SIZE = 88;

export function PomodoroBubble({
  secondsLeft,
  totalSeconds,
  progress,
  phase,
  running,
  completedSessions,
  sessionsBeforeLongBreak,
  onToggle,
  onSkip,
  onReset,
  visible,
}: PomodoroBubbleProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const saved = loadBubblePosition();
    const def = saved.x < 0 ? defaultBubblePosition() : saved;
    setPos(def);
    initialized.current = true;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-bubble-control]")) return;
      setDragging(true);
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const x = Math.max(8, Math.min(window.innerWidth - BUBBLE_SIZE - 8, e.clientX - dragOffset.current.x));
      const y = Math.max(8, Math.min(window.innerHeight - BUBBLE_SIZE - 8, e.clientY - dragOffset.current.y));
      setPos({ x, y });
    },
    [dragging]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setDragging(false);
      const x = Math.max(8, Math.min(window.innerWidth - BUBBLE_SIZE - 8, e.clientX - dragOffset.current.x));
      const y = Math.max(8, Math.min(window.innerHeight - BUBBLE_SIZE - 8, e.clientY - dragOffset.current.y));
      const final = { x, y };
      setPos(final);
      saveBubblePosition(final);
    },
    [dragging]
  );

  if (!visible) return null;

  const isBreak = phase === "short_break" || phase === "long_break";
  const ringColor = isBreak ? "var(--success)" : "var(--accent)";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (progress / 100) * circumference;
  const sessionsUntilLong =
    sessionsBeforeLongBreak - (completedSessions % sessionsBeforeLongBreak);

  return (
    <div
      className={`pomodoro-bubble ${dragging ? "pomodoro-bubble-dragging" : ""} ${isBreak ? "pomodoro-bubble-break" : ""}`}
      style={{ left: pos.x, top: pos.y, width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      role="timer"
      aria-label={`${getPhaseLabel(phase)}: ${formatTimer(secondsLeft)}`}
    >
      <svg className="pomodoro-bubble-ring" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          className="transition-all duration-1000 linear"
        />
      </svg>

      <div className="pomodoro-bubble-time">
        <span className="font-mono text-lg font-semibold tabular-nums leading-none">
          {formatTimer(secondsLeft)}
        </span>
        {!hovering && (
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted">
            {phase === "work" ? "focus" : "break"}
          </span>
        )}
      </div>

      <div className={`pomodoro-bubble-controls ${hovering ? "visible" : ""}`}>
        <button
          data-bubble-control
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="pomodoro-ctrl-btn pomodoro-ctrl-play"
          title={running ? "Pause" : "Resume"}
        >
          {running ? "⏸" : "▶"}
        </button>
        <button
          data-bubble-control
          onClick={(e) => { e.stopPropagation(); onSkip(); }}
          className="pomodoro-ctrl-btn pomodoro-ctrl-skip"
          title="Skip"
        >
          ⏭
        </button>
        <button
          data-bubble-control
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="pomodoro-ctrl-btn pomodoro-ctrl-reset"
          title="Reset"
        >
          ↺
        </button>
      </div>

      {phase === "work" && !hovering && completedSessions > 0 && (
        <span className="pomodoro-session-badge">{completedSessions}</span>
      )}

      {hovering && phase === "work" && (
        <span className="pomodoro-hover-hint">
          {sessionsUntilLong} until long break
        </span>
      )}
    </div>
  );
}
