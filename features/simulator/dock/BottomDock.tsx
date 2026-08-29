"use client";

import type { ReactNode } from "react";

export type DockTabId =
  | "terminal"
  | "packets"
  | "events"
  | "capture"
  | "score"
  | "tutor";

const TABS: { id: DockTabId; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "packets", label: "Packets" },
  { id: "events", label: "Events" },
  { id: "capture", label: "Capture" },
  { id: "score", label: "Score" },
  { id: "tutor", label: "Tutor" },
];

export type BottomDockProps = {
  activeTab: DockTabId;
  onTabChange: (tab: DockTabId) => void;
  children: ReactNode;
  heightPx?: number;
};

export function BottomDock({
  activeTab,
  onTabChange,
  children,
  heightPx = 280,
}: BottomDockProps) {
  return (
    <section
      className="sim-panel flex shrink-0 flex-col overflow-hidden border-t border-border"
      style={{ height: heightPx }}
      aria-label="Simulator bottom dock"
    >
      <div
        className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-1"
        role="tablist"
        aria-label="Dock panels"
      >
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-t-md px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                selected
                  ? "bg-surface-elevated text-accent"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden" role="tabpanel">
        {children}
      </div>
    </section>
  );
}
