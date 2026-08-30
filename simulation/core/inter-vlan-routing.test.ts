import { describe, expect, it } from "vitest";
import { parseSubinterfaceName } from "./subinterface";
import { SimulationController } from "./controller";
import { INTER_VLAN_ROUTING_LAB } from "@/content/labs/inter-vlan-routing";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
} from "@/simulation/grading/lab-schema";

describe("subinterface parsing", () => {
  it("parses Gi0/0.10 into parent and VLAN", () => {
    expect(parseSubinterfaceName("Gi0/0.10")).toEqual({
      parentName: "Gi0/0",
      vlan: 10,
    });
    expect(parseSubinterfaceName("Gi0/0")).toBeNull();
  });
});

describe("inter-VLAN routing", () => {
  it("routes PC1 VLAN10 to PC2 VLAN20 via router subinterfaces", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(INTER_VLAN_ROUTING_LAB), 1);
    applyStartupConfig(sim, INTER_VLAN_ROUTING_LAB);

    const steps: Array<[string, string[]]> = [
      [
        "SW1",
        [
          "interface Gi0/1",
          "switchport mode trunk",
          "switchport trunk allowed vlan 10,20",
          "no shutdown",
          "exit",
          "interface Gi0/2",
          "switchport mode access",
          "switchport access vlan 10",
          "no shutdown",
          "exit",
          "interface Gi0/3",
          "switchport mode access",
          "switchport access vlan 20",
          "no shutdown",
          "end",
        ],
      ],
      [
        "R1",
        [
          "interface Gi0/0.10",
          "encapsulation dot1Q 10",
          "ip address 192.168.10.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/0.20",
          "encapsulation dot1Q 20",
          "ip address 192.168.20.1 255.255.255.0",
          "no shutdown",
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
    ];

    for (const [dev, lines] of steps) {
      sim.executeCommand(dev, "enable");
      sim.executeCommand(dev, "configure terminal");
      for (const line of lines) {
        const res = sim.executeCommand(dev, line);
        expect(res.error).toBeUndefined();
      }
    }

    sim.runUntilIdle();
    const ping = sim.ping("PC1", "192.168.20.20", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);

    const report = gradeLab(INTER_VLAN_ROUTING_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});
