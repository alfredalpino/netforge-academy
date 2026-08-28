"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/ProgressRing";
import { StreakCalendar } from "@/components/StreakCalendar";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getDayProgressPercent,
  getWeekProgress,
  getOverallProgress,
  daysSinceStart,
} from "@/lib/progress";
import type { ProgressState } from "@/lib/types";
import { DAILY_BLOCKS } from "@/lib/schedule";
import { dayKey } from "@/lib/daily-plans";

interface ProgressTrackerProps {
  progress: ProgressState;
  compact?: boolean;
}

export function ProgressTracker({ progress, compact = false }: ProgressTrackerProps) {
  const overall = getOverallProgress(progress);
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
  const elapsed = daysSinceStart(progress.startDate);

  if (compact) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall" value={`${overall.overall}%`} accent="text-accent" />
        <StatCard label="Study Streak" value={`${progress.streak}d`} accent="text-success" />
        <StatCard label="Today's Blocks" value={`${dayPct}%`} />
        <StatCard label="Modules" value={`${overall.completedModules}/${overall.totalModules}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">Overall Progress</p>
                <p className="mt-1 text-3xl font-semibold">{overall.overall}%</p>
                <p className="text-xs text-muted">
                  {overall.currentMilestone.shortLabel} · W{progress.currentWeek} D{progress.currentDay}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <MiniStat label="Curriculum" value={`${overall.curriculum}%`} />
                <MiniStat label="Modules" value={`${overall.modules}%`} />
                <MiniStat label="Days" value={`${overall.days}%`} />
                <MiniStat label="Blocks" value={`${overall.blocks}%`} />
                <MiniStat label="Labs" value={`${overall.labs}%`} />
                <MiniStat label="Drills" value={`${overall.drills}%`} />
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MiniStat label="Streak" value={`${progress.streak}d`} color="text-success" />
                <MiniStat label="Best" value={`${progress.longestStreak}d`} />
                <MiniStat label="Days Done" value={`${overall.completedDays}`} />
                <MiniStat label="Elapsed" value={`${elapsed}d`} />
              </div>
            </div>
            <div className="flex gap-6">
              <ProgressRing percent={overall.modules} label="Modules" />
              <ProgressRing percent={overall.curriculum} size={80} label="Journey" />
            </div>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={Math.round((weekStats.blocksComplete / weekStats.totalBlocks) * 100)}
              label={`Week ${progress.currentWeek} · ${weekStats.daysComplete}/7 days · ${weekStats.blocksComplete}/${weekStats.totalBlocks} blocks`}
            />
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
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Study Activity</h3>
          <p className="mt-1 text-xs text-muted">Last 12 weeks</p>
          <div className="mt-4">
            <StreakCalendar studyHistory={progress.studyHistory} />
          </div>
          <dl className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Drill accuracy</dt>
              <dd className="font-mono">{overall.drills}%</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Best drill streak</dt>
              <dd className="font-mono text-success">{progress.drillStats.bestStreak}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Modules complete</dt>
              <dd className="font-mono">
                {overall.completedModules}/{overall.totalModules}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-muted">Blocks complete</dt>
              <dd className="font-mono">
                {overall.completedBlocks}/{overall.totalBlocks}
              </dd>
            </div>
          </dl>
          <Link
            href="/accountability"
            className="mt-4 inline-block text-xs text-accent hover:underline"
          >
            Full accountability tracker →
          </Link>
        </Card>
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
