"use client";

import { useState } from "react";
import Link from "next/link";
import { FocusTimer } from "@/components/FocusTimer";
import { useProgress } from "@/lib/progress";
import { getDayPlan } from "@/lib/daily-plans";
import { DAILY_BLOCKS } from "@/lib/schedule";

const BLOCK_MINUTES: Record<string, number> = {
  "block-1": 120,
  "block-2": 90,
  "block-3": 120,
  "block-4": 90,
  "block-5": 60,
  "block-6": 60,
};

export default function FocusPage() {
  const { progress, completeBlock, isBlockComplete } = useProgress();
  const plan = getDayPlan(progress.currentWeek, progress.currentDay);
  const [activeBlock, setActiveBlock] = useState(DAILY_BLOCKS[0].id);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const block = DAILY_BLOCKS.find((b) => b.id === activeBlock)!;
  const blockMinutes = BLOCK_MINUTES[activeBlock] ?? 60;

  const planItems = (() => {
    if (!plan) return block.activities;
    switch (activeBlock) {
      case "block-1": return plan.theory.length ? plan.theory : block.activities;
      case "block-2": return plan.config.length ? plan.config : block.activities;
      case "block-3": return [plan.lab];
      case "block-4": return plan.breakFix.length ? plan.breakFix : block.activities;
      case "block-5": return plan.recall.length ? plan.recall : block.activities;
      default: return block.activities;
    }
  })();

  const toggleCheck = (idx: number) => {
    const key = `${activeBlock}-${idx}`;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = planItems.every((_, i) => checklist[`${activeBlock}-${i}`]);

  return (
    <div className="focus-mode min-h-screen bg-focus-bg">
      {/* Minimal header */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Focus Mode
          </span>
          {plan && (
            <p className="text-sm text-foreground/80">
              W{progress.currentWeek} D{progress.currentDay} — {plan.title}
            </p>
          )}
        </div>
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground"
        >
          Exit Focus
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Block selector */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {DAILY_BLOCKS.map((b) => {
            const done = isBlockComplete(progress.currentWeek, progress.currentDay, b.id);
            return (
              <button
                key={b.id}
                onClick={() => {
                  setActiveBlock(b.id);
                  setChecklist({});
                }}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${
                  activeBlock === b.id
                    ? "bg-accent text-white"
                    : done
                      ? "bg-success/15 text-success"
                      : "bg-surface text-muted hover:text-foreground"
                }`}
              >
                {b.start} {done && "✓"}
              </button>
            );
          })}
        </div>

        {/* Timer */}
        <FocusTimer
          key={activeBlock}
          initialMinutes={blockMinutes}
          blockTitle={`${block.start}–${block.end} · ${block.title}`}
        />

        {/* Checklist only — no distractions */}
        <section className="mt-12">
          <h2 className="mb-1 text-center text-sm font-medium">{block.focus}</h2>
          <ul className="mt-6 space-y-3">
            {planItems.map((item, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 bg-surface/50 px-4 py-3 transition hover:bg-surface">
                  <input
                    type="checkbox"
                    checked={!!checklist[`${activeBlock}-${i}`]}
                    onChange={() => toggleCheck(i)}
                    className="mt-0.5 accent-accent"
                  />
                  <span className="text-sm leading-relaxed">{item}</span>
                </label>
              </li>
            ))}
          </ul>

          {allChecked && planItems.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  completeBlock(progress.currentWeek, progress.currentDay, activeBlock)
                }
                className="rounded-lg bg-success px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                Mark Block Complete
              </button>
            </div>
          )}
        </section>

        <p className="mt-16 text-center text-xs text-muted/60">
          No social media. No videos. Build, configure, troubleshoot.
        </p>
      </div>
    </div>
  );
}
