"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getWeekProgress, getCalendarWeekCheckIns } from "@/lib/progress";
import type { ProgressState } from "@/lib/types";
import { getWeekPhase } from "@/lib/schedule";
import { LAB_LIST } from "@/content/labs";

const SUNDAY_ACTIONS = [
  "Review mistakes from this week's labs and drills",
  "Run subnet drills until you're fluent under pressure",
  "Set your goal for next week below",
];

interface WeeklyReviewProps {
  progress: ProgressState;
}

export function WeeklyReview({ progress }: WeeklyReviewProps) {
  const weekStats = getWeekProgress(
    progress.currentWeek,
    progress.completedDays,
    progress.completedBlocks
  );
  const phase = getWeekPhase(progress.currentWeek);
  const weekActivity = getCalendarWeekCheckIns(progress.checkIns, progress.studyHistory);
  const blockPercent = Math.round((weekStats.blocksComplete / weekStats.totalBlocks) * 100);
  const dayPercent = Math.round((weekStats.daysComplete / 7) * 100);
  const labsPassed = progress.completedSimulatorLabs.length;
  const labsTotal = LAB_LIST.length;
  const labPercent = labsTotal > 0 ? Math.round((labsPassed / labsTotal) * 100) : 0;
  const drillAccuracy =
    progress.drillStats.totalAttempts > 0
      ? Math.round(
          (progress.drillStats.totalCorrect / progress.drillStats.totalAttempts) * 100,
        )
      : 0;

  return (
    <Card className="mt-8" data-testid="weekly-review">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Weekly Review</h2>
          <p className="mt-1 text-xs text-muted">
            Week {progress.currentWeek} · {phase}
          </p>
        </div>
        <Badge tone={weekStats.daysComplete === 7 ? "success" : "default"}>
          {weekStats.daysComplete}/7 days
        </Badge>
      </div>

      <div className="mt-6 space-y-4">
        <ProgressBar
          value={dayPercent}
          label={`Days complete · ${weekStats.daysComplete}/7`}
        />
        <ProgressBar
          value={blockPercent}
          label={`Blocks complete · ${weekStats.blocksComplete}/${weekStats.totalBlocks}`}
        />
        <ProgressBar
          value={labPercent}
          label={`Simulator labs passed · ${labsPassed}/${labsTotal}`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-background p-4">
          <h3 className="text-xs uppercase tracking-widest text-muted">Drill performance</h3>
          <p className="mt-2 text-sm">
            {progress.drillStats.totalAttempts > 0 ? (
              <>
                {progress.drillStats.totalCorrect}/{progress.drillStats.totalAttempts} correct
                ({drillAccuracy}%) · best streak {progress.drillStats.bestStreak}
              </>
            ) : (
              <span className="text-muted">No drill attempts yet.</span>
            )}
          </p>
          <Link href="/drills" className="mt-2 inline-block text-xs font-medium text-accent">
            Open drills →
          </Link>
        </div>
        <div className="rounded-lg border border-border/50 bg-background p-4">
          <h3 className="text-xs uppercase tracking-widest text-muted">Simulator labs</h3>
          <p className="mt-2 text-sm">
            {labsPassed}/{labsTotal} browser labs graded at 100%.
          </p>
          <Link href="/labs" className="mt-2 inline-block text-xs font-medium text-accent">
            Lab stack →
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs uppercase tracking-widest text-muted">Weekly Goal</h3>
        {progress.weeklyGoal ? (
          <p className="mt-2 text-sm">{progress.weeklyGoal}</p>
        ) : (
          <p className="mt-2 text-sm italic text-muted">
            No goal set yet — add one in Weekly Commitment below.
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xs uppercase tracking-widest text-muted">
          Check-ins this week ({weekActivity.length})
        </h3>
        {weekActivity.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {weekActivity.map(({ date, checkIn, studied }) => (
              <li key={date} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${studied ? "bg-success" : "bg-border"}`}
                />
                <span className="font-mono text-muted">{date}</span>
                {checkIn?.hours && (
                  <span className="text-xs text-accent">{checkIn.hours}h</span>
                )}
                {!checkIn && studied && (
                  <span className="text-xs text-muted">study day</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No check-ins recorded this calendar week.</p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-border/50 bg-background p-4">
        <h3 className="text-xs uppercase tracking-widest text-muted">Suggested Sunday Actions</h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
          {SUNDAY_ACTIONS.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
