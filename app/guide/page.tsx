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
      { q: "What is NetForge?", a: "A 28-week study system — daily plans, curated topic videos, browser simulator labs, and local Packet Tracer/EVE-NG work. Progress tracks here." },
      { q: "First thing to do?", a: "Set up your lab stack (Labs page), skim Topic Videos for your module, then open Today for your first study session." },
    ],
  },
  {
    title: "Daily Workflow",
    items: [
      { q: "Morning routine", a: "Dashboard → check your position → Today for the plan → work through each block." },
      { q: "End of day", a: "Mark Day Complete on Today page. Check in on Accountability (streak + reflection)." },
    ],
  },
  {
    title: "Topic Videos & Simulator",
    items: [
      {
        q: "When to use Topic Videos?",
        a: "Before theory blocks — open Topic Videos. Each concept page has one lecture; Full courses play entire playlists (CCNA practical, Security+, Bash). Curriculum topics link when a match exists.",
      },
      {
        q: "How do simulator labs fit?",
        a: "After you understand the concept, launch a browser lab from Dashboard Practice, Today’s reinforce strip, or Lab Stack. Fourteen graded labs cover LAN through ACLs (including TCP port filters), inter-VLAN routing, L3 switching, and NAT — configure devices in the terminal, ping, inspect Capture, and Submit for scoring.",
      },
      {
        q: "Local labs vs browser simulator?",
        a: "Packet Tracer / EVE-NG on your machine for full CCNA depth (Lab Stack page). The in-browser simulator is for quick reps and zero-install practice between sessions.",
      },
      {
        q: "Deep links?",
        a: "Simulator: /simulator?lab=<id> — e.g. basic-lan, acl-tcp, nat-basic, inter-vlan-svi (see Lab Stack for all 14). Topic pages: /topics/<slug> — e.g. /topics/subnetting. Dashboard and Today suggest the best match for your current module.",
      },
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
      { q: "Today", a: "Full daily plan — theory, config, lab, break/fix, recall. Reinforce strip links topic videos + simulator labs for your module." },
      { q: "Topic Videos", a: "Single-concept Jeremy's IT Lab lectures plus full courses (David Bombal CCNA, Professor Messer Security+, Bash scripting, Linux). Browse by phase or open Full courses." },
      { q: "Simulator", a: "In-browser graded labs — topology canvas, CLI terminal, packet capture. Launch from Dashboard, Today, or Lab Stack." },
      { q: "Subnet Drills", a: "Timed practice. Target: under 30 seconds per question." },
      { q: "Cert Gates", a: "Live readiness tracking for CCNA → Security+ → NSE4 → AZ-104 → AZ-700." },
    ],
  },
  {
    title: "Tips",
    items: [
      { q: "Don't skip foundations", a: "Phase 0–3 (Linux → Routing) before FortiGate, BGP, or Azure." },
      { q: "Labs run locally", a: "Packet Tracer, EVE-NG, Wireshark on your machine — not in the browser." },
      { q: "Today shortcuts", a: "On Today: N/→ next day, P/← prev day, 1–5 mark blocks, ? help overlay." },
      { q: "Theme", a: "Toggle light/dark from the sidebar — preference persists across sessions." },
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
