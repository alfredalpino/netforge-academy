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
    description: "Calculate network, broadcast, host range, and usable hosts from a given IP/prefix.",
    tag: "Classic",
  },
  {
    href: "/drills/vlsm",
    title: "VLSM Design",
    description: "Allocate subnets to departments with varying host requirements from a base network.",
    tag: "Phase 2",
  },
  {
    href: "/drills/recall",
    title: "Recall Flashcards",
    description: "Review recall prompts from your daily curriculum plans.",
    tag: "Review",
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
        eyebrow="Practice"
        title="Drills"
        description="Build subnetting speed and VLSM design skills tracked toward certification gates."
        actions={
          <Link href="/gates">
            <Button variant="secondary">View gates</Button>
          </Link>
        }
      />

      <Card className="mb-8">
        <h2 className="text-sm font-medium">Your drill stats</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>
            {drillStats.totalCorrect}/{drillStats.totalAttempts} correct
          </Badge>
          <Badge tone={accuracy >= 80 ? "success" : "default"}>{accuracy}% accuracy</Badge>
          <Badge tone="accent">Best streak: {drillStats.bestStreak}</Badge>
          {drillStats.averageSeconds !== undefined && (
            <Badge>Avg: {drillStats.averageSeconds.toFixed(1)}s</Badge>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          CCNA gate target: 20-streak mastery — currently met at 10+ streak or 80%+ over 15 attempts.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRILLS.map((drill) => (
          <Link key={drill.href} href={drill.href} className="group">
            <Card className="h-full transition group-hover:border-accent/40">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-medium">{drill.title}</h2>
                <Badge tone="default">{drill.tag}</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{drill.description}</p>
              <p className="mt-4 text-sm font-medium text-accent group-hover:underline">
                Start drill →
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
