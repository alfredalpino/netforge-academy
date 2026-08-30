import { describe, expect, it } from "vitest";
import { SimulationController } from "./controller";
import { INTER_VLAN_SVI_LAB } from "@/content/labs/inter-vlan-svi";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
} from "@/simulation/grading/lab-schema";

describe("inter-VLAN SVI routing", () => {
  it("routes between VLANs on a multilayer switch", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(INTER_VLAN_SVI_LAB), 1);
    applyStartupConfig(sim, INTER_VLAN_SVI_LAB);

    for (const [deviceId, lines] of [
      [
        "SW1",
        [
          "interface Gi0/1",
          "switchport mode access",
          "switchport access vlan 10",
          "no shutdown",
          "exit",
          "interface Gi0/2",
          "switchport mode access",
          "switchport access vlan 20",
          "no shutdown",
          "exit",
          "interface Vlan10",
          "ip address 192.168.10.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Vlan20",
          "ip address 192.168.20.1 255.255.255.0",
          "no shutdown",
          "exit",
          "ip routing",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "interface eth0",
          "ip address 192.168.10.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.10.1",
          "end",
        ],
      ],
      [
        "PC2",
        [
          "interface eth0",
          "ip address 192.168.20.20 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.20.1",
          "end",
        ],
      ],
    ] as const) {
      sim.executeCommand(deviceId, "enable");
      sim.executeCommand(deviceId, "configure terminal");
      for (const line of lines) {
        const res = sim.executeCommand(deviceId, line);
        expect(res.error).toBeUndefined();
      }
    }

    sim.runUntilIdle();
    const ping = sim.ping("PC1", "192.168.20.20", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);

    const report = gradeLab(INTER_VLAN_SVI_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});
