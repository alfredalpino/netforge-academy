"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  generateVlsmQuestion,
  checkVlsmAnswer,
  isVlsmFullyCorrect,
  type VlsmSubnetAssignment,
} from "@/lib/subnetting";
import { useProgress } from "@/lib/progress";
import { useToast } from "@/components/ui/Toast";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const DRILL_TIME_SECONDS = 60;

type UserAssignment = { network: string; prefix: number | undefined };

export default function VlsmDrillPage() {
  const { progress, loaded, recordDrillResult } = useProgress();
  const { showToast } = useToast();
  const [question, setQuestion] = useState(generateVlsmQuestion);
  const [answers, setAnswers] = useState<Record<string, UserAssignment>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DRILL_TIME_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (submitted) return;
    if (startedAt.current === null) startedAt.current = Date.now();

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      if (startedAt.current) {
        setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [question, submitted]);

  const nextQuestion = useCallback(() => {
    const q = generateVlsmQuestion();
    setQuestion(q);
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(DRILL_TIME_SECONDS);
    setElapsed(0);
    startedAt.current = Date.now();
  }, []);

  const toUserAssignments = (): VlsmSubnetAssignment[] =>
    question.requirements.map((req) => ({
      name: req.name,
      network: answers[req.name]?.network ?? "",
      prefix: answers[req.name]?.prefix ?? 0,
      usableHosts: 0,
    }));

  const handleSubmit = () => {
    setSubmitted(true);
    const userAssignments = toUserAssignments();
    const allCorrect = isVlsmFullyCorrect(userAssignments, question.answer);
    const newStreak = allCorrect ? streak + 1 : 0;
    setScore((s) => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStreak(newStreak);
    recordDrillResult(allCorrect, newStreak, elapsed);
    showToast(allCorrect ? "Correct!" : "Review the allocations below", allCorrect ? "success" : "warning");
  };

  const results = submitted ? checkVlsmAnswer(toUserAssignments(), question.answer) : [];
  const resultByName = Object.fromEntries(results.map((r) => [r.name, r.correct]));

  if (!loaded) return <PageSkeleton />;

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Drills"
        title="VLSM Design"
        description={`Allocate subnets to each department from the base network. Target: under ${DRILL_TIME_SECONDS} seconds.`}
        actions={
          <Link href="/drills">
            <Button variant="secondary">All drills</Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone={secondsLeft <= 15 && !submitted ? "warning" : "default"}>
          Timer: {submitted ? `${elapsed}s` : `${secondsLeft}s`}
        </Badge>
        <Badge>
          Session: {score.correct}/{score.total}
        </Badge>
        <Badge tone="success">Streak: {streak}</Badge>
        <Badge>
          All-time: {progress.drillStats.totalCorrect}/{progress.drillStats.totalAttempts}
        </Badge>
        <Badge tone="accent">Best: {progress.drillStats.bestStreak}</Badge>
      </div>

      <Card className="mx-auto max-w-lg">
        <p className="text-center text-xs uppercase tracking-widest text-muted">Base network</p>
        <p className="mt-2 text-center font-mono text-3xl font-semibold text-accent">
          {question.baseNetwork}/{question.basePrefix}
        </p>

        <p className="mt-6 text-xs uppercase tracking-widest text-muted">Requirements</p>
        <ul className="mt-2 space-y-1 text-sm">
          {question.requirements.map((req) => (
            <li key={req.name} className="flex justify-between font-mono">
              <span>{req.name}</span>
              <span className="text-muted">{req.hostsNeeded} hosts</span>
            </li>
          ))}
        </ul>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitted) handleSubmit();
            else nextQuestion();
          }}
        >
          {question.requirements.map((req) => (
            <div key={req.name} className="space-y-3 rounded-lg border border-border/50 p-4">
              <p className="text-sm font-medium">{req.name}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  id={`${req.name}-network`}
                  label="Network Address"
                  value={answers[req.name]?.network ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [req.name]: { ...a[req.name], network: e.target.value, prefix: a[req.name]?.prefix },
                    }))
                  }
                  disabled={submitted}
                  className={
                    submitted
                      ? resultByName[req.name]
                        ? "border-success"
                        : "border-error"
                      : ""
                  }
                />
                <Input
                  id={`${req.name}-prefix`}
                  label="Prefix Length"
                  type="number"
                  value={answers[req.name]?.prefix?.toString() ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [req.name]: {
                        network: a[req.name]?.network ?? "",
                        prefix: parseInt(e.target.value) || undefined,
                      },
                    }))
                  }
                  disabled={submitted}
                  className={
                    submitted
                      ? resultByName[req.name]
                        ? "border-success"
                        : "border-error"
                      : ""
                  }
                />
              </div>
            </div>
          ))}

          <Button type="submit" className="mt-4 w-full">
            {submitted ? "Next Question →" : "Check Answer"}
          </Button>
        </form>

        {submitted && (
          <div className="mt-6 rounded-lg bg-background p-4 text-sm">
            <p className="text-xs uppercase text-muted">Correct Allocations</p>
            <dl className="mt-2 space-y-2 font-mono text-xs">
              {question.answer.map((a) => (
                <div key={a.name} className="flex justify-between gap-4">
                  <dt>{a.name}</dt>
                  <dd>
                    {a.network}/{a.prefix} ({a.usableHosts} usable)
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
