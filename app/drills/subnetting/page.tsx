"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  generateSubnetQuestion,
  checkAnswer,
  isFullyCorrect,
  type SubnetAnswer,
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

const DRILL_TIME_SECONDS = 30;

export default function SubnettingDrillPage() {
  const { progress, loaded, recordDrillResult } = useProgress();
  const { showToast } = useToast();
  const [question, setQuestion] = useState(generateSubnetQuestion);
  const [answers, setAnswers] = useState<Partial<SubnetAnswer>>({});
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
    setQuestion(generateSubnetQuestion());
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(DRILL_TIME_SECONDS);
    setElapsed(0);
    startedAt.current = Date.now();
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = isFullyCorrect(answers, question.answer);
    const newStreak = allCorrect ? streak + 1 : 0;
    setScore((s) => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStreak(newStreak);
    recordDrillResult(allCorrect, newStreak, elapsed);
    showToast(allCorrect ? "Correct!" : "Review the answers below", allCorrect ? "success" : "warning");
  };

  const results = submitted ? checkAnswer(answers, question.answer) : [];

  const fieldResults: Record<string, boolean | undefined> = {
    network: results.find((r) => r.field === "Network")?.correct,
    broadcast: results.find((r) => r.field === "Broadcast")?.correct,
    firstHost: results.find((r) => r.field === "First Host")?.correct,
    lastHost: results.find((r) => r.field === "Last Host")?.correct,
    usableHosts: results.find((r) => r.field === "Usable Hosts")?.correct,
  };

  if (!loaded) return <PageSkeleton />;

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Drills"
        title="Subnetting Drills"
        description={`Target: answer in under ${DRILL_TIME_SECONDS} seconds without a calculator.`}
        actions={
          <Link href="/drills">
            <Button variant="secondary">All drills</Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone={secondsLeft <= 10 && !submitted ? "warning" : "default"}>
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
        {progress.drillStats.averageSeconds !== undefined && (
          <Badge>Avg: {progress.drillStats.averageSeconds.toFixed(1)}s</Badge>
        )}
      </div>

      <Card className="mx-auto max-w-lg">
        <p className="text-center text-xs uppercase tracking-widest text-muted">
          Given this host
        </p>
        <p className="mt-2 text-center font-mono text-3xl font-semibold text-accent">
          {question.ip}/{question.prefix}
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitted) handleSubmit();
            else nextQuestion();
          }}
        >
          {(
            [
              ["network", "Network Address", "network-address"],
              ["broadcast", "Broadcast Address", "broadcast-address"],
              ["firstHost", "First Usable Host", "first-host"],
              ["lastHost", "Last Usable Host", "last-host"],
              ["usableHosts", "Usable Hosts", "usable-hosts", "number"],
            ] as const
          ).map(([field, label, inputId, type]) => (
            <Input
              key={field}
              id={inputId}
              label={label}
              type={type ?? "text"}
              value={answers[field as keyof SubnetAnswer]?.toString() ?? ""}
              onChange={(e) =>
                setAnswers((a) => ({
                  ...a,
                  [field]:
                    type === "number"
                      ? parseInt(e.target.value) || undefined
                      : e.target.value,
                }))
              }
              disabled={submitted}
              className={
                submitted
                  ? fieldResults[field]
                    ? "border-success"
                    : "border-error"
                  : ""
              }
            />
          ))}

          <Button type="submit" className="mt-4 w-full">
            {submitted ? "Next Question →" : "Check Answer"}
          </Button>
        </form>

        {submitted && (
          <div className="mt-6 rounded-lg bg-background p-4 text-sm">
            <p className="text-xs uppercase text-muted">Correct Answers</p>
            <dl className="mt-2 space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <dt>Network</dt>
                <dd>{question.answer.network}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Broadcast</dt>
                <dd>{question.answer.broadcast}</dd>
              </div>
              <div className="flex justify-between">
                <dt>First Host</dt>
                <dd>{question.answer.firstHost}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Last Host</dt>
                <dd>{question.answer.lastHost}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Usable</dt>
                <dd>{question.answer.usableHosts}</dd>
              </div>
            </dl>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
