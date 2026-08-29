import { describe, expect, it } from "vitest";
import { SimulationController } from "./controller";
import type { TopologySpec } from "./types";

const basicLan: TopologySpec = {
  nodes: [
    { id: "R1", name: "R1", type: "router", interfaces: [{ name: "Gi0/0" }] },
    {
      id: "SW1",
      name: "SW1",
      type: "switch",
      interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
    },
    { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
  ],
  links: [
    {
      id: "L1",
      a: { deviceId: "R1", interfaceName: "Gi0/0" },
      b: { deviceId: "SW1", interfaceName: "Gi0/1" },
      latencyMs: 1,
    },
    {
      id: "L2",
      a: { deviceId: "SW1", interfaceName: "Gi0/2" },
      b: { deviceId: "PC1", interfaceName: "eth0" },
      latencyMs: 1,
    },
  ],
};

function configureBasicLan(sim: SimulationController): void {
  sim.loadTopology(basicLan, 42);
  // R1
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
  // PC1
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
}

describe("SimulationController ping vertical slice", () => {
  it("ARP + ICMP echo succeeds PC1 → R1", () => {
    const sim = new SimulationController();
    configureBasicLan(sim);

    const result = sim.ping("PC1", "10.0.0.1", 1);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/1\/1 success/);

    const pc = sim.getDevice("PC1");
    expect(pc?.runtime.arpTable.some((e) => e.ip === "10.0.0.1")).toBe(true);

    const traces = sim.getTraces();
    expect(traces.some((t) => t.protocol === "ARP")).toBe(true);
    expect(traces.some((t) => t.protocol === "ICMP" && t.outcome === "delivered")).toBe(
      true,
    );
  });

  it("ping fails without addressing", () => {
    const sim = new SimulationController();
    sim.loadTopology(basicLan, 1);
    const result = sim.ping("PC1", "10.0.0.1", 1);
    expect(result.success).toBe(false);
  });

  it("is deterministic for identical setup", () => {
    const a = new SimulationController();
    const b = new SimulationController();
    configureBasicLan(a);
    configureBasicLan(b);
    a.ping("PC1", "10.0.0.1", 1);
    b.ping("PC1", "10.0.0.1", 1);
    expect(a.getTraces().map((t) => t.summary)).toEqual(
      b.getTraces().map((t) => t.summary),
    );
  });
});
