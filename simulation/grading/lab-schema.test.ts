import { describe, expect, it } from "vitest";
import { SimulationController } from "../core/controller";
import { BASIC_LAN_LAB } from "@/content/labs/basic-lan";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
} from "./lab-schema";

describe("basic-lan grading", () => {
  it("fails before student config", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(BASIC_LAN_LAB), 42);
    applyStartupConfig(sim, BASIC_LAN_LAB);
    const report = gradeLab(BASIC_LAN_LAB, sim);
    expect(report.passed).toBe(false);
    expect(report.score).toBeLessThan(80);
  });

  it("passes after correct addressing and ping path", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(BASIC_LAN_LAB), 42);
    applyStartupConfig(sim, BASIC_LAN_LAB);

    for (const line of [
      "enable",
      "configure terminal",
      "interface Gi0/0",
      "ip address 10.0.0.1 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("R1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.0.0.10 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC1", line);
    }

    const report = gradeLab(BASIC_LAN_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
    expect(report.checks.every((c) => c.pass)).toBe(true);
  });
});
