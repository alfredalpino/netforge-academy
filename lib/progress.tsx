"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AccountCheckIn, ProgressState } from "./types";
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
import { validateProgressImport } from "./progress-schema";
import {
  clearProgressStorage,
  getProgressServerSnapshot,
  getProgressSnapshot,
  importProgressState,
  persistProgressState,
  subscribeProgress,
  type PersistResult,
} from "./progress-storage";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86400000).toISOString().split("T")[0];
}

interface ProgressContextValue {
  progress: ProgressState;
  loaded: boolean;
  lastPersistError: PersistResult | null;
  completeDay: (week: number, day: number) => void;
  completeBlock: (week: number, day: number, blockId: string) => void;
  completeModule: (moduleId: string) => void;
  setCurrentPosition: (week: number, day: number, moduleId?: string) => void;
  jumpToMilestone: (moduleId: string) => void;
  completeTour: (tourId: string) => void;
  setStartDate: (date: string) => void;
  setWeeklyGoal: (goal: string) => void;
  recordCheckIn: (checkIn: AccountCheckIn) => void;
  setLastBackupDate: (date: string) => void;
  setNote: (key: string, note: string) => void;
  recordDrillResult: (correct: boolean, currentStreak: number, timeSeconds?: number) => void;
  toggleLabSetup: (stepId: string) => void;
  recordSimulatorLabPass: (labId: string) => void;
  importProgress: (data: unknown) => { success: boolean; error?: string };
  exportProgress: () => string;
  resetProgress: () => void;
  isDayComplete: (week: number, day: number) => boolean;
  isBlockComplete: (week: number, day: number, blockId: string) => boolean;
  isModuleComplete: (moduleId: string) => boolean;
  isSimulatorLabComplete: (labId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const progress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot
  );
  const loaded = useSyncExternalStore(
    subscribeProgress,
    () => typeof window !== "undefined",
    () => false
  );

  const persist = useCallback((next: ProgressState): PersistResult => {
    return persistProgressState(next);
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
      persist(
        updateStreak({
          ...progress,
          completedDays: [...progress.completedDays, key],
        })
      );
    },
    [progress, persist, updateStreak]
  );

  const completeBlock = useCallback(
    (week: number, day: number, blockId: string) => {
      const key = dayKey(week, day);
      const existing = progress.completedBlocks[key] ?? [];
      if (existing.includes(blockId)) return;
      persist(
        updateStreak({
          ...progress,
          completedBlocks: {
            ...progress.completedBlocks,
            [key]: [...existing, blockId],
          },
        })
      );
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
      persist({ ...progress, weeklyGoal: goal.slice(0, 500) });
    },
    [progress, persist]
  );

  const setLastBackupDate = useCallback(
    (date: string) => {
      persist({ ...progress, lastBackupDate: date });
    },
    [progress, persist]
  );

  const recordCheckIn = useCallback(
    (checkIn: AccountCheckIn) => {
      const today = todayStr();
      const sanitized: AccountCheckIn = {
        studied: checkIn.studied,
        hours: checkIn.hours,
        reflection: checkIn.reflection?.slice(0, 2000),
      };
      const next = sanitized.studied
        ? updateStreak({
            ...progress,
            checkIns: { ...progress.checkIns, [today]: sanitized },
          })
        : {
            ...progress,
            checkIns: { ...progress.checkIns, [today]: sanitized },
          };
      persist(next);
    },
    [progress, persist, updateStreak]
  );

  const setNote = useCallback(
    (key: string, note: string) => {
      persist({ ...progress, notes: { ...progress.notes, [key]: note.slice(0, 5000) } });
    },
    [progress, persist]
  );

  const recordDrillResult = useCallback(
    (correct: boolean, currentStreak: number, timeSeconds?: number) => {
      const stats = progress.drillStats;
      const totalAttempts = stats.totalAttempts + 1;
      const totalTimeSeconds = (stats.totalTimeSeconds ?? 0) + (timeSeconds ?? 0);
      const timedAttempts =
        timeSeconds !== undefined
          ? (stats.totalAttempts > 0 && stats.totalTimeSeconds !== undefined
              ? stats.totalAttempts
              : 0) + 1
          : stats.totalAttempts;

      persist({
        ...progress,
        drillStats: {
          bestStreak: Math.max(stats.bestStreak, correct ? currentStreak : stats.bestStreak),
          totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
          totalAttempts,
          totalTimeSeconds: timeSeconds !== undefined ? totalTimeSeconds : stats.totalTimeSeconds,
          averageSeconds:
            timeSeconds !== undefined && timedAttempts > 0
              ? totalTimeSeconds / timedAttempts
              : stats.averageSeconds,
        },
      });
    },
    [progress, persist]
  );

