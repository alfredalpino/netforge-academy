"use client";

import Link from "next/link";
import { useTour } from "@/components/TourProvider";

const SECTIONS = [
  {
    title: "Start Here",
    items: [
      { q: "What is NetForge?", a: "A 28-week study system — not videos. You follow a daily plan, do labs locally, and track progress here." },
      { q: "First thing to do?", a: "Set up your lab stack (Labs page), then open Today → Focus Mode for your first session." },
    ],
  },
  {
    title: "Daily Workflow",
    items: [
      { q: "Morning routine", a: "Dashboard → check your position → Today for the plan → Focus Mode to study." },
      { q: "Focus Mode", a: "Distraction-free. Timer + block checklist. Mark each block done as you finish." },
      { q: "End of day", a: "Mark Day Complete on Today page. Check in on Accountability (streak + reflection)." },
    ],
  },
  {
    title: "Learning Journey",
    items: [
      { q: "Where am I?", a: "The Journey bar on Dashboard shows your current topic (Linux, OSPF, etc.) and % through curriculum." },
      { q: "Jump ahead?", a: "Tap any milestone on the Journey bar — e.g. skip from Linux straight to OSPF. Your week/day updates automatically." },
      { q: "Mark modules done", a: "Open Curriculum → pick a phase → Mark Complete on each module when exit criteria are met." },
    ],
  },
  {
    title: "Progress",
    items: [
      { q: "How is progress calculated?", a: "Weighted score: curriculum position (20%), modules (25%), days (20%), blocks (20%), lab setup (10%), drill accuracy (5%)." },
      { q: "What counts?", a: "Completed days, study blocks, modules, lab checklist items, subnet drill scores, and where you are in the 28-week path." },
      { q: "Streaks?", a: "Study daily. Completing blocks, days, or check-ins keeps your streak alive." },
    ],
  },
  {
    title: "Key Pages",
    items: [
      { q: "Dashboard", a: "Home. Position, journey, progress, quick actions." },
      { q: "Today", a: "Full daily plan — theory, config, lab, break/fix, recall." },
      { q: "Resources", a: "Books, RFCs, labs, cert prep, tools — filterable library." },
      { q: "Subnet Drills", a: "Daily practice. Target: under 30 seconds per question." },
      { q: "Cert Gates", a: "CCNA → Security+ → NSE4 → AZ-104 → AZ-700 requirements." },
    ],
  },
  {
    title: "Tips",
    items: [
      { q: "Don't skip foundations", a: "Phase 0–3 (Linux → Routing) before FortiGate, BGP, or Azure." },
      { q: "Labs run locally", a: "Packet Tracer, EVE-NG, Wireshark on your machine — not in the browser." },
      { q: "Replay the tour", a: "Click the ? button bottom-right anytime." },
    ],
  },
];

export default function GuidePage() {
  const { startTour } = useTour();

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent">Quick Reference</p>
        <h1 className="mt-1 text-2xl font-semibold">How to Use NetForge</h1>
        <p className="mt-2 text-sm text-muted">
          Everything you need in plain language. Short, but complete.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => startTour("welcome")}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
        >
          Take the Tour
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-hover"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 text-sm font-medium text-accent">{section.title}</h2>
            <dl className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.q}
                  className="rounded-xl border border-border/60 bg-surface px-5 py-4"
                >
                  <dt className="text-sm font-medium">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted">
        Progress saves in your browser (localStorage). Same device, same browser.
      </p>
    </div>
  );
}
