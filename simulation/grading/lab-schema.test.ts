import { describe, expect, it } from "vitest";
import { SimulationController } from "../core/controller";
import { BASIC_LAN_LAB } from "@/content/labs/basic-lan";
import { ARP_ICMP_LAB } from "@/content/labs/arp-icmp";
import { TRUNK_VLAN_LAB } from "@/content/labs/trunk-vlan";
import { STATIC_ROUTE_LAB } from "@/content/labs/static-route";
import { OSPF_BASIC_LAB } from "@/content/labs/ospf-basic";
import { STP_LOOP_LAB } from "@/content/labs/stp-loop";
import { ACL_STANDARD_LAB } from "@/content/labs/acl-standard";
import { INTER_VLAN_ROUTING_LAB } from "@/content/labs/inter-vlan-routing";
import { ACL_EXTENDED_LAB } from "@/content/labs/acl-extended";
import { INTER_VLAN_SVI_LAB } from "@/content/labs/inter-vlan-svi";
import { NAT_BASIC_LAB } from "@/content/labs/nat-basic";
import { ACL_TCP_LAB } from "@/content/labs/acl-tcp";
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

describe("arp-icmp grading", () => {
  it("passes after host-to-host addressing on same subnet", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(ARP_ICMP_LAB), 42);
    applyStartupConfig(sim, ARP_ICMP_LAB);

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
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.0.0.20 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC2", line);
    }

    const report = gradeLab(ARP_ICMP_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("trunk-vlan grading", () => {
  it("passes with access VLAN 10 and trunk between switches", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(TRUNK_VLAN_LAB), 42);
    applyStartupConfig(sim, TRUNK_VLAN_LAB);

    for (const sw of ["SW1", "SW2"] as const) {
      for (const line of [
        "enable",
        "configure terminal",
        "interface Gi0/1",
        "switchport mode access",
        "switchport access vlan 10",
        "no shutdown",
        "exit",
        "interface Gi0/2",
        "switchport mode trunk",
        "switchport trunk allowed vlan 10",
        "no shutdown",
        "end",
      ]) {
        sim.executeCommand(sw, line);
      }
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 192.168.10.10 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 192.168.10.20 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC2", line);
    }

    const report = gradeLab(TRUNK_VLAN_LAB, sim);
    expect(report.passed).toBe(true);
  });
});

describe("static-route grading", () => {
  it("passes after interfaces and reciprocal static routes", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(STATIC_ROUTE_LAB), 42);
    applyStartupConfig(sim, STATIC_ROUTE_LAB);

    for (const line of [
      "enable",
      "configure terminal",
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 10.0.0.1 255.255.255.252",
      "no shutdown",
      "exit",
      "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
      "end",
    ]) {
      sim.executeCommand("R1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface Gi0/0",
      "ip address 10.0.0.2 255.255.255.252",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 192.168.2.1 255.255.255.0",
      "no shutdown",
      "exit",
      "ip route 192.168.1.0 255.255.255.0 10.0.0.1",
      "end",
    ]) {
      sim.executeCommand("R2", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 192.168.1.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.1.1",
      "end",
    ]) {
      sim.executeCommand("PC1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 192.168.2.10 255.255.255.0",
      "no shutdown",
      "exit",
      "ip default-gateway 192.168.2.1",
      "end",
    ]) {
      sim.executeCommand("PC2", line);
    }

    const report = gradeLab(STATIC_ROUTE_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("ospf-basic grading", () => {
  it("passes when OSPF area 0 connects both LANs", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(OSPF_BASIC_LAB), 1);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 10.0.0.1 255.255.255.252",
          "no shutdown",
          "exit",
          "router ospf 1",
          "router-id 1.1.1.1",
          "network 192.168.1.0 0.0.0.255 area 0",
          "network 10.0.0.0 0.0.0.3 area 0",
          "end",
        ],
      ],
      [
        "R2",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 10.0.0.2 255.255.255.252",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "router ospf 1",
          "router-id 2.2.2.2",
          "network 192.168.2.0 0.0.0.255 area 0",
          "network 10.0.0.0 0.0.0.3 area 0",
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
        "PC2",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(OSPF_BASIC_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("stp-loop grading", () => {
  it("passes when PCs are addressed and ping succeeds through STP tree", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(STP_LOOP_LAB), 1);
    applyStartupConfig(sim, STP_LOOP_LAB);

    for (const [deviceId, lines] of [
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
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(STP_LOOP_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("acl-standard grading", () => {
  it("passes when ACL blocks PC1→PC2 but local gateway ping works", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(ACL_STANDARD_LAB), 1);
    applyStartupConfig(sim, ACL_STANDARD_LAB);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 10 deny 192.168.1.0 0.0.0.255",
          "interface Gi0/1",
          "ip access-group 10 out",
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
        "PC2",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(ACL_STANDARD_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("inter-vlan-routing grading", () => {
  it("passes when subinterfaces route between VLAN 10 and VLAN 20", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(INTER_VLAN_ROUTING_LAB), 1);
    applyStartupConfig(sim, INTER_VLAN_ROUTING_LAB);

    for (const [deviceId, lines] of [
      [
        "SW1",
        [
          "enable",
          "configure terminal",
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
          "enable",
          "configure terminal",
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
          "enable",
          "configure terminal",
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
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.20.20 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.20.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(INTER_VLAN_ROUTING_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("acl-extended grading", () => {
  it("passes when extended ACL blocks icmp between subnets", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(ACL_EXTENDED_LAB), 1);
    applyStartupConfig(sim, ACL_EXTENDED_LAB);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 100 deny icmp 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255",
          "access-list 100 permit ip any any",
          "interface Gi0/1",
          "ip access-group 100 out",
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
        "PC2",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(ACL_EXTENDED_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("inter-vlan-svi grading", () => {
  it("passes when SVIs route between VLAN 10 and VLAN 20", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(INTER_VLAN_SVI_LAB), 1);
    applyStartupConfig(sim, INTER_VLAN_SVI_LAB);

    for (const [deviceId, lines] of [
      [
        "SW1",
        [
          "enable",
          "configure terminal",
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
          "enable",
          "configure terminal",
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
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.20.20 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.20.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(INTER_VLAN_SVI_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});

describe("nat-basic grading", () => {
  it("passes when PAT overload lets inside PC ping outside server", () => {
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

describe("acl-tcp grading", () => {
  it("passes when tcp/80 blocked but tcp/443 and icmp permitted", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(ACL_TCP_LAB), 1);
    applyStartupConfig(sim, ACL_TCP_LAB);

    for (const [deviceId, lines] of [
      [
        "R1",
        [
          "enable",
          "configure terminal",
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 101 deny tcp 192.168.1.0 0.0.0.255 host 192.168.2.10 eq 80",
          "access-list 101 permit ip any any",
          "interface Gi0/1",
          "ip access-group 101 out",
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
        "PC2",
        [
          "enable",
          "configure terminal",
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ] as const) {
      for (const line of lines) sim.executeCommand(deviceId, line);
    }

    sim.runUntilIdle();
    const report = gradeLab(ACL_TCP_LAB, sim);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
  });
});
