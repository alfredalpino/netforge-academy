"use client";

import type { ButtonHTMLAttributes } from "react";

/** ChatGPT-style left-panel icon: rounded rect with a left rail. */
export function PanelLeftIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.75" y="4.75" width="16.5" height="14.5" rx="2.25" />
      <path d="M9 5v14" />
    </svg>
  );
}

export type SidebarToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
  /** Show hover tooltip pill (ChatGPT-style). Default true. */
  showTooltip?: boolean;
  /** Prefer left when the control sits near the right edge of the sidebar. */
  tooltipSide?: "left" | "right";
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children" | "type">;

/**
 * Compact sidebar collapse/expand control matching ChatGPT web UI.
 */
export function SidebarToggle({
  collapsed,
  onToggle,
  showTooltip = true,
  tooltipSide = "right",
  className = "",
  ...rest
}: SidebarToggleProps) {
  const label = collapsed ? "Open sidebar" : "Close sidebar";

  return (
    <div className="group/sidebar-toggle relative inline-flex">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        title={showTooltip ? undefined : label}
        className={`nav-sidebar-toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...rest}
      >
        <PanelLeftIcon />
      </button>
      {showTooltip && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute top-1/2 z-[60] -translate-y-1/2 whitespace-nowrap rounded-full bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg ring-1 ring-border transition-opacity duration-150 group-hover/sidebar-toggle:opacity-100 group-focus-within/sidebar-toggle:opacity-100 ${
            tooltipSide === "left" ? "right-full mr-2" : "left-full ml-2"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
