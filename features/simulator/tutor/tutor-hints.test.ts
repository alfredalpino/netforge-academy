import { describe, expect, it } from "vitest";
import { deriveTutorHints } from "./tutor-hints";
import type { PacketTrace } from "@/simulation/core/types";
import type { GradeReport } from "@/simulation/grading/lab-schema";

const droppedVlan: PacketTrace = {
  packetId: "p1",
  protocol: "ICMP",
  summary: "echo-request",
  outcome: "dropped",
  hops: [
    { t: 1, deviceId: "SW1", action: "drop VLAN" },
  ],
};

describe("deriveTutorHints", () => {
  it("suggests VLAN fix for dropped packet with vlan hop", () => {
    const hints = deriveTutorHints({
      grade: null,
      selectedTrace: droppedVlan,
      traces: [droppedVlan],
    });
    expect(hints.some((h) => h.title.includes("VLAN"))).toBe(true);
  });

  it("maps failed interface_up check to no shutdown tip", () => {
    const grade: GradeReport = {
      labId: "basic-lan",
      score: 60,
      passScore: 80,
      passed: false,
      checks: [
        {
          id: "c0",
          type: "interface_up",
          label: "R1 Gi0/0 up",
          pass: false,
          detail: "admin=down oper=down",
        },
      ],
    };
    const hints = deriveTutorHints({
      grade,
      selectedTrace: null,
      traces: [],
    });
    expect(hints.some((h) => h.body.includes("no shutdown"))).toBe(true);
  });

  it("distinguishes ping should succeed vs isolation failure", () => {
    const grade: GradeReport = {
      labId: "vlan-segment",
      score: 50,
      passScore: 80,
      passed: false,
      checks: [
        {
          id: "c4",
          type: "ping",
          label: "Ping PC1 → 10.20.20.20",
          pass: false,
          detail: "Ping to 10.20.20.20: 1/1 success",
        },
      ],
    };
    const hints = deriveTutorHints({
      grade,
      selectedTrace: null,
      traces: [],
    });
    expect(hints.some((h) => h.title.includes("isolated"))).toBe(true);
  });

  it("includes per-lab playbook when labId provided", () => {
    const hints = deriveTutorHints({
      grade: null,
      selectedTrace: null,
      traces: [],
      labId: "static-route",
    });
    expect(hints.some((h) => h.source === "lab" && h.body.includes("default-gateway"))).toBe(
      true,
    );
  });
});
