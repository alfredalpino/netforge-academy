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

  it("adds VLSM practice CTA when vlsm criterion is unmet", () => {
    const gates = getGateProgress(DEFAULT_PROGRESS);
    const ccna = gates.find((g) => g.gate.id === "ccna");
    const vlsm = ccna?.criteria.find((c) => c.id === "vlsm");
    expect(vlsm?.met).toBe(false);
    expect(vlsm?.cta).toEqual({ href: "/drills/vlsm", label: "Practice VLSM" });
  });

  it("marks CCNA vlsm criterion when drill stats qualify", () => {
    const gates = getGateProgress({
      ...DEFAULT_PROGRESS,
      drillStats: {
        bestStreak: 5,
        totalCorrect: 8,
        totalAttempts: 8,
      },
    });
    const ccna = gates.find((g) => g.gate.id === "ccna");
    expect(ccna?.criteria.find((c) => c.id === "vlsm")?.met).toBe(true);
  });

  it("adds wireshark lab CTA when packet analysis steps incomplete", () => {
    const gates = getGateProgress(DEFAULT_PROGRESS);
    const ccna = gates.find((g) => g.gate.id === "ccna");
    const wireshark = ccna?.criteria.find((c) => c.id === "wireshark");
    expect(wireshark?.cta).toEqual({ href: "/labs", label: "Open packet analysis labs" });
  });

  it("marks CCNA simulator labs when all browser labs passed", () => {
    const gates = getGateProgress({
      ...DEFAULT_PROGRESS,
      completedSimulatorLabs: [
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
      ],
    });
    const ccna = gates.find((g) => g.gate.id === "ccna");
    expect(ccna?.criteria.find((c) => c.id === "simulator-labs")?.met).toBe(true);
  });
});
