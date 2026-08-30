import { describe, expect, it } from "vitest";
import { SimulationController } from "@/simulation/core/controller";
import { topologyFromLab } from "@/simulation/grading/lab-schema";
import { DHCP_BASIC_LAB } from "@/content/labs/dhcp-basic";

describe("DHCP stub", () => {
  it("assigns address via DORA and sets default gateway", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(DHCP_BASIC_LAB), 1);

    const steps: Array<[string, string]> = [
      ["R1", "enable"],
      ["R1", "configure terminal"],
      ["R1", "interface Gi0/0"],
      ["R1", "ip address 192.168.1.1 255.255.255.0"],
      ["R1", "no shutdown"],
      ["R1", "exit"],
      ["R1", "ip dhcp pool LAN"],
      ["R1", "network 192.168.1.0 255.255.255.0"],
      ["R1", "default-router 192.168.1.1"],
      ["R1", "end"],
      ["PC1", "enable"],
      ["PC1", "configure terminal"],
      ["PC1", "interface eth0"],
      ["PC1", "no shutdown"],
      ["PC1", "ip address dhcp"],
      ["PC1", "end"],
    ];

    for (const [deviceId, line] of steps) {
      const res = sim.executeCommand(deviceId, line);
      expect(res.error, `${deviceId}> ${line}`).toBeUndefined();
    }

    const pc = sim.getDevice("PC1");
    expect(pc?.interfaces[0]?.ipv4[0]?.address).toMatch(/^192\.168\.1\./);
    expect(pc?.interfaces[0]?.ipv4[0]?.address).not.toBe("192.168.1.1");

    const traces = sim.getTraces().filter((t) => t.protocol === "DHCP");
    expect(traces.length).toBeGreaterThanOrEqual(4);

    const ping = sim.ping("PC1", "192.168.1.1", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);
  });
});
