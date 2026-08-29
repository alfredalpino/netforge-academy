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
    <PageShell narrow>
      <PageHeader
        eyebrow="Drills"
        title="Recall Flashcards"
        description="Review recall prompts from your daily curriculum — no scoring, just spaced repetition."
        actions={
          <Link href="/drills">
            <Button variant="secondary">All drills</Button>
          </Link>
        }
      />

      <div className="mb-6">
        <Badge>
          Card {index + 1} of {cards.length}
        </Badge>
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
