"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DAILY_PLANS } from "@/lib/daily-plans";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function RecallDrillPage() {
  const cards = useMemo(
    () =>
      DAILY_PLANS.flatMap((plan) =>
        plan.recall.map((prompt) => ({
          prompt,
          week: plan.week,
          day: plan.day,
          title: plan.title,
        }))
      ),
    []
  );

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = cards[index];

  const next = () => {
    setIndex((i) => (i + 1) % cards.length);
    setRevealed(false);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
    setRevealed(false);
  };

  return (
    <PageShell narrow testId="recall-drill-page">
      <PageHeader
        eyebrow="Drills"
        title="Recall Flashcards"
        description="Review recall prompts from your daily curriculum — no scoring, just spaced repetition."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/today">
              <Button variant="secondary">Today&apos;s plan</Button>
            </Link>
            <Link href="/drills">
              <Button variant="ghost">All drills</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>
          Card {index + 1} of {cards.length}
        </Badge>
        <Link
          href="/topics"
          className="rounded-lg border border-border px-2.5 py-1 text-xs text-accent hover:bg-accent/5"
        >
          Related · Topic videos
        </Link>
        <Link
          href="/curriculum"
          className="rounded-lg border border-border px-2.5 py-1 text-xs text-accent hover:bg-accent/5"
        >
          Curriculum
        </Link>
      </div>

      <Card className="mx-auto max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted">
          Week {card.week}, Day {card.day}
        </p>
        <p className="mt-1 text-sm text-muted">{card.title}</p>
        <p className="mt-8 text-lg font-medium leading-relaxed">{card.prompt}</p>

        {revealed ? (
          <p className="mt-6 text-sm text-muted">
            Say your answer aloud, then check your notes or lab journal.
          </p>
        ) : (
          <Button className="mt-8" onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="secondary" onClick={prev}>
            ← Previous
          </Button>
          <Button variant="secondary" onClick={next}>
            Next →
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
