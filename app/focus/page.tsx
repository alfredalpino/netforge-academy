"use client";

import { useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { getFocusStudyContent } from "@/lib/focus-content";
import { DAILY_BLOCKS } from "@/lib/schedule";
import { usePomodoro } from "@/hooks/usePomodoro";
import { PomodoroBubble } from "@/components/PomodoroBubble";
import { PomodoroSettingsPanel } from "@/components/PomodoroSettingsPanel";
import { StudyMaterial } from "@/components/StudyMaterial";
import { getPhaseLabel } from "@/lib/pomodoro";

export default function FocusPage() {
  const { progress, completeBlock, isBlockComplete, loaded } = useProgress();
  const pomodoro = usePomodoro();

  const [activeBlockId, setActiveBlockId] = useState(DAILY_BLOCKS[0].id);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showSetup, setShowSetup] = useState(true);

  const content = getFocusStudyContent(
    progress.currentWeek,
    progress.currentDay,
    progress.currentModuleId,
    activeBlockId
  );

  const toggleCheck = (blockId: string, idx: number) => {
    const key = `${blockId}-${idx}`;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBlockChange = (blockId: string) => {
    setActiveBlockId(blockId);
  };

  const handleStart = () => {
    setShowSetup(false);
    pomodoro.startSession();
  };

  const handleEnd = () => {
    if (confirm("End focus session? Timer will stop.")) {
      pomodoro.endSession();
      setShowSetup(true);
    }
  };

  const isBlockDone = (blockId: string) =>
    isBlockComplete(progress.currentWeek, progress.currentDay, blockId);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-focus-bg text-muted">
        Loading...
      </div>
    );
  }

  const isBreak =
    pomodoro.phase === "short_break" || pomodoro.phase === "long_break";

  return (
    <div className={`focus-mode min-h-screen bg-focus-bg ${isBreak ? "focus-break-mode" : ""}`}>
      {/* Minimal header */}
      <header className="flex items-center justify-between border-b border-border/40 px-6 py-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Focus Mode
            {pomodoro.sessionActive && (
              <span className="ml-2 text-accent">· {getPhaseLabel(pomodoro.phase)}</span>
            )}
          </span>
          <p className="text-sm text-foreground/80">
            W{progress.currentWeek} D{progress.currentDay} — {content.dayTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pomodoro.sessionActive && (
            <button
              onClick={() => setShowSetup((s) => !s)}
              className="text-xs text-muted hover:text-foreground"
            >
              {showSetup ? "Hide setup" : "Timer settings"}
            </button>
          )}
          {pomodoro.sessionActive ? (
            <button onClick={handleEnd} className="text-xs text-warning hover:underline">
              End session
            </button>
          ) : (
            <Link href="/" className="text-xs text-muted hover:text-foreground">
              Exit Focus
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Setup panel — before start or toggled during session */}
        {(!pomodoro.sessionActive || showSetup) && (
          <section className="mb-8 rounded-xl border border-border bg-surface p-6">
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
              <button
                onClick={handleStart}
                data-tour="focus-timer"
                className="mt-6 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white hover:bg-accent-dim sm:w-auto sm:px-10"
              >
                Start Focus Session
              </button>
            )}
          </section>
        )}

        {/* Break banner */}
        {pomodoro.sessionActive && isBreak && (
          <div className="mb-6 rounded-xl border border-success/30 bg-success/10 px-6 py-4 text-center">
            <p className="text-sm font-medium text-success">
              {pomodoro.phase === "long_break" ? "Long break time" : "Short break — stretch, hydrate"}
            </p>
            <p className="mt-1 text-xs text-muted">
              Session {pomodoro.completedSessions} complete. Bubble timer in corner — hover for controls.
            </p>
          </div>
        )}

        {/* Study material — always visible, primary content */}
        <StudyMaterial
          content={content}
          activeBlockId={activeBlockId}
          onBlockChange={handleBlockChange}
          checklist={checklist}
          onToggleCheck={toggleCheck}
          isBlockComplete={isBlockDone}
          onMarkBlockComplete={(blockId) =>
            completeBlock(progress.currentWeek, progress.currentDay, blockId)
          }
        />

        <p className="mt-12 text-center text-xs text-muted/50">
          No social media. No videos. Study the material, run labs locally.
        </p>
      </div>

      {/* Floating draggable Pomodoro bubble */}
      <PomodoroBubble
        visible={pomodoro.sessionActive}
        secondsLeft={pomodoro.secondsLeft}
        totalSeconds={pomodoro.totalSeconds}
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
