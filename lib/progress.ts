"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountCheckIn, ProgressState } from "./types";
import { DEFAULT_PROGRESS } from "./types";
import { dayKey } from "./daily-plans";
import { DAILY_BLOCKS } from "./schedule";
import {
  JOURNEY_MILESTONES,
  TOTAL_JOURNEY_DAYS,
  TOTAL_LAB_STEPS,
  getCurriculumPositionPercent,
  getMilestoneAtPosition,
  getMilestoneByModule,
  getNextMilestone,
} from "./journey";
import { getTotalModules } from "./curriculum";

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
    (week: number, day: number, moduleId?: string) => {
      const milestone = moduleId
        ? getMilestoneByModule(moduleId)
        : getMilestoneAtPosition(week, day);
      persist({
        ...progress,
        currentWeek: week,
        currentDay: day,
        currentModuleId: milestone?.moduleId ?? progress.currentModuleId,
      });
    },
    [progress, persist]
  );

  const jumpToMilestone = useCallback(
    (moduleId: string) => {
      const milestone = getMilestoneByModule(moduleId);
      if (!milestone) return;
      persist({
        ...progress,
        currentWeek: milestone.week,
        currentDay: milestone.day,
        currentModuleId: moduleId,
      });
    },
    [progress, persist]
  );

  const completeTour = useCallback(
    (tourId: string) => {
      if (progress.completedTours.includes(tourId)) return;
      persist({
        ...progress,
        completedTours: [...progress.completedTours, tourId],
      });
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
    jumpToMilestone,
    completeTour,
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
  return getOverallProgress(progress).overall;
}

export interface OverallProgress {
  overall: number;
  curriculum: number;
  modules: number;
  days: number;
  blocks: number;
  labs: number;
  drills: number;
  currentMilestone: (typeof JOURNEY_MILESTONES)[number];
  nextMilestone?: (typeof JOURNEY_MILESTONES)[number];
  completedModules: number;
  totalModules: number;
  completedDays: number;
  totalDays: number;
  completedBlocks: number;
  totalBlocks: number;
}

export function getTotalCompletedBlocks(completedBlocks: Record<string, string[]>): number {
  return Object.values(completedBlocks).reduce((sum, blocks) => sum + blocks.length, 0);
}

export function getOverallProgress(progress: ProgressState): OverallProgress {
  const totalModules = getTotalModules();
  const currentMilestone = getMilestoneAtPosition(progress.currentWeek, progress.currentDay);
  const nextMilestone = getNextMilestone(currentMilestone.moduleId);

  const curriculum = getCurriculumPositionPercent(progress.currentWeek, progress.currentDay);
  const modules = getProgressPercent(progress.completedModules, totalModules);
  const days = Math.round((progress.completedDays.length / TOTAL_JOURNEY_DAYS) * 100);

  const completedBlocks = getTotalCompletedBlocks(progress.completedBlocks);
  const totalBlocks = TOTAL_JOURNEY_DAYS * DAILY_BLOCKS.length;
  const blocks = Math.round((completedBlocks / totalBlocks) * 100);

  const labs = Math.round((progress.labSetupComplete.length / TOTAL_LAB_STEPS) * 100);
  const drills =
    progress.drillStats.totalAttempts > 0
      ? Math.round((progress.drillStats.totalCorrect / progress.drillStats.totalAttempts) * 100)
      : 0;

  const overall = Math.round(
    curriculum * 0.2 +
      modules * 0.25 +
      days * 0.2 +
      blocks * 0.2 +
      labs * 0.1 +
      drills * 0.05
  );

  return {
    overall,
    curriculum,
    modules,
    days,
    blocks,
    labs,
    drills,
    currentMilestone,
    nextMilestone,
    completedModules: progress.completedModules.length,
    totalModules,
    completedDays: progress.completedDays.length,
    totalDays: TOTAL_JOURNEY_DAYS,
    completedBlocks,
    totalBlocks,
  };
}
