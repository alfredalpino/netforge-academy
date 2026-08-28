"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountCheckIn, ProgressState } from "./types";
import { DEFAULT_PROGRESS } from "./types";
import { dayKey } from "./daily-plans";
import { DAILY_BLOCKS } from "./schedule";

const STORAGE_KEY = "netforge-progress";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86400000).toISOString().split("T")[0];
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress({ ...DEFAULT_PROGRESS, ...JSON.parse(stored) });
      }
    } catch {
      /* use defaults */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateStreak = useCallback((state: ProgressState): ProgressState => {
    const today = todayStr();
    const yesterday = yesterdayStr();
    if (state.lastStudyDate === today) return state;

    let streak = state.streak;
    if (state.lastStudyDate === yesterday) streak += 1;
    else streak = 1;

    const longestStreak = Math.max(state.longestStreak, streak);
    const studyHistory = state.studyHistory.includes(today)
      ? state.studyHistory
      : [...state.studyHistory, today];

    return { ...state, streak, longestStreak, lastStudyDate: today, studyHistory };
  }, []);

  const completeDay = useCallback(
    (week: number, day: number) => {
      const key = dayKey(week, day);
      if (progress.completedDays.includes(key)) return;
      const next = updateStreak({
        ...progress,
        completedDays: [...progress.completedDays, key],
      });
      persist(next);
    },
    [progress, persist, updateStreak]
  );

  const completeBlock = useCallback(
    (week: number, day: number, blockId: string) => {
      const key = dayKey(week, day);
      const existing = progress.completedBlocks[key] ?? [];
      if (existing.includes(blockId)) return;
      const next = updateStreak({
        ...progress,
        completedBlocks: {
          ...progress.completedBlocks,
          [key]: [...existing, blockId],
        },
      });
      persist(next);
    },
    [progress, persist, updateStreak]
  );

  const completeModule = useCallback(
    (moduleId: string) => {
      const isComplete = progress.completedModules.includes(moduleId);
      const next = isComplete
        ? {
            ...progress,
            completedModules: progress.completedModules.filter((id) => id !== moduleId),
          }
        : updateStreak({
            ...progress,
            completedModules: [...progress.completedModules, moduleId],
          });
      persist(next);
    },
    [progress, persist, updateStreak]
  );

  const setCurrentPosition = useCallback(
    (week: number, day: number) => {
      persist({ ...progress, currentWeek: week, currentDay: day });
    },
    [progress, persist]
  );

  const setStartDate = useCallback(
    (date: string) => {
      persist({ ...progress, startDate: date });
    },
    [progress, persist]
  );

  const setWeeklyGoal = useCallback(
    (goal: string) => {
      persist({ ...progress, weeklyGoal: goal });
    },
    [progress, persist]
  );

  const recordCheckIn = useCallback(
    (checkIn: AccountCheckIn) => {
      const today = todayStr();
      const next = checkIn.studied
        ? updateStreak({
            ...progress,
            checkIns: { ...progress.checkIns, [today]: checkIn },
          })
        : {
            ...progress,
            checkIns: { ...progress.checkIns, [today]: checkIn },
          };
      persist(next);
    },
    [progress, persist, updateStreak]
  );

  const setNote = useCallback(
    (key: string, note: string) => {
      persist({ ...progress, notes: { ...progress.notes, [key]: note } });
    },
    [progress, persist]
  );

  const recordDrillResult = useCallback(
    (correct: boolean, currentStreak: number) => {
      const stats = progress.drillStats;
      const next = {
        ...progress,
        drillStats: {
          bestStreak: Math.max(stats.bestStreak, correct ? currentStreak : stats.bestStreak),
          totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
          totalAttempts: stats.totalAttempts + 1,
        },
      };
      persist(next);
    },
    [progress, persist]
  );

  const toggleLabSetup = useCallback(
    (stepId: string) => {
      const done = progress.labSetupComplete.includes(stepId);
      const next = {
        ...progress,
        labSetupComplete: done
          ? progress.labSetupComplete.filter((id) => id !== stepId)
          : [...progress.labSetupComplete, stepId],
      };
      persist(next);
    },
    [progress, persist]
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  const isDayComplete = (week: number, day: number) =>
    progress.completedDays.includes(dayKey(week, day));

  const isBlockComplete = (week: number, day: number, blockId: string) =>
    (progress.completedBlocks[dayKey(week, day)] ?? []).includes(blockId);

  const isModuleComplete = (moduleId: string) =>
    progress.completedModules.includes(moduleId);

  return {
    progress,
    loaded,
    completeDay,
    completeBlock,
    completeModule,
    setCurrentPosition,
    setStartDate,
    setWeeklyGoal,
    recordCheckIn,
    setNote,
    recordDrillResult,
    toggleLabSetup,
    resetProgress,
    isDayComplete,
    isBlockComplete,
    isModuleComplete,
  };
}

export function getProgressPercent(completedModules: string[], totalModules: number): number {
  if (totalModules === 0) return 0;
  return Math.round((completedModules.length / totalModules) * 100);
}

export function getDayProgressPercent(
  week: number,
  day: number,
  completedBlocks: Record<string, string[]>,
  totalBlocks: number = DAILY_BLOCKS.length
): number {
  const key = dayKey(week, day);
  const done = (completedBlocks[key] ?? []).length;
  return Math.round((done / totalBlocks) * 100);
}

export function getWeekProgress(
  week: number,
  completedDays: string[],
  completedBlocks: Record<string, string[]>
): { daysComplete: number; blocksComplete: number; totalBlocks: number } {
  let daysComplete = 0;
  let blocksComplete = 0;
  for (let d = 1; d <= 7; d++) {
    const key = dayKey(week, d);
    if (completedDays.includes(key)) daysComplete++;
    blocksComplete += (completedBlocks[key] ?? []).length;
  }
  return { daysComplete, blocksComplete, totalBlocks: 7 * DAILY_BLOCKS.length };
}

export function getStudyHeatmapData(
  studyHistory: string[],
  weeks: number = 12
): { date: string; level: number }[] {
  const counts = new Map<string, number>();
  for (const date of studyHistory) {
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const result: { date: string; level: number }[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7 + 1);

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split("T")[0];
    const count = counts.get(date) ?? 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
    result.push({ date, level });
  }
  return result;
}

export function getTodayCheckIn(
  checkIns: Record<string, AccountCheckIn>
): AccountCheckIn | undefined {
  return checkIns[todayStr()];
}

export function daysSinceStart(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

export function getAccountabilityScore(progress: ProgressState): number {
  const daysStudied = progress.studyHistory.length;
  const elapsed = Math.max(1, daysSinceStart(progress.startDate));
  const consistency = Math.round((daysStudied / elapsed) * 100);
  const modulePct = getProgressPercent(progress.completedModules, 24);
  const dayPct = Math.round((progress.completedDays.length / 28) * 100);
  return Math.round(consistency * 0.4 + modulePct * 0.3 + dayPct * 0.3);
}
