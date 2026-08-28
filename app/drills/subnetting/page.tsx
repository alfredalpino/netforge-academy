"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  generateSubnetQuestion,
  checkAnswer,
  isFullyCorrect,
  type SubnetAnswer,
} from "@/lib/subnetting";
import { useProgress } from "@/lib/progress";

export default function SubnettingDrillPage() {
  const { progress, loaded, recordDrillResult } = useProgress();
  const [question, setQuestion] = useState(generateSubnetQuestion);
  const [answers, setAnswers] = useState<Partial<SubnetAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const nextQuestion = useCallback(() => {
    setQuestion(generateSubnetQuestion());
    setAnswers({});
    setSubmitted(false);
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    const results = checkAnswer(answers, question.answer);
    const allCorrect = isFullyCorrect(answers, question.answer);
    const newStreak = allCorrect ? streak + 1 : 0;
    setScore((s) => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setStreak(newStreak);
    recordDrillResult(allCorrect, newStreak);
    return results;
  };

  const results = submitted ? checkAnswer(answers, question.answer) : [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Subnetting Drills</h1>
        <p className="mt-1 text-muted">
          Target: answer in under 30 seconds without a calculator
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-muted">Session: </span>
          <span className="font-mono font-medium">
            {score.correct}/{score.total}
          </span>
        </div>
        <div>
          <span className="text-muted">Streak: </span>
          <span className="font-mono font-medium text-success">{streak}</span>
        </div>
        {loaded && (
          <>
            <div>
              <span className="text-muted">All-time: </span>
              <span className="font-mono font-medium">
                {progress.drillStats.totalCorrect}/{progress.drillStats.totalAttempts}
              </span>
            </div>
            <div>
              <span className="text-muted">Best streak: </span>
              <span className="font-mono font-medium text-accent">
                {progress.drillStats.bestStreak}
              </span>
            </div>
          </>
        )}
        <Link href="/accountability" className="text-accent hover:underline">
          View progress →
        </Link>
      </div>

      <section className="mx-auto max-w-lg rounded-xl border border-border bg-surface p-8">
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
              ["network", "Network Address"],
              ["broadcast", "Broadcast Address"],
              ["firstHost", "First Usable Host"],
              ["lastHost", "Last Usable Host"],
              ["usableHosts", "Usable Hosts", "number"],
            ] as const
          ).map(([field, label, type]) => (
            <div key={field}>
              <label className="text-xs text-muted">{label}</label>
              <input
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
                className={`mt-1 w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-accent ${
                  submitted
                    ? results.find((r) => r.field === label.split(" ")[0] || r.field.startsWith(label.split(" ")[0]))
                      ? results.find((r) =>
                          label.startsWith(r.field) ||
                          (r.field === "First Host" && field === "firstHost") ||
                          (r.field === "Last Host" && field === "lastHost") ||
                          (r.field === "Usable Hosts" && field === "usableHosts") ||
                          (r.field === "Network" && field === "network") ||
                          (r.field === "Broadcast" && field === "broadcast")
                        )?.correct
                        ? "border-success"
                        : "border-red-500"
                      : "border-border"
                    : "border-border"
                }`}
              />
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
          >
            {submitted ? "Next Question →" : "Check Answer"}
          </button>
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
      </section>
    </div>
  );
}
