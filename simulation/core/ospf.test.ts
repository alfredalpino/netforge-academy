import { describe, expect, it } from "vitest";
import { SimulationController } from "@/simulation/core/controller";
import { topologyFromLab } from "@/simulation/grading/lab-schema";
import { OSPF_BASIC_LAB } from "@/content/labs/ospf-basic";

function configureOspfLab(sim: SimulationController): void {
  sim.loadTopology(topologyFromLab(OSPF_BASIC_LAB), 1);

  const steps: Array<[string, string]> = [
    ["R1", "enable"],
    ["R1", "configure terminal"],
    ["R1", "interface Gi0/0"],
    ["R1", "ip address 192.168.1.1 255.255.255.0"],
    ["R1", "no shutdown"],
    ["R1", "exit"],
    ["R1", "interface Gi0/1"],
    ["R1", "ip address 10.0.0.1 255.255.255.252"],
    ["R1", "no shutdown"],
    ["R1", "exit"],
    ["R1", "router ospf 1"],
    ["R1", "router-id 1.1.1.1"],
    ["R1", "network 192.168.1.0 0.0.0.255 area 0"],
    ["R1", "network 10.0.0.0 0.0.0.3 area 0"],
    ["R1", "end"],
    ["R2", "enable"],
    ["R2", "configure terminal"],
    ["R2", "interface Gi0/0"],
    ["R2", "ip address 10.0.0.2 255.255.255.252"],
    ["R2", "no shutdown"],
    ["R2", "exit"],
    ["R2", "interface Gi0/1"],
    ["R2", "ip address 192.168.2.1 255.255.255.0"],
    ["R2", "no shutdown"],
    ["R2", "exit"],
    ["R2", "router ospf 1"],
    ["R2", "router-id 2.2.2.2"],
    ["R2", "network 192.168.2.0 0.0.0.255 area 0"],
    ["R2", "network 10.0.0.0 0.0.0.3 area 0"],
    ["R2", "end"],
    ["PC1", "enable"],
    ["PC1", "configure terminal"],
    ["PC1", "interface eth0"],
    ["PC1", "ip address 192.168.1.10 255.255.255.0"],
    ["PC1", "no shutdown"],
    ["PC1", "exit"],
    ["PC1", "ip default-gateway 192.168.1.1"],
    ["PC1", "end"],
    ["PC2", "enable"],
    ["PC2", "configure terminal"],
    ["PC2", "interface eth0"],
    ["PC2", "ip address 192.168.2.10 255.255.255.0"],
    ["PC2", "no shutdown"],
    ["PC2", "exit"],
    ["PC2", "ip default-gateway 192.168.2.1"],
    ["PC2", "end"],
  ];

  for (const [deviceId, line] of steps) {
    const res = sim.executeCommand(deviceId, line);
    expect(res.error, `${deviceId}> ${line}`).toBeUndefined();
  }
}

describe("OSPF single-area stub", () => {
  it("forms FULL adjacency and learns remote LAN routes", () => {
    const sim = new SimulationController();
    configureOspfLab(sim);

    const neighbors = sim.executeCommand("R1", "show ip ospf neighbor");
    expect(neighbors.output).toContain("FULL");
    expect(neighbors.output).toContain("2.2.2.2");

    const routes = sim.executeCommand("R1", "show ip route");
    expect(routes.output).toContain("O");
    expect(routes.output).toContain("192.168.2.0/24");

    const ping = sim.ping("PC1", "192.168.2.10", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);
  });
});
