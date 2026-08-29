"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressTracker } from "@/components/ProgressTracker";
import { JourneyNavigator } from "@/components/JourneyNavigator";
import { getOverallProgress, useProgress } from "@/lib/progress";
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
  const overall = loaded ? getOverallProgress(progress) : null;

  if (!loaded) {
    return <PageSkeleton />;
  }

  return (
    <PageShell>
      <section className="relative mb-12 overflow-hidden rounded-[1.75rem] border border-border/80 card-accent px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              NetForge
            </p>
            {progress.streak > 0 && (
              <Badge tone="success">{progress.streak}-day streak</Badge>
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-balance text-foreground/95 sm:text-3xl">
            Train like an elite network engineer.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            A 28-week academy path from NOC Analyst to Network Engineer — deliberate study,
            labs, drills, and certification gates.
          </p>

          <div className="mt-8 flex flex-wrap gap-3" data-tour="quick-actions">
            <Link href="/focus">
              <Button size="lg">Start Focus Session</Button>
            </Link>
            <Link href="/today">
              <Button size="lg" variant="secondary">
                Today&apos;s Plan
              </Button>
            </Link>
            <Link href="/drills/subnetting">
              <Button size="lg" variant="ghost">
                Subnet Drills
              </Button>
            </Link>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border/60 pt-6">
            <div>
              <dt className="section-label">Position</dt>
              <dd className="mt-1 font-mono text-sm text-foreground">
                W{progress.currentWeek} · D{progress.currentDay}
              </dd>
            </div>
            <div>
              <dt className="section-label">Progress</dt>
              <dd className="mt-1 font-mono text-sm text-foreground">{overall?.overall ?? 0}%</dd>
            </div>
            <div>
              <dt className="section-label">Phase</dt>
              <dd className="mt-1 truncate text-sm text-foreground">{phase}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="stagger-in space-y-8">
        <Card variant="accent" className="!p-0 overflow-hidden">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-border/60 p-6 lg:border-b-0 lg:border-r lg:p-8">
              <p className="section-label text-accent">Current assignment</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                Week {progress.currentWeek} · Day {progress.currentDay}
              </h2>
              <p className="mt-1 text-sm text-muted">{phase}</p>
              {todayPlan ? (
                <p className="mt-4 text-sm leading-relaxed">
                  <span className="text-muted">Today: </span>
                  {todayPlan.title}
                </p>
              ) : (
                <p className="mt-4 text-sm text-warning">
                  Module study mode — detailed day plans cover weeks 1–6
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/accountability">
                  <Button variant="secondary" size="sm">
                    Daily check-in
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button variant="ghost" size="sm">
                    Resources
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-background/25 p-6 lg:p-8" data-tour="progress">
              <ProgressTracker progress={progress} compact />
            </div>
          </div>
        </Card>

        <div>
          <JourneyNavigator compact />
        </div>

        <Card variant="elevated">
          <p className="section-label">Methodology</p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
            The Learning Loop
          </h3>
          <p className="mt-1 text-sm text-muted">
            Every subject follows this cycle — not passive consumption.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {LEARNING_LOOP.map((step, i) => (
              <div key={step.step} className="flex items-center gap-2">
                <Badge tone="accent">{step.label}</Badge>
                {i < LEARNING_LOOP.length - 1 && (
                  <span className="text-muted" aria-hidden="true">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="elevated">
            <p className="section-label">Foundation</p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Priority Concepts
            </h3>
            <p className="mt-1 text-sm text-muted">Master these before advanced topics</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PRIORITY_CONCEPTS.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              Do not jump to AZ-700, FortiGate, or BGP until Phase 0–3 are intuitive.
            </p>
          </Card>

          <Card variant="elevated">
            <p className="section-label">Milestones</p>
            <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Certification Gates
            </h3>
            <ul className="mt-5 space-y-3">
              {CERTIFICATION_GATES.map((g) => (
                <li key={g.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-mono text-xs text-accent">
                    {g.order}
                  </span>
                  {g.name}
                </li>
              ))}
            </ul>
            <Link href="/gates" className="mt-5 inline-block text-sm text-accent hover:underline">
              View gate readiness →
            </Link>
          </Card>
        </div>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Program</p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                Curriculum Phases
              </h3>
            </div>
            <Link href="/curriculum" className="text-sm text-accent hover:underline">
              Full curriculum →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p) => (
              <Link
                key={p.id}
                href={`/curriculum/${p.id}`}
                className="group rounded-2xl border border-border bg-surface/80 p-5 shadow-[var(--shadow-card)] transition hover:border-accent/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="font-mono text-xs text-accent">Phase {p.number}</span>
                <h4 className="mt-2 font-display font-semibold tracking-tight transition-colors group-hover:text-accent">
                  {p.title}
                </h4>
                <p className="mt-1 text-xs text-muted">{p.weeks}</p>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">{p.objective}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
