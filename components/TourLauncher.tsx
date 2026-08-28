"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTour } from "./TourProvider";
import { TOURS } from "@/lib/tours";

export function TourLauncher() {
  const pathname = usePathname();
  const { startTour, isActive } = useTour();
  const [open, setOpen] = useState(false);

  if (isActive || pathname.startsWith("/focus")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open && (
        <div className="mb-3 w-52 rounded-xl border border-border bg-surface p-3 shadow-2xl">
          <p className="text-xs font-medium">App Tours</p>
          <p className="mt-0.5 text-xs text-muted">Walk through without breaking anything</p>
          <div className="mt-2 space-y-1">
            {TOURS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  startTour(t.id);
                  setOpen(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-accent/10 hover:text-accent"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="tour-launcher-btn"
        aria-label="App tours"
        title="Take a tour"
      >
        ?
      </button>
    </div>
  );
}
