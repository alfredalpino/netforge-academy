"use client";

import { DAILY_BLOCKS } from "@/lib/schedule";

interface TodayShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: "N or →", action: "Next day in current week" },
  { keys: "P or ←", action: "Previous day in current week" },
  { keys: "1 – 5", action: "Mark daily block complete (theory → recall)" },
  { keys: "?", action: "Toggle this shortcuts panel" },
  { keys: "Esc", action: "Close shortcuts panel" },
] as const;

export function TodayShortcutsHelp({ open, onClose }: TodayShortcutsHelpProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="today-shortcuts-title"
      data-testid="today-shortcuts-help"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="today-shortcuts-title" className="font-display text-lg font-semibold">
          Today — keyboard shortcuts
        </h2>
        <p className="mt-1 text-sm text-muted">
          Works when focus is not in a text field.
        </p>
        <ul className="mt-5 space-y-3">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-start justify-between gap-4 text-sm">
              <kbd className="shrink-0 rounded border border-border bg-background px-2 py-0.5 font-mono text-xs">
                {s.keys}
              </kbd>
              <span className="text-right text-muted">{s.action}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted">
          Blocks:{" "}
          {DAILY_BLOCKS.map((b, i) => (
            <span key={b.id}>
              {i > 0 ? " · " : ""}
              {i + 1}={b.title}
            </span>
          ))}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}
