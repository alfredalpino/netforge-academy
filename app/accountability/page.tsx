"use client";

import { useState } from "react";
import { StreakCalendar } from "@/components/StreakCalendar";
import { ProgressTracker } from "@/components/ProgressTracker";
import { JourneyNavigator } from "@/components/JourneyNavigator";
import {
  useProgress,
  getWeekProgress,
  getTodayCheckIn,
  getAccountabilityScore,
  daysSinceStart,
} from "@/lib/progress";
import { getWeekPhase } from "@/lib/schedule";

export default function AccountabilityPage() {
  const {
    progress,
    loaded,
    setWeeklyGoal,
    recordCheckIn,
    setStartDate,
    resetProgress,
  } = useProgress();

  const today = new Date().toISOString().split("T")[0];
  const todayCheckIn = getTodayCheckIn(progress.checkIns);
  const weekStats = getWeekProgress(
    progress.currentWeek,
    progress.completedDays,
    progress.completedBlocks
  );
  const accountability = getAccountabilityScore(progress);
  const phase = getWeekPhase(progress.currentWeek);

  const [studied, setStudied] = useState(todayCheckIn?.studied ?? false);
  const [hours, setHours] = useState(todayCheckIn?.hours?.toString() ?? "");
  const [reflection, setReflection] = useState(todayCheckIn?.reflection ?? "");
  const [weeklyGoal, setWeeklyGoalLocal] = useState(progress.weeklyGoal);
  const [showReset, setShowReset] = useState(false);

  if (!loaded) {
    return <div className="p-8 text-muted">Loading...</div>;
  }

  const handleCheckIn = () => {
    recordCheckIn({
      studied,
      hours: hours ? parseFloat(hours) : undefined,
      reflection: reflection || undefined,
    });
  };

  const recentCheckIns = Object.entries(progress.checkIns)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent">Accountability</p>
        <h1 className="mt-1 text-2xl font-semibold">Streak & Progress Tracker</h1>
        <p className="mt-1 text-sm text-muted">
          Stay consistent — track streaks, check in daily, and review your commitment
        </p>
      </header>

      {/* Streak hero */}
      <section className="mb-8 rounded-xl border border-success/30 bg-success/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-success">Current Streak</p>
            <p className="mt-1 text-5xl font-bold text-success">
              {progress.streak}
              <span className="ml-2 text-lg font-normal text-muted">
                day{progress.streak !== 1 ? "s" : ""}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted">
              Longest: {progress.longestStreak} days · {progress.studyHistory.length} total study days
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Accountability Score</p>
            <p className="text-4xl font-bold text-accent">{accountability}%</p>
            <p className="mt-1 text-xs text-muted">
              Week {progress.currentWeek} · {phase}
            </p>
          </div>
        </div>
      </section>

      <ProgressTracker progress={progress} />

      <div className="mt-8">
        <JourneyNavigator compact />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Daily check-in */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium">Daily Check-In</h2>
          <p className="mt-1 text-xs text-muted">{today}</p>

          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={studied}
                onChange={(e) => setStudied(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-success"
              />
              <span className="text-sm">I studied today</span>
            </label>

            <div>
              <label className="text-xs text-muted">Hours studied</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 6"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted">Reflection (what did you learn?)</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Explain OSPF neighbor states from memory..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
              />
            </div>

            <button
              onClick={handleCheckIn}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
            >
              {todayCheckIn ? "Update Check-In" : "Submit Check-In"}
            </button>
          </div>
        </section>

        {/* Weekly goal */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium">Weekly Commitment</h2>
          <p className="mt-1 text-xs text-muted">
            Week {progress.currentWeek}: {weekStats.daysComplete}/7 days ·{" "}
            {weekStats.blocksComplete}/{weekStats.totalBlocks} blocks
          </p>

          <textarea
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoalLocal(e.target.value)}
            rows={3}
            placeholder="Complete Phase 1 subnetting module and pass 20 subnet drills in a row..."
            className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
          />
          <button
            onClick={() => setWeeklyGoal(weeklyGoal)}
            className="mt-3 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Save Weekly Goal
          </button>

          {progress.weeklyGoal && (
            <div className="mt-4 rounded-lg bg-accent/10 p-4">
              <p className="text-xs text-accent">Current goal</p>
              <p className="mt-1 text-sm">{progress.weeklyGoal}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-widest text-muted">Activity Heatmap</h3>
            <div className="mt-3">
              <StreakCalendar studyHistory={progress.studyHistory} weeks={8} />
            </div>
          </div>
        </section>
      </div>

      {/* Recent check-ins */}
      {recentCheckIns.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium">Recent Check-Ins</h2>
          <div className="mt-4 space-y-3">
            {recentCheckIns.map(([date, checkIn]) => (
              <div
                key={date}
                className="flex items-start gap-4 rounded-lg border border-border/50 px-4 py-3"
              >
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    checkIn.studied ? "bg-success" : "bg-border"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-muted">{date}</span>
                    {checkIn.hours && (
                      <span className="text-xs text-accent">{checkIn.hours}h</span>
                    )}
                  </div>
                  {checkIn.reflection && (
                    <p className="mt-1 text-sm text-muted">{checkIn.reflection}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Settings */}
      <section className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-medium">Settings</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-muted">Program start date</label>
            <input
              type="date"
              value={progress.startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <p className="text-xs text-muted">Days since start</p>
            <p className="mt-1 text-lg font-semibold">{daysSinceStart(progress.startDate)}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-xs text-warning hover:underline"
            >
              Reset all progress
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-warning">This cannot be undone.</p>
              <button
                onClick={() => {
                  resetProgress();
                  setShowReset(false);
                }}
                className="rounded-lg bg-warning/20 px-4 py-2 text-sm text-warning hover:bg-warning/30"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="text-sm text-muted hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
