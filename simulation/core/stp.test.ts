import { describe, expect, it } from "vitest";
import { SimulationController } from "@/simulation/core/controller";
import type { TopologySpec } from "@/simulation/core/types";

/** Three switches in a triangle — STP blocks one inter-switch link. */
const STP_TRIANGLE: TopologySpec = {
  nodes: [
    { id: "SW1", name: "SW1", type: "switch", interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }, { name: "Gi0/3" }] },
    { id: "SW2", name: "SW2", type: "switch", interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }] },
    { id: "SW3", name: "SW3", type: "switch", interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }, { name: "Gi0/3" }] },
    { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
    { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
  ],
  links: [
    { id: "L1", a: { deviceId: "SW1", interfaceName: "Gi0/1" }, b: { deviceId: "SW2", interfaceName: "Gi0/1" } },
    { id: "L2", a: { deviceId: "SW2", interfaceName: "Gi0/2" }, b: { deviceId: "SW3", interfaceName: "Gi0/1" } },
    { id: "L3", a: { deviceId: "SW3", interfaceName: "Gi0/2" }, b: { deviceId: "SW1", interfaceName: "Gi0/2" } },
    { id: "L4", a: { deviceId: "PC1", interfaceName: "eth0" }, b: { deviceId: "SW1", interfaceName: "Gi0/3" } },
    { id: "L5", a: { deviceId: "PC2", interfaceName: "eth0" }, b: { deviceId: "SW3", interfaceName: "Gi0/3" } },
  ],
};

describe("STP stub", () => {
  it("blocks one redundant port in a switch triangle", () => {
    const sim = new SimulationController();
    sim.loadTopology(STP_TRIANGLE, 1);

    const stp = sim.executeCommand("SW1", "show spanning-tree");
    expect(stp.output).toContain("Root ID: SW1");

    const blockedCount = ["SW1", "SW2", "SW3"].flatMap((id) => {
      const sw = sim.getDevice(id)!;
      return sw.interfaces.filter((i) => i.stpState === "blocking");
    }).length;
    expect(blockedCount).toBe(1);
  });

  it("allows PC1 to ping PC2 on the same VLAN through the spanning tree", () => {
    const sim = new SimulationController();
    sim.loadTopology(STP_TRIANGLE, 1);

    for (const [id, lines] of [
      [
        "PC1",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "end",
        ],
      ],
      [
        "PC2",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.1.20 255.255.255.0",
          "no shutdown",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) {
        const res = sim.executeCommand(id, line);
        expect(res.error).toBeUndefined();
      }
    }

    const ping = sim.ping("PC1", "192.168.1.20", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);
  });
});
