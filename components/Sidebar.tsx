"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { useNavLayout } from "@/components/NavLayoutContext";
import { SidebarToggle } from "@/components/SidebarToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_GROUPS = [
  {
    label: "Study",
    items: [
      { href: "/", label: "Dashboard", icon: "dashboard" as const },
      { href: "/today", label: "Today", icon: "today" as const },
      { href: "/accountability", label: "Accountability", icon: "accountability" as const },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/drills", label: "Drills", icon: "drills" as const },
      { href: "/simulator", label: "Simulator", icon: "simulator" as const },
      { href: "/labs", label: "Lab Stack", icon: "labs" as const },
      { href: "/gates", label: "Cert Gates", icon: "gates" as const },
    ],
  },
  {
    label: "Academy",
    items: [
      { href: "/curriculum", label: "Curriculum", icon: "curriculum" as const },
      { href: "/topics", label: "Topic Videos", icon: "topics" as const },
      { href: "/resources", label: "Resources", icon: "resources" as const },
      { href: "/guide", label: "How to Use", icon: "guide" as const },
    ],
  },
] as const;

type NavIconName = (typeof NAV_GROUPS)[number]["items"][number]["icon"];

function NavIcon({ name }: { name: NavIconName }) {
  const common = "h-4 w-4 shrink-0";
  switch (name) {
    case "dashboard":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case "today":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.75" />
          <path d="M8 3v4M16 3v4M4 10h16" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "accountability":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M5 12l4 4L19 6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "curriculum":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 6h16M4 12h12M4 18h8" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "topics":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="3" y="5" width="18" height="12" rx="2" strokeWidth="1.75" />
          <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "resources":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M5 5h6a2 2 0 012 2v12l-5-2-5 2V7a2 2 0 012-2zM13 5h6a2 2 0 012 2v12l-5-2-5 2" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case "guide":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
          <path d="M12 10.5v5.5M12 7.5h.01" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "drills":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 8h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 16h6v4H4z" strokeWidth="1.75" />
        </svg>
      );
    case "gates":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 3l8 3.5v5.5c0 5-3.4 9.4-8 10.5-4.6-1.1-8-5.5-8-10.5V6.5L12 3z" strokeWidth="1.75" strokeLinejoin="round" />
        </svg>
      );
    case "labs":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M9 3h6M10 3v5.2L5.5 18a2 2 0 001.8 3h9.4a2 2 0 001.8-3L14 8.2V3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "simulator":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.75" />
          <path d="M7 12h2M11 9h2v6h-2M15 12h2" strokeWidth="1.75" strokeLinecap="round" />
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
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-2">
          <p className="nav-group-label">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? "bg-accent/12 font-medium text-accent shadow-[inset_3px_0_0_0_var(--accent)]"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function BrandMark() {
  return (
    <span className="min-w-0">
      <span className="font-display block text-[1.05rem] font-semibold tracking-tight text-foreground">
        NetForge
      </span>
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { progress, loaded } = useProgress();
  const { collapsed, toggleCollapsed, setCollapsed } = useNavLayout();

  const openMobile = () => {
    setCollapsed(false);
    setMobileOpen(true);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile top chrome — panel icon, not hamburger / Menu text */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border/80 bg-surface/90 px-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <SidebarToggle
            collapsed={!mobileOpen}
            onToggle={() => (mobileOpen ? closeMobile() : openMobile())}
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
          />
          <Link href="/" className="font-display text-sm font-semibold tracking-tight text-foreground">
            NetForge
          </Link>
        </div>
      </header>

      {/* Desktop: reopen control when sidebar is fully collapsed */}
      {collapsed && (
        <div className="fixed left-3 top-3 z-50 hidden md:block">
          <SidebarToggle collapsed onToggle={toggleCollapsed} />
        </div>
      )}

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/55 md:hidden"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}

      <aside
        id="mobile-nav"
        data-tour="sidebar"
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(260px,85vw)] flex-col border-r border-border/80 bg-surface/95 backdrop-blur-md transition-[transform,opacity,width] duration-200 ease-out md:w-[var(--nav-width,260px)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          collapsed
            ? "md:pointer-events-none md:w-0 md:-translate-x-full md:opacity-0 md:border-0"
            : "md:translate-x-0 md:opacity-100"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 overflow-visible px-3">
          <Link href="/" className="min-w-0 truncate" onClick={closeMobile}>
            <BrandMark />
          </Link>
          <div className="flex items-center gap-0.5">
            <SidebarToggle
              collapsed={false}
              onToggle={() => {
                if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
                  closeMobile();
                } else {
                  toggleCollapsed();
                }
              }}
              className="hidden md:flex"
            />
            <SidebarToggle
              collapsed={false}
              onToggle={closeMobile}
              className="md:hidden"
              showTooltip={false}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <NavLinks pathname={pathname} onNavigate={closeMobile} />
        </nav>

        <div className="space-y-3 border-t border-border/80 p-3">
          {loaded && (
            <div className="rounded-xl border border-border/70 bg-surface-elevated/60 px-3 py-2.5">
              <p className="section-label">Current track</p>
              <p className="mt-1 font-mono text-xs text-foreground">
                W{progress.currentWeek} · D{progress.currentDay}
                {progress.streak > 0 ? ` · ${progress.streak}d streak` : ""}
              </p>
            </div>
          )}
          <ThemeToggle />
          <Link
            href="/today"
            onClick={closeMobile}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--accent)_80%,transparent)] transition hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Open Today&apos;s Plan
          </Link>
        </div>
      </aside>
    </>
  );
}

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-hidden pt-14 transition-[margin] duration-200 ease-out md:ml-[var(--nav-width,260px)] md:pt-0"
    >
      {children}
    </main>
  );
}
