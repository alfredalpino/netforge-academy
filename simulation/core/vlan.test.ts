import { describe, expect, it } from "vitest";
import { SimulationController } from "../core/controller";

describe("VLAN isolation", () => {
  it("blocks L2 between different access VLANs", () => {
    const sim = new SimulationController();
    sim.loadTopology(
      {
        nodes: [
          {
            id: "SW1",
            name: "SW1",
            type: "switch",
            interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
          },
          { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
          { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
        ],
        links: [
          {
            id: "L1",
            a: { deviceId: "SW1", interfaceName: "Gi0/1" },
            b: { deviceId: "PC1", interfaceName: "eth0" },
          },
          {
            id: "L2",
            a: { deviceId: "SW1", interfaceName: "Gi0/2" },
            b: { deviceId: "PC2", interfaceName: "eth0" },
          },
        ],
      },
      7,
    );

    for (const line of [
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
      "end",
    ]) {
      sim.executeCommand("SW1", line);
    }

    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.10.10.10 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.10.10.20 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC2", line);
    }

    const ping = sim.ping("PC1", "10.10.10.20", 1);
    expect(ping.success).toBe(false);
  });

  it("forwards within the same access VLAN", () => {
    const sim = new SimulationController();
    sim.loadTopology(
      {
        nodes: [
          {
            id: "SW1",
            name: "SW1",
            type: "switch",
            interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
          },
          { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
          { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
        ],
        links: [
          {
            id: "L1",
            a: { deviceId: "SW1", interfaceName: "Gi0/1" },
            b: { deviceId: "PC1", interfaceName: "eth0" },
          },
          {
            id: "L2",
            a: { deviceId: "SW1", interfaceName: "Gi0/2" },
            b: { deviceId: "PC2", interfaceName: "eth0" },
          },
        ],
      },
      7,
    );

    for (const line of [
      "enable",
      "configure terminal",
      "interface Gi0/1",
      "switchport mode access",
      "switchport access vlan 10",
      "no shutdown",
      "exit",
      "interface Gi0/2",
      "switchport mode access",
      "switchport access vlan 10",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("SW1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.10.10.10 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC1", line);
    }
    for (const line of [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 10.10.10.20 255.255.255.0",
      "no shutdown",
      "end",
    ]) {
      sim.executeCommand("PC2", line);
    }

    const ping = sim.ping("PC1", "10.10.10.20", 1);
    expect(ping.success).toBe(true);
  });
});
