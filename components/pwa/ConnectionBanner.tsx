"use client";

import { useState } from "react";
import type { ConnectionState } from "@/lib/pwa/use-connection-state";

export function ConnectionBanner({
  state,
  onRetry,
}: {
  state: ConnectionState;
  onRetry?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  // Never show a top strip for background sync — only confirmed offline.
  if (state !== "offline" || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[110] flex justify-center md:left-60"
    >
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted shadow-lg">
        <span className="h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden="true" />
        <p className="flex-1">You appear offline. Saved progress still works.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md px-2 py-1 text-accent hover:bg-surface-hover"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md px-2 py-1 text-muted hover:bg-surface-hover"
          aria-label="Dismiss offline notice"
        >
          ×
        </button>
      </div>
    </div>
  );
}
