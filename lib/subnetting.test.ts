import { describe, expect, it } from "vitest";
import { calculateSubnet, checkAnswer, isFullyCorrect } from "./subnetting";

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
