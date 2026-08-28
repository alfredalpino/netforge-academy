"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressTracker } from "@/components/ProgressTracker";
import { JourneyNavigator } from "@/components/JourneyNavigator";
import { useProgress } from "@/lib/progress";
import { getDayPlan } from "@/lib/daily-plans";
import { getWeekPhase } from "@/lib/schedule";
import {
  PHASES,
  LEARNING_LOOP,
  PRIORITY_CONCEPTS,
  CERTIFICATION_GATES,
} from "@/lib/curriculum";

export default function DashboardPage() {
  const { progress, loaded } = useProgress();
  const todayPlan = getDayPlan(progress.currentWeek, progress.currentDay);
  const phase = getWeekPhase(progress.currentWeek);

  if (!loaded) {
    return <PageSkeleton />;
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="NetForge"
        title="Network Engineering Academy"
        description="28-week structured path from NOC Analyst to Network Engineer — study, lab, track, repeat."
        actions={
          progress.streak > 0 ? (
            <Badge tone="success">{progress.streak} day streak</Badge>
          ) : undefined
        }
      />

      <div className="mb-8">
        <JourneyNavigator compact />
      </div>

      <Card className="mb-8 border-accent/20 bg-gradient-to-br from-surface to-surface-hover">
        <p className="text-xs uppercase tracking-widest text-accent">Current Position</p>
        <h2 className="mt-1 text-xl font-medium sm:text-2xl">
          Week {progress.currentWeek} · Day {progress.currentDay}
        </h2>
        <p className="mt-1 text-sm text-muted">{phase}</p>
        {todayPlan ? (
          <p className="mt-3 text-sm">
            <span className="text-muted">Today: </span>
            {todayPlan.title}
          </p>
        ) : (
          <p className="mt-3 text-sm text-warning">
            Module study mode — detailed day plan available for weeks 1–4
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2 sm:gap-3" data-tour="quick-actions">
          <Link href="/focus">
            <Button>Start Focus Session</Button>
          </Link>
          <Link href="/today">
            <Button variant="secondary">Today&apos;s Plan</Button>
          </Link>
          <Link href="/accountability">
            <Button variant="secondary">Check In</Button>
          </Link>
          <Link href="/drills/subnetting">
            <Button variant="secondary">Subnet Drills</Button>
          </Link>
          <Link href="/resources">
            <Button variant="ghost">Resources</Button>
          </Link>
        </div>
      </Card>

      <div data-tour="progress" className="mb-8">
        <ProgressTracker progress={progress} compact />
      </div>

      <Card className="mb-8">
        <h3 className="text-sm font-medium">The Learning Loop</h3>
        <p className="mt-1 text-xs text-muted">
          Every subject follows this cycle — not passive consumption
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {LEARNING_LOOP.map((step, i) => (
            <div key={step.step} className="flex items-center gap-2">
              <Badge tone="accent">{step.label}</Badge>
              {i < LEARNING_LOOP.length - 1 && (
                <span className="text-muted" aria-hidden="true">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-medium">Priority Concepts</h3>
          <p className="mt-1 text-xs text-muted">Master these before advanced topics</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRIORITY_CONCEPTS.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Do not jump to AZ-700, FortiGate, or BGP until Phase 0–3 are intuitive.
          </p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Certification Gates</h3>
          <ul className="mt-4 space-y-3">
            {CERTIFICATION_GATES.map((g) => (
              <li key={g.id} className="flex items-center gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-xs text-accent">
                  {g.order}
                </span>
                {g.name}
              </li>
            ))}
          </ul>
          <Link href="/gates" className="mt-4 inline-block text-xs text-accent hover:underline">
            View gate readiness →
          </Link>
        </Card>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Curriculum Phases</h3>
          <Link href="/curriculum" className="text-xs text-accent hover:underline">
            Full curriculum →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((p) => (
            <Link
              key={p.id}
              href={`/curriculum/${p.id}`}
              className="group rounded-xl border border-border bg-surface p-4 transition hover:border-accent/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="font-mono text-xs text-accent">Phase {p.number}</span>
              <h4 className="mt-1 font-medium group-hover:text-accent transition-colors">
                {p.title}
              </h4>
              <p className="mt-1 text-xs text-muted">{p.weeks}</p>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{p.objective}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
