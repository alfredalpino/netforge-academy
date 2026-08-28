"use client";

import Link from "next/link";
import { ProgressTracker } from "@/components/ProgressTracker";
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
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Network Engineering Academy
        </h1>
        <p className="mt-1 text-muted">
          28-week curriculum · NOC Analyst → Network Engineer path
        </p>
      </header>

      {/* Current position + quick actions */}
      <section className="mb-8 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              Current Position
            </p>
            <h2 className="mt-1 text-xl font-medium">
              Week {progress.currentWeek} · Day {progress.currentDay}
            </h2>
            <p className="mt-1 text-sm text-muted">{phase}</p>
            {todayPlan && (
              <p className="mt-3 text-sm">
                <span className="text-muted">Today: </span>
                {todayPlan.title}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/focus"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
          >
            Start Focus Session
          </Link>
          <Link
            href="/today"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground hover:bg-surface-hover"
          >
            View Today&apos;s Plan
          </Link>
          <Link
            href="/accountability"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground hover:bg-surface-hover"
          >
            Check In
          </Link>
          <Link
            href="/drills/subnetting"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground hover:bg-surface-hover"
          >
            Subnet Drills
          </Link>
          <Link
            href="/resources"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground hover:bg-surface-hover"
          >
            Resources
          </Link>
        </div>
      </section>

      {/* Improved progress tracker */}
      <ProgressTracker progress={progress} />

      {/* Learning loop */}
      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-medium">The Learning Loop</h3>
        <p className="mt-1 text-xs text-muted">
          Every subject follows this cycle — not passive consumption
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LEARNING_LOOP.map((step, i) => (
            <div key={step.step} className="flex items-center gap-2">
              <span className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                {step.label}
              </span>
              {i < LEARNING_LOOP.length - 1 && (
                <span className="text-muted">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Priority concepts + phases preview */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-medium">Priority Concepts (Master First)</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRIORITY_CONCEPTS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Do not jump to AZ-700, FortiGate, or BGP until Phase 0–3 are intuitive.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-medium">Certification Gates</h3>
          <ul className="mt-3 space-y-2">
            {CERTIFICATION_GATES.map((g) => (
              <li key={g.id} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-mono text-accent">
                  {g.order}
                </span>
                {g.name}
              </li>
            ))}
          </ul>
          <Link href="/gates" className="mt-4 inline-block text-xs text-accent hover:underline">
            View gate requirements →
          </Link>
        </section>
      </div>

      {/* Phase overview */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">Curriculum Phases</h3>
          <Link href="/curriculum" className="text-xs text-accent hover:underline">
            Full curriculum →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((phase) => (
            <Link
              key={phase.id}
              href={`/curriculum/${phase.id}`}
              className="rounded-xl border border-border bg-surface p-4 transition hover:border-accent/40 hover:bg-surface-hover"
            >
              <span className="font-mono text-xs text-accent">
                Phase {phase.number}
              </span>
              <h4 className="mt-1 font-medium">{phase.title}</h4>
              <p className="mt-1 text-xs text-muted">{phase.weeks}</p>
              <p className="mt-2 text-xs text-muted line-clamp-2">
                {phase.objective}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
