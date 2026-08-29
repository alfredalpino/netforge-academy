"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const DRILLS = [
  {
    href: "/drills/subnetting",
    title: "Subnetting",
    description:
      "Calculate network, broadcast, host range, and usable hosts from a given IP/prefix — under timed pressure.",
    tag: "Core skill",
    metric: "Speed + accuracy",
  },
  {
    href: "/drills/vlsm",
    title: "VLSM Design",
    description:
      "Allocate subnets to departments with varying host requirements from a single base network.",
    tag: "Phase 2",
    metric: "Design judgment",
  },
  {
    href: "/drills/recall",
    title: "Recall Flashcards",
    description:
      "Active recall prompts drawn from your daily curriculum plans — close the forgetting curve.",
    tag: "Retention",
    metric: "Long-term memory",
  },
] as const;

export default function DrillsPage() {
  const { progress, loaded } = useProgress();

  if (!loaded) return <PageSkeleton />;

  const { drillStats } = progress;
  const accuracy =
    drillStats.totalAttempts > 0
      ? Math.round((drillStats.totalCorrect / drillStats.totalAttempts) * 100)
      : 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Practice Lab"
        title="Drills"
        description="Build exam-grade subnetting speed and VLSM design fluency tracked toward certification gates."
        actions={
          <Link href="/gates">
            <Button variant="secondary">View gates</Button>
          </Link>
        }
      />

      <Card variant="elevated" className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label">Performance</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
              Your drill stats
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>
              {drillStats.totalCorrect}/{drillStats.totalAttempts} correct
            </Badge>
            <Badge tone={accuracy >= 80 ? "success" : "default"}>{accuracy}% accuracy</Badge>
            <Badge tone="accent">Best streak: {drillStats.bestStreak}</Badge>
            {drillStats.averageSeconds !== undefined && (
              <Badge>Avg: {drillStats.averageSeconds.toFixed(1)}s</Badge>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          CCNA gate target: 20-streak mastery — currently met at 10+ streak or 80%+ over 15 attempts.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map((drill) => (
          <Link key={drill.href} href={drill.href} className="group">
            <Card
              variant="elevated"
              className="h-full transition duration-200 group-hover:border-accent/45 group-hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight">{drill.title}</h2>
                <Badge tone="accent">{drill.tag}</Badge>
              </div>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-wider text-muted">
                {drill.metric}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{drill.description}</p>
              <p className="mt-6 text-sm font-medium text-accent transition group-hover:translate-x-0.5">
                Enter drill →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
