import type { LabSpec } from "@/simulation/grading/lab-schema";

/** 802.1Q trunk between two switches — same VLAN hosts reach each other across the trunk. */
export const TRUNK_VLAN_LAB: LabSpec = {
  schemaVersion: 1,
  id: "trunk-vlan",
  title: "802.1Q Trunk Between Switches",
  difficulty: "beginner",
  estimatedMinutes: 20,
  objectives: [
    "Put both access ports on VLAN 10",
    "Configure Gi0/2 as an 802.1Q trunk on SW1 and SW2 (allow VLAN 10)",
    "Address PC1 and PC2 in 192.168.10.0/24",
    "Verify PC1 can ping PC2 across the trunk",
  ],
  topology: {
    nodes: [
      {
        id: "SW1",
        name: "SW1",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
        position: { x: 280, y: 160 },
      },
      {
        id: "SW2",
        name: "SW2",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
        position: { x: 480, y: 160 },
      },
      {
        id: "PC1",
        name: "PC1",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 80, y: 160 },
      },
      {
        id: "PC2",
        name: "PC2",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 680, y: 160 },
      },
    ],
    links: [
      {
        id: "L1",
        a: { deviceId: "PC1", interfaceName: "eth0" },
        b: { deviceId: "SW1", interfaceName: "Gi0/1" },
        latencyMs: 1,
      },
      {
        id: "L2",
        a: { deviceId: "SW1", interfaceName: "Gi0/2" },
        b: { deviceId: "SW2", interfaceName: "Gi0/2" },
        latencyMs: 1,
      },
      {
        id: "L3",
        a: { deviceId: "SW2", interfaceName: "Gi0/1" },
        b: { deviceId: "PC2", interfaceName: "eth0" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    SW1: "enable\nconfigure terminal\nhostname SW1\nend",
    SW2: "enable\nconfigure terminal\nhostname SW2\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_up", device: "PC1", interface: "eth0" },
    { type: "interface_up", device: "PC2", interface: "eth0" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.10.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.10.20" },
    { type: "ping", from: "PC1", to: "192.168.10.20", expect: "success" },
  ],
  grading: { passScore: 80 },
};
