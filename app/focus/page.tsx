"use client";

import { useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { getFocusStudyContent } from "@/lib/focus-content";
import { DAILY_BLOCKS } from "@/lib/schedule";
import { dayKey } from "@/lib/daily-plans";
import { usePomodoro } from "@/hooks/usePomodoro";
import { PomodoroBubble } from "@/components/PomodoroBubble";
import { PomodoroSettingsPanel } from "@/components/PomodoroSettingsPanel";
import { StudyMaterial } from "@/components/StudyMaterial";
import { getPhaseLabel } from "@/lib/pomodoro";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getModule } from "@/lib/curriculum";

export default function FocusPage() {
  const {
    progress,
    completeBlock,
    isBlockComplete,
    toggleFocusChecklist,
    loaded,
  } = useProgress();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const pomodoro = usePomodoro();

  const [activeBlockId, setActiveBlockId] = useState(DAILY_BLOCKS[0].id);
  const [showSetup, setShowSetup] = useState(true);

  const content = getFocusStudyContent(
    progress.currentWeek,
    progress.currentDay,
    progress.currentModuleId
  );

  const checklistKey = (blockId: string, idx: number) =>
    `${dayKey(progress.currentWeek, progress.currentDay)}-${blockId}-${idx}`;

  const toggleCheck = (blockId: string, idx: number) => {
    toggleFocusChecklist(checklistKey(blockId, idx));
  };

  const checklistForView = Object.fromEntries(
    Object.entries(progress.focusChecklists).filter(([key]) =>
      key.startsWith(dayKey(progress.currentWeek, progress.currentDay))
    )
  );

  const handleBlockChange = (blockId: string) => {
    setActiveBlockId(blockId);
  };

  const handleStart = () => {
    setShowSetup(false);
    pomodoro.startSession();
  };

  const handleEnd = async () => {
    const ok = await confirm({
      title: "End focus session?",
      message: "The Pomodoro timer will stop. Your checklist progress is saved.",
      confirmLabel: "End session",
      tone: "danger",
    });
    if (ok) {
      pomodoro.endSession();
      setShowSetup(true);
    }
  };

  const isBlockDone = (blockId: string) =>
    isBlockComplete(progress.currentWeek, progress.currentDay, blockId);

  const handleMarkBlockComplete = (blockId: string) => {
    completeBlock(progress.currentWeek, progress.currentDay, blockId);
    showToast("Block marked complete");
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-focus-bg">
        <PageSkeleton />
      </div>
    );
  }

  const isBreak =
    pomodoro.phase === "short_break" || pomodoro.phase === "long_break";
  const moduleInfo = getModule(progress.currentModuleId);

  return (
    <div className={`focus-mode min-h-screen bg-focus-bg ${isBreak ? "focus-break-mode" : ""}`}>
      <header className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Focus Mode</Badge>
            {pomodoro.sessionActive && (
              <Badge tone="accent">{getPhaseLabel(pomodoro.phase)}</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground/80">
            W{progress.currentWeek} D{progress.currentDay} — {content.dayTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pomodoro.sessionActive && (
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => setShowSetup((s) => !s)}
            >
              {showSetup ? "Hide setup" : "Timer settings"}
            </Button>
          )}
          {pomodoro.sessionActive ? (
            <Button variant="ghost" className="text-xs text-warning" onClick={handleEnd}>
              End session
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" className="text-xs">
                Exit Focus
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {!content.hasDayPlan && (
          <Card className="mb-6 border-warning/30 bg-warning/10">
            <p className="font-medium text-warning">Module study mode</p>
            <p className="mt-1 text-sm text-muted">
              Detailed day plans cover weeks 1–4 only. You&apos;re studying from the{" "}
              <Link
                href={`/curriculum/${moduleInfo?.phase.id ?? "phase-0"}`}
                className="text-accent hover:underline"
              >
                {content.module}
              </Link>{" "}
              module until day plans are added.
            </p>
          </Card>
        )}

        {(!pomodoro.sessionActive || showSetup) && (
          <Card className="mb-8">
            <h2 className="text-sm font-medium">Pomodoro Timer</h2>
            <p className="mt-1 text-xs text-muted">
              Choose your intervals, then start — timer moves to a draggable bubble and your tab title.
            </p>
            <div className="mt-4">
              <PomodoroSettingsPanel
                presetId={pomodoro.presetId}
                settings={pomodoro.settings}
                onChange={pomodoro.updateSettings}
                disabled={pomodoro.sessionActive && pomodoro.running}
              />
            </div>
            {!pomodoro.sessionActive && (
              <Button
                onClick={handleStart}
                data-tour="focus-timer"
                className="mt-6 w-full sm:w-auto sm:px-10"
              >
                Start Focus Session
              </Button>
            )}
          </Card>
        )}

        {pomodoro.sessionActive && isBreak && (
          <Card className="mb-6 border-success/30 bg-success/10 text-center">
            <p className="text-sm font-medium text-success">
              {pomodoro.phase === "long_break" ? "Long break time" : "Short break — stretch, hydrate"}
            </p>
            <p className="mt-1 text-xs text-muted">
              Session {pomodoro.completedSessions} complete. Use bubble controls to pause or skip.
            </p>
          </Card>
        )}

        <StudyMaterial
          content={content}
          activeBlockId={activeBlockId}
          onBlockChange={handleBlockChange}
          checklist={checklistForView}
          checklistKey={checklistKey}
          onToggleCheck={toggleCheck}
          isBlockComplete={isBlockDone}
          onMarkBlockComplete={handleMarkBlockComplete}
        />

        <p className="mt-12 text-center text-xs text-muted/50">
          No social media. No videos. Study the material, run labs locally.
        </p>
      </div>

      <PomodoroBubble
        visible={pomodoro.sessionActive}
        secondsLeft={pomodoro.secondsLeft}
        progress={pomodoro.progress}
        phase={pomodoro.phase}
        running={pomodoro.running}
        completedSessions={pomodoro.completedSessions}
        sessionsBeforeLongBreak={pomodoro.settings.sessionsBeforeLongBreak}
        onToggle={pomodoro.toggle}
        onSkip={pomodoro.skipPhase}
        onReset={pomodoro.resetPhase}
      />
    </div>
  );
}
