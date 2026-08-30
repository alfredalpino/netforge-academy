import { describe, expect, it } from "vitest";
import { DEFAULT_PROGRESS } from "./types";
import {
  detectMilestoneEvents,
  milestoneMessage,
  shouldCelebrateWithConfetti,
} from "./milestone-celebrations";

describe("milestone celebrations", () => {
  it("detects newly completed module", () => {
    const events = detectMilestoneEvents(DEFAULT_PROGRESS, {
      ...DEFAULT_PROGRESS,
      completedModules: ["m1-architecture"],
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "module", moduleId: "m1-architecture" });
    expect(milestoneMessage(events[0])).toContain("Module complete");
  });

  it("detects drill streak milestones", () => {
    const events = detectMilestoneEvents(
      {
        ...DEFAULT_PROGRESS,
        drillStats: { bestStreak: 9, totalCorrect: 9, totalAttempts: 9 },
      },
      {
        ...DEFAULT_PROGRESS,
        drillStats: { bestStreak: 10, totalCorrect: 10, totalAttempts: 10 },
      },
    );
    expect(events.some((e) => e.type === "drill-streak" && e.streak === 10)).toBe(true);
    expect(shouldCelebrateWithConfetti({ type: "drill-streak", streak: 10 })).toBe(true);
    expect(shouldCelebrateWithConfetti({ type: "drill-streak", streak: 5 })).toBe(false);
  });

  it("detects all simulator labs passed", () => {
    const allLabs = [
      "basic-lan",
      "vlan-segment",
      "arp-icmp",
      "trunk-vlan",
      "static-route",
      "ospf-basic",
      "dhcp-basic",
      "stp-loop",
      "acl-standard",
      "inter-vlan-routing",
      "acl-extended",
      "inter-vlan-svi",
      "nat-basic",
      "acl-tcp",
    ];
    const events = detectMilestoneEvents(DEFAULT_PROGRESS, {
      ...DEFAULT_PROGRESS,
      completedSimulatorLabs: allLabs,
    });
    expect(events.some((e) => e.type === "sim-labs-complete")).toBe(true);
    expect(shouldCelebrateWithConfetti({ type: "sim-labs-complete" })).toBe(true);
  });
});
