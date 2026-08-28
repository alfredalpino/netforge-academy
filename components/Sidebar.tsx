"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/focus", label: "Focus Mode", icon: "◎" },
  { href: "/today", label: "Today", icon: "▸" },
  { href: "/accountability", label: "Accountability", icon: "◈" },
  { href: "/curriculum", label: "Curriculum", icon: "☰" },
  { href: "/resources", label: "Resources", icon: "⊡" },
  { href: "/drills/subnetting", label: "Subnet Drills", icon: "⊞" },
  { href: "/gates", label: "Cert Gates", icon: "⬡" },
  { href: "/labs", label: "Lab Stack", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isFocus = pathname.startsWith("/focus");

  if (isFocus) return null;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-5">
        <Link href="/" className="block">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            NetForge
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-foreground">
            Network Academy
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <span className="font-mono text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Link
          href="/focus"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-dim"
        >
          Enter Focus Mode
        </Link>
      </div>
    </aside>
  );
}

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocus = pathname.startsWith("/focus");

  return (
    <main className={isFocus ? "min-h-screen" : "ml-56 min-h-screen"}>
      {children}
    </main>
  );
}
