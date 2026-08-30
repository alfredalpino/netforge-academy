import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Router + switch + host — DHCP pool on R1, PC learns address via DORA. */
export const DHCP_BASIC_LAB: LabSpec = {
  schemaVersion: 1,
  id: "dhcp-basic",
  title: "DHCP Address Assignment",
  difficulty: "beginner",
  estimatedMinutes: 20,
  objectives: [
    "Configure R1 LAN interface 192.168.1.1/24 and bring it up",
    "Create DHCP pool LAN with network 192.168.1.0/24 and default-router 192.168.1.1",
    "On PC1 use `ip address dhcp` — watch DORA in Packets/Capture tabs",
    "Ping the default gateway from PC1",
  ],
  topology: {
    nodes: [
      {
        id: "R1",
        name: "R1",
        type: "router",
        interfaces: [{ name: "Gi0/0" }],
        position: { x: 120, y: 160 },
      },
      {
        id: "SW1",
        name: "SW1",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
        position: { x: 360, y: 160 },
      },
      {
        id: "PC1",
        name: "PC1",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 600, y: 160 },
      },
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
  },
  startupConfig: {
    R1: "enable\nconfigure terminal\nhostname R1\nend",
    SW1: "enable\nconfigure terminal\nhostname SW1\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
  },
  checks: [
    { type: "interface_up", device: "R1", interface: "Gi0/0" },
    { type: "interface_up", device: "PC1", interface: "eth0" },
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "192.168.1.1" },
    { type: "ping", from: "PC1", to: "192.168.1.1", expect: "success" },
  ],
  grading: { passScore: 80 },
};
