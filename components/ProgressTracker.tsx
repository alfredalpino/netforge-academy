"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/ProgressRing";
import { StreakCalendar } from "@/components/StreakCalendar";
import {
  getProgressPercent,
  getDayProgressPercent,
  getWeekProgress,
  getAccountabilityScore,
  daysSinceStart,
} from "@/lib/progress";
import type { ProgressState } from "@/lib/types";
import { getTotalModules } from "@/lib/curriculum";
import { DAILY_BLOCKS } from "@/lib/schedule";
import { dayKey } from "@/lib/daily-plans";

interface ProgressTrackerProps {
  progress: ProgressState;
  compact?: boolean;
}

export function ProgressTracker({ progress, compact = false }: ProgressTrackerProps) {
  const modulePct = getProgressPercent(progress.completedModules, getTotalModules());
  const dayPct = getDayProgressPercent(
    progress.currentWeek,
    progress.currentDay,
    progress.completedBlocks
  );
  const weekStats = getWeekProgress(
    progress.currentWeek,
    progress.completedDays,
    progress.completedBlocks
  );
  const accountability = getAccountabilityScore(progress);
  const elapsed = daysSinceStart(progress.startDate);

  if (compact) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Study Streak" value={`${progress.streak}d`} accent="text-success" />
        <StatCard label="Longest Streak" value={`${progress.longestStreak}d`} />
        <StatCard label="Today's Blocks" value={`${dayPct}%`} />
        <StatCard label="Accountability" value={`${accountability}%`} accent="text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">Overall Progress</p>
                <p className="mt-1 text-3xl font-semibold">{accountability}%</p>
                <p className="text-xs text-muted">Accountability score</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MiniStat label="Streak" value={`${progress.streak}d`} color="text-success" />
                <MiniStat label="Best" value={`${progress.longestStreak}d`} />
                <MiniStat label="Days Done" value={`${progress.completedDays.length}`} />
                <MiniStat label="Elapsed" value={`${elapsed}d`} />
              </div>
            </div>
            <div className="flex gap-6">
              <ProgressRing percent={modulePct} label="Modules" />
              <ProgressRing percent={dayPct} size={80} label="Today" />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">Week {progress.currentWeek} progress</span>
              <span className="text-muted">
                {weekStats.daysComplete}/7 days · {weekStats.blocksComplete}/{weekStats.totalBlocks} blocks
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{
                  width: `${Math.round((weekStats.blocksComplete / weekStats.totalBlocks) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">Today&apos;s blocks ({DAILY_BLOCKS.length} total)</span>
              <span className="font-mono text-accent">{dayPct}%</span>
            </div>
            <div className="flex gap-1">
              {DAILY_BLOCKS.map((block) => {
                const key = dayKey(progress.currentWeek, progress.currentDay);
                const done = (progress.completedBlocks[key] ?? []).includes(block.id);
                return (
                  <div
                    key={block.id}
                    title={block.title}
                    className={`h-2 flex-1 rounded-sm transition-colors ${
                      done ? "bg-success" : "bg-border"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-medium">Study Activity</h3>
          <p className="mt-1 text-xs text-muted">Last 12 weeks</p>
          <div className="mt-4">
            <StreakCalendar studyHistory={progress.studyHistory} />
          </div>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Drill accuracy</dt>
              <dd className="font-mono">
                {progress.drillStats.totalAttempts > 0
                  ? Math.round(
                      (progress.drillStats.totalCorrect / progress.drillStats.totalAttempts) * 100
                    )
                  : 0}
                %
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Best drill streak</dt>
              <dd className="font-mono text-success">{progress.drillStats.bestStreak}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Modules complete</dt>
              <dd className="font-mono">
                {progress.completedModules.length}/{getTotalModules()}
              </dd>
            </div>
          </dl>
          <Link
            href="/accountability"
            className="mt-4 inline-block text-xs text-accent hover:underline"
          >
            Full accountability tracker →
          </Link>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-lg font-semibold ${color ?? ""}`}>{value}</p>
    </div>
  );
}
