"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getWeekProgress, getCalendarWeekCheckIns } from "@/lib/progress";
import type { ProgressState } from "@/lib/types";
import { getWeekPhase } from "@/lib/schedule";

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

  return (
    <Card className="mt-8">
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