  const toggleLabSetup = useCallback(
    (stepId: string) => {
      const done = progress.labSetupComplete.includes(stepId);
      persist({
        ...progress,
        labSetupComplete: done
          ? progress.labSetupComplete.filter((id) => id !== stepId)
          : [...progress.labSetupComplete, stepId],
      });
    },
    [progress, persist]
  );

  const recordSimulatorLabPass = useCallback(
    (labId: string) => {
      if (progress.completedSimulatorLabs.includes(labId)) return;
      persist(
        updateStreak({
          ...progress,
          completedSimulatorLabs: [...progress.completedSimulatorLabs, labId],
        })
      );
    },
    [progress, persist, updateStreak]
  );

  const importProgress = useCallback((data: unknown) => {
    const result = validateProgressImport(data);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const persistResult = importProgressState(result.data);
    if (!persistResult.ok) {
      return { success: false, error: "Failed to save imported progress." };
    }
    return { success: true };
  }, []);

  const exportProgress = useCallback(() => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  const resetProgress = useCallback(() => {
    clearProgressStorage();
  }, []);

  const isDayComplete = useCallback(
    (week: number, day: number) => progress.completedDays.includes(dayKey(week, day)),
    [progress.completedDays]
  );

  const isBlockComplete = useCallback(
    (week: number, day: number, blockId: string) =>
      (progress.completedBlocks[dayKey(week, day)] ?? []).includes(blockId),
    [progress.completedBlocks]
  );

  const isModuleComplete = useCallback(
    (moduleId: string) => progress.completedModules.includes(moduleId),
    [progress.completedModules]
  );

  const isSimulatorLabComplete = useCallback(
    (labId: string) => progress.completedSimulatorLabs.includes(labId),
    [progress.completedSimulatorLabs]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      loaded,
      lastPersistError: null,
      completeDay,
      completeBlock,
      completeModule,
      setCurrentPosition,
      jumpToMilestone,
      completeTour,
      setStartDate,
      setWeeklyGoal,
      recordCheckIn,
      setLastBackupDate,
      setNote,
      recordDrillResult,
      toggleLabSetup,
      recordSimulatorLabPass,
      importProgress,
      exportProgress,
      resetProgress,
      isDayComplete,
      isBlockComplete,
      isModuleComplete,
      isSimulatorLabComplete,
    }),
    [
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
      setLastBackupDate,
      setNote,
      recordDrillResult,
      toggleLabSetup,
      recordSimulatorLabPass,
      importProgress,
      exportProgress,
      resetProgress,
      isDayComplete,
      isBlockComplete,
      isModuleComplete,
      isSimulatorLabComplete,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within ProgressProvider");
  }
  return ctx;
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

export function getCalendarWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export interface CalendarWeekActivity {
  date: string;
  checkIn?: AccountCheckIn;
  studied: boolean;
}

export function getCalendarWeekCheckIns(
  checkIns: Record<string, AccountCheckIn>,
  studyHistory: string[]
): CalendarWeekActivity[] {
  const { start, end } = getCalendarWeekRange();
  const dates = new Set<string>();

  for (const date of Object.keys(checkIns)) {
    if (isDateInRange(date, start, end)) dates.add(date);
  }
  for (const date of studyHistory) {
    if (isDateInRange(date, start, end)) dates.add(date);
  }

  return Array.from(dates)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({
      date,
      checkIn: checkIns[date],
      studied: checkIns[date]?.studied ?? studyHistory.includes(date),
    }));
}

export function daysSinceBackup(lastBackupDate: string): number {
  if (!lastBackupDate) return Number.POSITIVE_INFINITY;
  const backup = new Date(lastBackupDate);
  const today = new Date();
  return Math.max(0, Math.floor((today.getTime() - backup.getTime()) / 86400000));
}

export function needsBackupReminder(lastBackupDate: string): boolean {
  if (!lastBackupDate) return true;
  return daysSinceBackup(lastBackupDate) >= 7;
}

export function formatImportPreview(data: ProgressState): string {
  return [
    `Position: Week ${data.currentWeek}, Day ${data.currentDay}`,
    `Streak: ${data.streak} day${data.streak !== 1 ? "s" : ""}`,
    `Completed modules: ${data.completedModules.length}`,
    `Completed days: ${data.completedDays.length}`,
  ].join("\n");
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
