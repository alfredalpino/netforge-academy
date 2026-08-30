"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  generateSubnetQuestion,
  checkAnswer,
  isFullyCorrect,
  type SubnetAnswer,
} from "@/lib/subnetting";
import { SUBNET_EXAMPLES, SUBNET_VIDEO_LINKS } from "@/lib/drill-examples";
import { useProgress } from "@/lib/progress";
import { useToast } from "@/components/ui/Toast";
import { useDrillTimer } from "@/hooks/useDrillTimer";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DrillTimer } from "@/components/drills/DrillTimer";
import { DrillLearnPanel } from "@/components/drills/DrillLearnPanel";

const DRILL_TIME_SECONDS = 30;

export default function SubnettingDrillPage() {
  const { progress, loaded, recordDrillResult } = useProgress();
  const { showToast } = useToast();
  const [question, setQuestion] = useState(generateSubnetQuestion);
  const [answers, setAnswers] = useState<Partial<SubnetAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const submittedRef = useRef(false);

  const handleExpire = useCallback(() => {
    if (submittedRef.current) return;
    showToast("Time's up — check your answer", "warning");
  }, [showToast]);

  const timer = useDrillTimer({
    durationSeconds: DRILL_TIME_SECONDS,
    onExpire: handleExpire,
  });
  const { reset: resetTimer } = timer;

  const nextQuestion = useCallback(() => {
    setQuestion(generateSubnetQuestion());
    setAnswers({});
    setSubmitted(false);
    submittedRef.current = false;
    resetTimer();
  }, [resetTimer]);

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    const elapsed = timer.elapsed > 0 ? timer.elapsed : DRILL_TIME_SECONDS - timer.secondsLeft;
    const allCorrect = isFullyCorrect(answers, question.answer);
    const newStreak = allCorrect ? streak + 1 : 0;
    setScore((s) => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStreak(newStreak);
    recordDrillResult(allCorrect, newStreak, Math.max(elapsed, 0));
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
    <PageShell narrow testId="subnetting-drill-page">
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

      <DrillLearnPanel
        kind="subnet"
        examples={SUBNET_EXAMPLES}
        videoLinks={SUBNET_VIDEO_LINKS}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <DrillTimer
          status={timer.status}
          secondsLeft={timer.secondsLeft}
          elapsed={timer.elapsed}
          submitted={submitted}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onReset={timer.reset}
        />
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
