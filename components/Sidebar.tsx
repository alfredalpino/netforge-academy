"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/focus", label: "Focus Mode", icon: "focus" },
  { href: "/today", label: "Today", icon: "today" },
  { href: "/accountability", label: "Accountability", icon: "accountability" },
  { href: "/curriculum", label: "Curriculum", icon: "curriculum" },
  { href: "/resources", label: "Resources", icon: "resources" },
  { href: "/guide", label: "How to Use", icon: "guide" },
  { href: "/drills/subnetting", label: "Subnet Drills", icon: "drills" },
  { href: "/gates", label: "Cert Gates", icon: "gates" },
  { href: "/labs", label: "Lab Stack", icon: "labs" },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = "h-4 w-4 shrink-0";
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
        </svg>
      );
    case "focus":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="8" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case "today":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M8 5l8 7-8 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "accountability":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 3v18M3 12h18" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "curriculum":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "resources":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
        </svg>
      );
    case "guide":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
          <path d="M12 10v6M12 7h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "drills":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" strokeWidth="2" />
          <rect x="13" y="3" width="8" height="8" strokeWidth="2" />
          <rect x="3" y="13" width="8" height="8" strokeWidth="2" />
          <rect x="13" y="13" width="8" height="8" strokeWidth="2" />
        </svg>
      );
    case "gates":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" strokeWidth="2" />
        </svg>
      );
    case "labs":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" strokeWidth="2" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="2" />
        </svg>
      );
  }
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const tourAttr = item.href === "/guide" ? { "data-tour": "guide-link" } : {};

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            {...tourAttr}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isFocus = pathname.startsWith("/focus");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isFocus) return null;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Link href="/" className="font-semibold text-foreground">
          NetForge
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="mobile-nav"
        data-tour="sidebar"
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-56`}
      >
        <div className="border-b border-border px-5 py-5">
          <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              NetForge
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-foreground">
              Network Engineering Academy
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/focus"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Enter Focus Mode
          </Link>
        </div>
      </aside>
    </>
  );
}

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocus = pathname.startsWith("/focus");

  return (
    <main
      id="main-content"
      className={
        isFocus
          ? "min-h-screen"
          : "min-h-screen overflow-x-hidden pt-14 md:ml-56 md:pt-0"
      }
    >
      {children}
    </main>
  );
}
