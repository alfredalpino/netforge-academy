import { describe, expect, it } from "vitest";
import {
  getDayProgressPercent,
  getOverallProgress,
  getStudyHeatmapData,
  needsBackupReminder,
  daysSinceBackup,
  formatImportPreview,
} from "./progress";
import { DEFAULT_PROGRESS } from "./types";

describe("progress helpers", () => {
  it("computes day progress from completed blocks", () => {
    const percent = getDayProgressPercent(1, 1, { "w1-d1": ["block-1", "block-2"] }, 6);
    expect(percent).toBe(33);
  });

  it("computes overall progress snapshot", () => {
    const overall = getOverallProgress({
      ...DEFAULT_PROGRESS,
      completedModules: ["m0-foundation"],
      completedDays: ["1-1"],
    });
    expect(overall.overall).toBeGreaterThan(0);
    expect(overall.totalModules).toBeGreaterThan(0);
  });

  it("builds heatmap data", () => {
    const data = getStudyHeatmapData(["2026-08-28", "2026-08-28"], 2);
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((d) => d.level > 0)).toBe(true);
  });

  it("detects backup reminder when never backed up", () => {
    expect(needsBackupReminder("")).toBe(true);
    expect(daysSinceBackup("")).toBe(Number.POSITIVE_INFINITY);
  });

  it("detects backup reminder after 7 days", () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0];
    expect(needsBackupReminder(eightDaysAgo)).toBe(true);
    expect(daysSinceBackup(eightDaysAgo)).toBeGreaterThanOrEqual(8);
  });

  it("formats import preview summary", () => {
    const preview = formatImportPreview({
      ...DEFAULT_PROGRESS,
      currentWeek: 3,
      currentDay: 2,
      streak: 5,
      completedModules: ["m0-foundation", "m1-subnetting"],
      completedDays: ["w1-d1", "w1-d2"],
    });
    expect(preview).toContain("Week 3, Day 2");
    expect(preview).toContain("Streak: 5 days");
    expect(preview).toContain("Completed modules: 2");
    expect(preview).toContain("Completed days: 2");
  });
});
