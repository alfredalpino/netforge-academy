"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const SHORTCUTS = [
  { keys: "Space", description: "Pause or resume Pomodoro timer (when session active)" },
  { keys: "N", description: "Next study block" },
  { keys: "?", description: "Toggle this help panel" },
  { keys: "Esc", description: "Close this help panel" },
] as const;

interface FocusShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export function FocusShortcutsHelp({ open, onClose }: FocusShortcutsHelpProps) {
  useEffect(() => {
    if (open) {
      document.getElementById("focus-shortcuts-close")?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onClose}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="focus-shortcuts-title"
        className="w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="focus-shortcuts-title" className="text-lg font-semibold">
              Keyboard shortcuts
            </h2>
            <p className="mt-1 text-sm text-muted">
              Available while Focus mode is open. Ignored when typing in a field.
            </p>
          </div>
          <Button
            id="focus-shortcuts-close"
            variant="ghost"
            className="shrink-0 px-2 py-1 text-xs"
            onClick={onClose}
            aria-label="Close shortcuts help"
          >
            Close
          </Button>
        </div>

        <dl className="mt-6 space-y-3">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={keys} className="flex items-center justify-between gap-4">
              <dt>
                <kbd className="rounded border border-border bg-background px-2 py-1 font-mono text-xs">
                  {keys}
                </kbd>
              </dt>
              <dd className="text-right text-sm text-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
