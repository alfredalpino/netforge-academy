"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useProgress, getDayProgressPercent } from "@/lib/progress";
import { getDayPlan, getWeekPlans, dayKey } from "@/lib/daily-plans";
import { DAILY_BLOCKS, WEEKLY_RHYTHM, getWeekPhase, getDayOfWeek } from "@/lib/schedule";
import { getModule } from "@/lib/curriculum";
import {
  getModuleAcademyResources,
  getSimulatorLabHref,
} from "@/lib/academy-resources";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AcademyPracticeSection } from "@/components/AcademyPracticeSection";
import { TodayShortcutsHelp } from "@/components/TodayShortcutsHelp";
import { useTodayKeyboard } from "@/hooks/useTodayKeyboard";

const PLAN_SECTIONS = [
  { title: "Theory", itemsKey: "theory" as const, block: "block-1" },
  { title: "Configuration", itemsKey: "config" as const, block: "block-2" },
  { title: "Lab", itemsKey: "lab" as const, block: "block-3" },
  { title: "Break / Fix", itemsKey: "breakFix" as const, block: "block-4" },
  { title: "Recall", itemsKey: "recall" as const, block: "block-5" },
];

export default function TodayPage() {
  const {
    progress,
    completeDay,
    completeBlock,
    setCurrentPosition,
    isDayComplete,
    isBlockComplete,
    loaded,
  } = useProgress();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);

  const goPrevDay = useCallback(() => {
    setCurrentPosition(
      progress.currentDay === 1 ? Math.max(1, progress.currentWeek - 1) : progress.currentWeek,
      progress.currentDay === 1 ? 7 : progress.currentDay - 1,
    );
  }, [progress.currentDay, progress.currentWeek, setCurrentPosition]);

  const goNextDay = useCallback(() => {
    setCurrentPosition(
      progress.currentDay === 7 ? progress.currentWeek + 1 : progress.currentWeek,
      progress.currentDay === 7 ? 1 : progress.currentDay + 1,
    );
  }, [progress.currentDay, progress.currentWeek, setCurrentPosition]);

  const markBlockByIndex = useCallback(
    (index: number) => {
      const block = DAILY_BLOCKS[index];
      if (!block) return;
      if (isBlockComplete(progress.currentWeek, progress.currentDay, block.id)) {
        showToast(`${block.title} already complete`, "warning");
        return;
      }
      completeBlock(progress.currentWeek, progress.currentDay, block.id);
      showToast(`${block.title} marked complete`);
    },
    [
      completeBlock,
      isBlockComplete,
      progress.currentDay,
      progress.currentWeek,
      showToast,
    ],
  );

  useTodayKeyboard({
    helpOpen,
    onShowHelp: () => setHelpOpen(true),
    onHideHelp: () => setHelpOpen(false),
    onPrevDay: goPrevDay,
    onNextDay: goNextDay,
    onCompleteBlock: markBlockByIndex,
  });

  const plan = getDayPlan(progress.currentWeek, progress.currentDay);
  const weekPlans = getWeekPlans(progress.currentWeek);
  const phase = getWeekPhase(progress.currentWeek);
  const dayName = getDayOfWeek(progress.currentWeek, progress.currentDay);
  const weeklyEmphasis = WEEKLY_RHYTHM.find((d) => d.day === dayName);
  const dayProgress = getDayProgressPercent(
    progress.currentWeek,
    progress.currentDay,
    progress.completedBlocks
  );
  const moduleInfo = getModule(progress.currentModuleId);
  const resources = getModuleAcademyResources(progress.currentModuleId);

  const incompleteBlocks = DAILY_BLOCKS.filter(
    (b) => !isBlockComplete(progress.currentWeek, progress.currentDay, b.id)
  ).length;

  const firstIncomplete = DAILY_BLOCKS.find(
    (b) => !isBlockComplete(progress.currentWeek, progress.currentDay, b.id),
  );

  const handleMarkBlock = (blockId: string, title: string) => {
    if (isBlockComplete(progress.currentWeek, progress.currentDay, blockId)) {
      showToast(`${title} already complete`, "warning");
      return;
    }
    completeBlock(progress.currentWeek, progress.currentDay, blockId);
    showToast(`${title} marked complete`);
  };

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

  const startHref = resources.topic
    ? `/topics/${resources.topic.slug}`
    : resources.simulatorLab
      ? getSimulatorLabHref(resources.simulatorLab.id)
      : "/drills";
  const startLabel = resources.topic
    ? `Start · ${resources.topic.title}`
    : resources.simulatorLab
      ? `Start · ${resources.simulatorLab.title}`
      : "Start · Drills";

  return (
    <PageShell testId="today-page">
      <TodayShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <PageHeader
        eyebrow="Daily Plan"
        title={`Week ${progress.currentWeek} · Day ${progress.currentDay} — ${dayName}`}
        description={phase}
        actions={
          <button
            type="button"
            data-testid="today-shortcuts-trigger"
            onClick={() => setHelpOpen(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Keyboard shortcuts"
          >
            ? Shortcuts
          </button>
        }
      />
      <div className="mb-8 max-w-md">
        <ProgressBar value={dayProgress} label="Today's block progress" />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2" data-tour="today-nav">
        <Button variant="secondary" onClick={goPrevDay}>
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
        <Button variant="secondary" onClick={goNextDay}>
          Next →
        </Button>
      </div>

      {plan ? (
        <Card data-tour="today-plan" className="mb-6 border-accent/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">{plan.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {plan.phase} · {plan.module}
              </p>
              {weeklyEmphasis && (
                <p className="mt-2 text-sm text-muted">
                  <span className="text-foreground/80">Today&apos;s emphasis: </span>
                  {weeklyEmphasis.focus}
                </p>
              )}
              {plan.gate && (
                <div className="mt-3">
                  <Badge tone="warning">Gate: {plan.gate}</Badge>
                </div>
              )}
            </div>
            {firstIncomplete && (
              <Link href={startHref}>
                <Button data-testid="today-start-action">{startLabel}</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <Card className="mb-6 border-warning/30 bg-warning/5">
          <h2 className="text-lg font-medium text-warning">Module study mode</h2>
          <p className="mt-2 text-sm text-muted">
            Detailed day-by-day plans are available for weeks 1–28. For week {progress.currentWeek},
            study from the current curriculum module.
          </p>
          {moduleInfo && (
            <Link
              href={`/curriculum/${moduleInfo.phase.id}`}
              className="mt-4 inline-block text-sm text-accent hover:underline"
            >
              Open {moduleInfo.module.title} in curriculum →
            </Link>
          )}
        </Card>
      )}

      <AcademyPracticeSection variant="today" />

      {plan && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {PLAN_SECTIONS.map((section) => {
              const raw =
                section.itemsKey === "lab" ? [plan.lab] : plan[section.itemsKey];
              const items = raw.filter((item) => item !== "");
              if (items.length === 0) return null;
              const done = isBlockComplete(
                progress.currentWeek,
                progress.currentDay,
                section.block,
              );
              return (
                <Card key={section.title} className="py-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium">{section.title}</h3>
                    {done && <Badge tone="success">Done</Badge>}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-sm leading-relaxed text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                  {!done && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-4"
                      data-testid={`mark-block-${section.block}`}
                      onClick={() => handleMarkBlock(section.block, section.title)}
                    >
                      Mark complete
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>

          {!isDayComplete(progress.currentWeek, progress.currentDay) && (
            <div className="mt-8">
              <Button variant="success" onClick={handleMarkDayComplete}>
                Mark Day Complete
              </Button>
            </div>
          )}
        </>
      )}

      <details className="mt-12 rounded-xl border border-border bg-surface/60 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-muted">
          Daily schedule template (optional)
        </summary>
        <div className="mt-4 space-y-2 pb-2">
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
      </details>
    </PageShell>
  );
}
