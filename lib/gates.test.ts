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
        bestStreak: 10,
        totalCorrect: 20,
        totalAttempts: 20,
      },
    });
    const ccna = gates.find((g) => g.gate.id === "ccna");
    expect(ccna?.criteria.find((c) => c.id === "subnetting")?.met).toBe(true);
  });

  it("adds practice CTA when subnetting criterion is unmet", () => {
    const gates = getGateProgress(DEFAULT_PROGRESS);
    const ccna = gates.find((g) => g.gate.id === "ccna");
    const subnetting = ccna?.criteria.find((c) => c.id === "subnetting");
    expect(subnetting?.met).toBe(false);
    expect(subnetting?.cta).toEqual({ href: "/drills/subnetting", label: "Practice subnetting" });
  });
});
