"use client";

import type { ConnectionState } from "@/lib/pwa/use-connection-state";

const LABELS: Record<ConnectionState, string> = {
  online: "",
  offline: "Offline — recent pages and saved progress remain available.",
  syncing: "Syncing saved changes…",
};

export function ConnectionBanner({ state }: { state: ConnectionState }) {
  if (state === "online") return null;

  const tone =
    state === "offline"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-accent/15 text-accent border-accent/30";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-0 right-0 z-[110] border-b px-4 py-2 text-center text-sm ${tone}`}
      style={{ top: "var(--pwa-banner-offset, 0px)", paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      {LABELS[state]}
    </div>
  );
}
