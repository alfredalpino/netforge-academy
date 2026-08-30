"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AcademyPracticeSection } from "@/components/AcademyPracticeSection";
import { getOverallProgress, useProgress } from "@/lib/progress";
import { getDayPlan } from "@/lib/daily-plans";
import { getWeekPhase } from "@/lib/schedule";
import { getModuleAcademyResources, getSimulatorLabHref } from "@/lib/academy-resources";

export default function DashboardPage() {
  const { progress, loaded } = useProgress();
  const todayPlan = getDayPlan(progress.currentWeek, progress.currentDay);
  const phase = getWeekPhase(progress.currentWeek);
  const overall = loaded ? getOverallProgress(progress) : null;
  const { simulatorLab } = loaded
    ? getModuleAcademyResources(progress.currentModuleId)
    : { simulatorLab: undefined };
  const simulatorHref = simulatorLab
    ? getSimulatorLabHref(simulatorLab.id)
    : "/simulator";

  if (!loaded) {
    return <PageSkeleton />;
  }

  return (
    <PageShell testId="dashboard">
      <section className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-border/80 card-accent px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              NetForge
            </p>
            {progress.streak > 0 && (
              <Badge tone="success">{progress.streak}-day streak</Badge>
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-balance text-foreground/95 sm:text-3xl">
            Ready to study?
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Week {progress.currentWeek}, Day {progress.currentDay}
            {todayPlan ? ` — ${todayPlan.title}` : ` · ${phase}`}. One click opens today&apos;s plan.
          </p>

          <div className="mt-8 flex flex-wrap gap-3" data-tour="quick-actions">
            <Link href="/today">
              <Button size="lg">Start studying</Button>
            </Link>
            <Link href={simulatorHref}>
              <Button size="lg" variant="ghost">
                {simulatorLab ? `Lab · ${simulatorLab.title}` : "Open simulator"}
              </Button>
            </Link>
          </div>

          <p className="mt-6 font-mono text-xs text-muted">
            W{progress.currentWeek} · D{progress.currentDay}
            {overall ? ` · ${overall.overall}% overall` : ""}
            {overall ? ` · ${overall.currentMilestone.shortLabel}` : ""}
          </p>
        </div>
      </section>

      <div className="stagger-in space-y-8">
        <Card variant="accent" className="!p-0 overflow-hidden">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-border/60 p-6 lg:border-b-0 lg:border-r lg:p-8">
              <p className="section-label text-accent">Today</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
                {todayPlan?.title ?? "Module study mode"}
              </h2>
              <p className="mt-1 text-sm text-muted">{phase}</p>
              <div className="mt-6">
                <Link href="/today">
                  <Button variant="secondary" size="sm">
                    Open today&apos;s plan →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-background/25 p-6 lg:p-8" data-tour="progress">
              <ProgressTracker progress={progress} compact />
            </div>
          </div>
        </Card>

        <AcademyPracticeSection />

        <p className="text-center text-sm text-muted">
          <Link href="/curriculum" className="text-accent hover:underline">
            Curriculum
          </Link>
          {" · "}
          <Link href="/gates" className="text-accent hover:underline">
            Gates
          </Link>
          {" · "}
          <Link href="/guide" className="text-accent hover:underline">
            Guide
          </Link>
          {" · "}
          <Link href="/drills" className="text-accent hover:underline">
            Drills
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
