import { z } from "zod";
import { DEFAULT_PROGRESS } from "./types";

const accountCheckInSchema = z.object({
  studied: z.boolean(),
  hours: z.number().min(0).max(24).optional(),
  reflection: z.string().max(2000).optional(),
});

const drillStatsSchema = z.object({
  bestStreak: z.number().int().min(0),
  totalCorrect: z.number().int().min(0),
  totalAttempts: z.number().int().min(0),
  totalTimeSeconds: z.number().int().min(0).optional(),
  averageSeconds: z.number().min(0).optional(),
});

export const progressStateSchema = z.object({
  startDate: z.string(),
  currentWeek: z.number().int().min(1).max(28),
  currentDay: z.number().int().min(1).max(7),
  completedDays: z.array(z.string()),
  completedModules: z.array(z.string()),
  completedBlocks: z.record(z.string(), z.array(z.string())),
  streak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastStudyDate: z.string(),
  studyHistory: z.array(z.string()),
  weeklyGoal: z.string().max(500),
  checkIns: z.record(z.string(), accountCheckInSchema),
  drillStats: drillStatsSchema,
  labSetupComplete: z.array(z.string()),
  notes: z.record(z.string(), z.string().max(5000)),
  currentModuleId: z.string(),
  completedTours: z.array(z.string()),
  focusChecklists: z.record(z.string(), z.boolean()).optional(),
  lastBackupDate: z.string().optional(),
});

export type ParsedProgressState = z.infer<typeof progressStateSchema>;

export function parseStoredProgress(raw: string | null) {
  if (!raw) return DEFAULT_PROGRESS;

  try {
    const parsed = progressStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_PROGRESS;

    return {
      ...DEFAULT_PROGRESS,
      ...parsed.data,
      focusChecklists: parsed.data.focusChecklists ?? {},
      lastBackupDate: parsed.data.lastBackupDate ?? "",
      drillStats: {
        ...DEFAULT_PROGRESS.drillStats,
        ...parsed.data.drillStats,
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function validateProgressImport(data: unknown) {
  const parsed = progressStateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.message };
  }
  return {
    success: true as const,
    data: {
      ...DEFAULT_PROGRESS,
      ...parsed.data,
      focusChecklists: parsed.data.focusChecklists ?? {},
      lastBackupDate: parsed.data.lastBackupDate ?? "",
      drillStats: {
        ...DEFAULT_PROGRESS.drillStats,
        ...parsed.data.drillStats,
      },
    },
  };
}
