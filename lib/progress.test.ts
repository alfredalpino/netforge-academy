import { describe, expect, it } from "vitest";
import {
  getDayProgressPercent,
  getOverallProgress,
  getStudyHeatmapData,
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
});
