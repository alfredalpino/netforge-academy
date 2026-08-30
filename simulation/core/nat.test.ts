import { describe, expect, it } from "vitest";
import { NAT_BASIC_LAB } from "@/content/labs/nat-basic";
import { SimulationController } from "@/simulation/core/controller";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
} from "@/simulation/grading/lab-schema";

describe("NAT PAT overload", () => {
  it("translates inside host to outside interface IP", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(NAT_BASIC_LAB), 1);
    applyStartupConfig(sim, NAT_BASIC_LAB);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "ip nat inside",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 10.0.0.1 255.255.255.252",
          "ip nat outside",
          "no shutdown",
          "exit",
          "access-list 1 permit 192.168.1.0 0.0.0.255",
          "ip nat inside source list 1 interface Gi0/1 overload",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.1.1",
          "end",
        ],
      ],
      [
        "Server",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 10.0.0.2 255.255.255.252",
          "no shutdown",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) {
        const res = sim.executeCommand(deviceId, line);
        expect(res.error).toBeUndefined();
      }
    }

    const ping = sim.ping("PC1", "10.0.0.2", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);

    const r1 = sim.getDevice("R1")!;
    expect(r1.runtime.natTranslations?.length).toBeGreaterThan(0);
    expect(r1.runtime.natTranslations?.[0]?.insideLocal).toBe("192.168.1.10");
    expect(r1.runtime.natTranslations?.[0]?.outsideGlobal).toBe("10.0.0.1");
  });

  it("passes nat-basic lab grading when fully configured", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(NAT_BASIC_LAB), 1);
    applyStartupConfig(sim, NAT_BASIC_LAB);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "ip nat inside",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 10.0.0.1 255.255.255.252",
          "ip nat outside",
          "no shutdown",
          "exit",
          "access-list 1 permit 192.168.1.0 0.0.0.255",
          "ip nat inside source list 1 interface Gi0/1 overload",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.1.1",
          "end",
        ],
      ],
      [
        "Server",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 10.0.0.2 255.255.255.252",
          "no shutdown",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(NAT_BASIC_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});
