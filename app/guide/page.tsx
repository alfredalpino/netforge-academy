"use client";

import Link from "next/link";
import { useTour } from "@/components/TourProvider";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
      { q: "Focus Mode", a: "Distraction-free. Pomodoro timer + block checklist. Checklists persist across refreshes." },
      { q: "End of day", a: "Mark Day Complete on Today page. Check in on Accountability (streak + reflection)." },
    ],
  },
  {
    title: "Learning Journey",
    items: [
      { q: "Where am I?", a: "The Journey bar on Dashboard shows your current topic and % through curriculum." },
      { q: "Jump ahead?", a: "Tap any milestone on the Journey bar — you'll get a confirmation before your position updates." },
      { q: "Mark modules done", a: "Open Curriculum → pick a phase → Mark Complete on each module when exit criteria are met." },
    ],
  },
  {
    title: "Progress & Backup",
    items: [
      { q: "How is progress calculated?", a: "Weighted score: curriculum (20%), modules (25%), days (20%), blocks (20%), lab setup (10%), drills (5%)." },
      { q: "Backup progress?", a: "Accountability → Settings & Backup → Export Progress. Import restores on the same or a new browser." },
      { q: "Streaks?", a: "Study daily. Completing blocks, days, or check-ins keeps your streak alive." },
    ],
  },
  {
    title: "Key Pages",
    items: [
      { q: "Dashboard", a: "Home. Position, journey, progress, quick actions." },
      { q: "Today", a: "Full daily plan — theory, config, lab, break/fix, recall." },
      { q: "Subnet Drills", a: "Timed practice. Target: under 30 seconds per question." },
      { q: "Cert Gates", a: "Live readiness tracking for CCNA → Security+ → NSE4 → AZ-104 → AZ-700." },
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
    <PageShell narrow>
      <PageHeader
        eyebrow="Quick Reference"
        title="How to Use NetForge"
        description="Everything you need in plain language. Short, but complete."
        actions={
          <>
            <Button onClick={() => startTour("welcome")}>Take the Tour</Button>
            <Link href="/">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </>
        }
      />

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-4 text-sm font-medium text-accent">{section.title}</h2>
            <dl className="space-y-3">
              {section.items.map((item) => (
                <Card key={item.q} className="border-border/60 py-4">
                  <dt className="text-sm font-medium">{item.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</dd>
                </Card>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-lg border border-border/50 bg-surface/50 px-4 py-3 text-xs text-muted">
        Progress saves in your browser. Use Export on the Accountability page to back up your data.
      </p>
    </PageShell>
  );
}
