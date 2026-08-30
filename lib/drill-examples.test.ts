import { describe, expect, it } from "vitest";
import { calculateSubnet } from "./subnetting";
import { SUBNET_EXAMPLES, VLSM_EXAMPLE } from "./drill-examples";

describe("drill-examples", () => {
  it("subnet worked examples match calculateSubnet", () => {
    for (const ex of SUBNET_EXAMPLES) {
      const [ip, prefixStr] = ex.given.split("/");
      const answer = calculateSubnet(ip, Number(prefixStr));
      expect(answer.network).toBe(ex.answer.network);
      expect(answer.broadcast).toBe(ex.answer.broadcast);
      expect(answer.firstHost).toBe(ex.answer.firstHost);
      expect(answer.lastHost).toBe(ex.answer.lastHost);
      expect(answer.usableHosts).toBe(ex.answer.usableHosts);
    }
  });

  it("VLSM example has three allocations largest-first", () => {
    expect(VLSM_EXAMPLE.allocations).toHaveLength(3);
    expect(VLSM_EXAMPLE.allocations[0].prefix).toBeLessThanOrEqual(
      VLSM_EXAMPLE.allocations[1].prefix,
    );
  });
});
