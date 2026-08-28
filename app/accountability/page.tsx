"use client";

import { useRef, useState } from "react";
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
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function AccountabilityPage() {
  const {
    progress,
    loaded,
    setWeeklyGoal,
    recordCheckIn,
    setStartDate,
    resetProgress,
    exportProgress,
    importProgress,
  } = useProgress();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!loaded) return <PageSkeleton />;

  const handleCheckIn = () => {
    recordCheckIn({
      studied,
      hours: hours ? parseFloat(hours) : undefined,
      reflection: reflection || undefined,
    });
    showToast(todayCheckIn ? "Check-in updated" : "Check-in saved");
  };

  const handleExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `netforge-progress-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Progress exported");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const ok = await confirm({
        title: "Import progress?",
        message: "This will replace your current progress with the imported file.",
        confirmLabel: "Import",
        tone: "danger",
      });
      if (!ok) return;

      const result = importProgress(data);
      if (result.success) {
        showToast("Progress imported successfully");
        window.location.reload();
      } else {
        showToast(result.error ?? "Import failed", "error");
      }
    } catch {
      showToast("Invalid progress file", "error");
    } finally {
      event.target.value = "";
    }
  };

  const recentCheckIns = Object.entries(progress.checkIns)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Accountability"
        title="Streak & Progress Tracker"
        description="Stay consistent — track streaks, check in daily, and review your commitment."
        actions={
          progress.streak > 0 ? (
            <Badge tone="success">{progress.streak} day streak</Badge>
          ) : undefined
        }
      />

      <Card className="mb-8 border-success/30 bg-success/5">
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
      </Card>

      <ProgressTracker progress={progress} />

      <div className="mt-8">
        <JourneyNavigator compact />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-medium">Daily Check-In</h2>
          <p className="mt-1 text-xs text-muted">{today}</p>

          <div className="mt-4 space-y-4">
            <label htmlFor="studied-today" className="flex items-center gap-3">
              <input
                id="studied-today"
                type="checkbox"
                checked={studied}
                onChange={(e) => setStudied(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-success"
              />
              <span className="text-sm">I studied today</span>
            </label>

            <Input
              id="hours-studied"
              label="Hours studied"
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 6"
            />

            <div>
              <label htmlFor="reflection" className="text-xs text-muted">
                Reflection (what did you learn?)
              </label>
              <textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
                placeholder="Explain OSPF neighbor states from memory..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            <Button onClick={handleCheckIn}>
              {todayCheckIn ? "Update Check-In" : "Submit Check-In"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-medium">Weekly Commitment</h2>
          <p className="mt-1 text-xs text-muted">
            Week {progress.currentWeek}: {weekStats.daysComplete}/7 days ·{" "}
            {weekStats.blocksComplete}/{weekStats.totalBlocks} blocks
          </p>

          <label htmlFor="weekly-goal" className="sr-only">
            Weekly goal
          </label>
          <textarea
            id="weekly-goal"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoalLocal(e.target.value)}
            rows={3}
            placeholder="Complete Phase 1 subnetting module and pass 20 subnet drills in a row..."
            className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setWeeklyGoal(weeklyGoal);
              showToast("Weekly goal saved");
            }}
          >
            Save Weekly Goal
          </Button>

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
        </Card>
      </div>

      {recentCheckIns.length > 0 && (
        <Card className="mt-8">
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
        </Card>
      )}

      <Card className="mt-8">
        <h2 className="text-sm font-medium">Settings & Backup</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Input
            id="start-date"
            label="Program start date"
            type="date"
            value={progress.startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              showToast("Start date updated");
            }}
          />
          <div>
            <p className="text-xs text-muted">Days since start</p>
            <p className="mt-1 text-lg font-semibold">{daysSinceStart(progress.startDate)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
          <Button variant="secondary" onClick={handleExport}>
            Export Progress
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import Progress
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirm({
                title: "Reset all progress?",
                message: "This cannot be undone. Export a backup first if you need one.",
                confirmLabel: "Reset everything",
                tone: "danger",
              });
              if (ok) {
                resetProgress();
                showToast("Progress reset", "warning");
                window.location.reload();
              }
            }}
          >
            Reset all progress
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
