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
  /** Show hover tooltip. Default true. */
  showTooltip?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children" | "type">;

/**
 * Compact sidebar collapse/expand control.
 * Tooltip sits below the icon so it never straddles the sidebar/content seam.
 */
export function SidebarToggle({
  collapsed,
  onToggle,
  showTooltip = true,
  className = "",
  ...rest
}: SidebarToggleProps) {
  const label = collapsed ? "Open sidebar" : "Close sidebar";

  return (
    <div className="group/sidebar-toggle relative inline-flex overflow-visible">
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
          className="pointer-events-none invisible absolute left-1/2 top-[calc(100%+6px)] z-[60] w-max -translate-x-1/2 rounded-md bg-surface-elevated px-2 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-lg ring-1 ring-border transition-[opacity,visibility] delay-200 duration-150 group-hover/sidebar-toggle:visible group-hover/sidebar-toggle:opacity-100"
        >
          {label}
        </span>
      )}
    </div>
  );
}
