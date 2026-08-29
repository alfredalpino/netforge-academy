import { describe, expect, it } from "vitest";
import {
  calculateSubnet,
  checkAnswer,
  checkVlsmAnswer,
  generateVlsmQuestion,
  isFullyCorrect,
  isVlsmFullyCorrect,
} from "./subnetting";

describe("subnetting", () => {
  it("calculates /24 subnet correctly", () => {
    const result = calculateSubnet("192.168.1.100", 24);
    expect(result.network).toBe("192.168.1.0");
    expect(result.broadcast).toBe("192.168.1.255");
    expect(result.firstHost).toBe("192.168.1.1");
    expect(result.lastHost).toBe("192.168.1.254");
    expect(result.usableHosts).toBe(254);
  });

  it("handles /31 point-to-point subnet", () => {
    const result = calculateSubnet("10.0.0.1", 31);
    expect(result.usableHosts).toBe(2);
  });

  it("rejects invalid IP addresses", () => {
    expect(() => calculateSubnet("999.1.1.1", 24)).toThrow();
    expect(() => calculateSubnet("10.0.0", 24)).toThrow();
  });

  it("validates user answers", () => {
    const answer = calculateSubnet("172.16.5.10", 28);
    const user = {
      network: answer.network,
      broadcast: answer.broadcast,
      firstHost: answer.firstHost,
      lastHost: answer.lastHost,
      usableHosts: answer.usableHosts,
    };
    expect(isFullyCorrect(user, answer)).toBe(true);
    expect(checkAnswer({ network: "0.0.0.0" }, answer).some((r) => !r.correct)).toBe(true);
  });
});

describe("VLSM", () => {
  it("generates questions with valid allocations", () => {
    for (let i = 0; i < 20; i++) {
      const q = generateVlsmQuestion();
      expect(q.requirements.length).toBeGreaterThanOrEqual(3);
      expect(q.requirements.length).toBeLessThanOrEqual(4);
      expect([23, 24]).toContain(q.basePrefix);
      expect(q.answer).toHaveLength(q.requirements.length);
      for (const assignment of q.answer) {
        const subnet = calculateSubnet(assignment.network, assignment.prefix);
        expect(subnet.network).toBe(assignment.network);
        expect(assignment.usableHosts).toBe(subnet.usableHosts);
        const req = q.requirements.find((r) => r.name === assignment.name);
        expect(req).toBeDefined();
        expect(assignment.usableHosts).toBeGreaterThanOrEqual(req!.hostsNeeded);
      }
    }
  });

  it("validates VLSM answers by requirement name", () => {
    const q = generateVlsmQuestion();
    expect(isVlsmFullyCorrect(q.answer, q.answer)).toBe(true);

    const wrong = q.answer.map((a, i) =>
      i === 0 ? { ...a, network: "0.0.0.0" } : a
    );
    expect(isVlsmFullyCorrect(wrong, q.answer)).toBe(false);

    const results = checkVlsmAnswer(wrong, q.answer);
    expect(results.filter((r) => !r.correct)).toHaveLength(1);
  });

  it("accepts answers in any order", () => {
    const q = generateVlsmQuestion();
    const shuffled = [...q.answer].reverse();
    expect(isVlsmFullyCorrect(shuffled, q.answer)).toBe(true);
  });
});
