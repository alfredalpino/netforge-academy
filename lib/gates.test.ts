import { describe, expect, it } from "vitest";
import { getGateProgress } from "./gates";
import { DEFAULT_PROGRESS } from "./types";

describe("gate progress", () => {
  it("returns readiness for all certification gates", () => {
    const gates = getGateProgress(DEFAULT_PROGRESS);
    expect(gates).toHaveLength(5);
    expect(gates[0].gate.id).toBe("ccna");
    expect(gates[0].percent).toBe(0);
  });

  it("marks CCNA subnetting criterion when drill stats qualify", () => {
    const gates = getGateProgress({
      ...DEFAULT_PROGRESS,
      drillStats: {
        bestStreak: 6,
        totalCorrect: 20,
        totalAttempts: 20,
      },
    });
    const ccna = gates.find((g) => g.gate.id === "ccna");
    expect(ccna?.criteria.find((c) => c.id === "subnetting")?.met).toBe(true);
  });
});
