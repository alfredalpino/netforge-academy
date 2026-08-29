"use client";

import Link from "next/link";
import { useProgress, getDayProgressPercent } from "@/lib/progress";
import { getDayPlan, getWeekPlans, dayKey } from "@/lib/daily-plans";
import { DAILY_BLOCKS, WEEKLY_RHYTHM, getWeekPhase, getDayOfWeek } from "@/lib/schedule";
import { getModule } from "@/lib/curriculum";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function TodayPage() {
  const {
    progress,
    completeDay,
    setCurrentPosition,
    isDayComplete,
    isBlockComplete,
    loaded,
  } = useProgress();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const plan = getDayPlan(progress.currentWeek, progress.currentDay);
  const weekPlans = getWeekPlans(progress.currentWeek);
  const phase = getWeekPhase(progress.currentWeek);
  const dayName = getDayOfWeek(progress.currentWeek, progress.currentDay);
  const weeklyFocus = WEEKLY_RHYTHM.find((d) => d.day === dayName);
  const dayProgress = getDayProgressPercent(
    progress.currentWeek,
    progress.currentDay,
    progress.completedBlocks
  );
  const moduleInfo = getModule(progress.currentModuleId);

  const incompleteBlocks = DAILY_BLOCKS.filter(
    (b) => !isBlockComplete(progress.currentWeek, progress.currentDay, b.id)
  ).length;

  const handleMarkDayComplete = async () => {
    if (incompleteBlocks > 0) {
      const ok = await confirm({
        title: "Mark day complete?",
        message: `${incompleteBlocks} of ${DAILY_BLOCKS.length} blocks are not marked complete. Continue anyway?`,
        confirmLabel: "Mark complete",
      });
      if (!ok) return;
    }
    completeDay(progress.currentWeek, progress.currentDay);
    showToast("Day marked complete");
  };

  if (!loaded) return <PageSkeleton />;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Daily Plan"
        title={`Week ${progress.currentWeek} · Day ${progress.currentDay} — ${dayName}`}
        description={phase}
      />
      <div className="mb-8 max-w-md">
        <ProgressBar value={dayProgress} label="Today's block progress" />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2" data-tour="today-nav">
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentPosition(
              progress.currentDay === 1 ? Math.max(1, progress.currentWeek - 1) : progress.currentWeek,
              progress.currentDay === 1 ? 7 : progress.currentDay - 1
            )
          }
        >
          ← Prev
        </Button>
        {weekPlans.map((d) => (
          <button
            key={dayKey(d.week, d.day)}
            onClick={() => setCurrentPosition(d.week, d.day)}
            className={`rounded-lg px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              d.day === progress.currentDay
                ? "bg-accent text-white"
                : isDayComplete(d.week, d.day)
                  ? "bg-success/15 text-success"
                  : "border border-border text-muted hover:bg-surface-hover"
            }`}
          >
            D{d.day}
          </button>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentPosition(
              progress.currentDay === 7 ? progress.currentWeek + 1 : progress.currentWeek,
              progress.currentDay === 7 ? 1 : progress.currentDay + 1
            )
          }
        >
          Next →
        </Button>
      </div>

      {weeklyFocus && (
        <Card className="mb-6 py-4">
          <p className="text-xs text-muted">{dayName} focus</p>
          <p className="font-medium">{weeklyFocus.focus}</p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted">
            {weeklyFocus.emphasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Card>
      )}

      {plan ? (
        <>
          <Card data-tour="today-plan" className="mb-8 border-accent/30">
            <h2 className="text-lg font-medium">{plan.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {plan.phase} · {plan.module}
            </p>
            {plan.gate && (
              <div className="mt-3">
                <Badge tone="warning">Gate: {plan.gate}</Badge>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { title: "Theory", items: plan.theory, block: "block-1" },
              { title: "Configuration", items: plan.config, block: "block-2" },
              { title: "Lab", items: [plan.lab], block: "block-3" },
              { title: "Break / Fix", items: plan.breakFix, block: "block-4" },
              { title: "Recall", items: plan.recall, block: "block-5" },
            ].map((section) =>
              section.items.length > 0 && section.items[0] !== "" ? (
                <Card key={section.title} className="py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{section.title}</h3>
                    {isBlockComplete(progress.currentWeek, progress.currentDay, section.block) && (
                      <Badge tone="success">Done</Badge>
                    )}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm leading-relaxed text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/focus">
              <Button>Open in Focus Mode</Button>
            </Link>
            {!isDayComplete(progress.currentWeek, progress.currentDay) && (
              <Button variant="success" onClick={handleMarkDayComplete}>
                Mark Day Complete
              </Button>
            )}
          </div>
        </>
      ) : (
        <Card className="mb-8 border-warning/30 bg-warning/5">
          <h2 className="text-lg font-medium text-warning">Module study mode</h2>
          <p className="mt-2 text-sm text-muted">
            Detailed day-by-day plans are available for weeks 1–6. For week {progress.currentWeek},
            study from the current curriculum module and use Focus Mode for your daily blocks.
          </p>
          {moduleInfo && (
            <Link
              href={`/curriculum/${moduleInfo.phase.id}`}
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Open {moduleInfo.module.title} in curriculum →
            </Link>
          )}
          <div className="mt-6">
            <Link href="/focus">
              <Button>Open in Focus Mode</Button>
            </Link>
          </div>
        </Card>
      )}

      <Card className="mt-12">
        <h3 className="mb-4 text-sm font-medium text-muted">Daily Schedule Template</h3>
        <div className="space-y-2">
          {DAILY_BLOCKS.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm"
            >
              <span className="w-24 shrink-0 font-mono text-xs text-muted">
                {b.start}–{b.end}
              </span>
              <span className="font-medium">{b.title}</span>
              <span className="hidden text-muted sm:inline">— {b.focus}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
