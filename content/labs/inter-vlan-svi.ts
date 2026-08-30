import type { LabSpec } from "@/simulation/grading/lab-schema";

/** L3 switch with SVIs — route between VLAN 10 and VLAN 20 without an external router. */
export const INTER_VLAN_SVI_LAB: LabSpec = {
  schemaVersion: 1,
  id: "inter-vlan-svi",
  title: "Inter-VLAN Routing (SVI)",
  difficulty: "intermediate",
  estimatedMinutes: 25,
  objectives: [
    "Configure access ports: PC1 VLAN 10, PC2 VLAN 20",
    "Create SVIs Vlan10 and Vlan20 with .1 gateway addresses",
    "Enable `ip routing` on the multilayer switch",
    "Set PC default gateways and verify cross-VLAN ping",
  ],
  topology: {
    nodes: [
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
        position: { x: 120, y: 160 },
      },
      {
        id: "PC2",
        name: "PC2",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 600, y: 160 },
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
        a: { deviceId: "PC2", interfaceName: "eth0" },
        b: { deviceId: "SW1", interfaceName: "Gi0/2" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    SW1: "enable\nconfigure terminal\nhostname SW1\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_ip", device: "SW1", interface: "Vlan10", address: "192.168.10.1" },
    { type: "interface_ip", device: "SW1", interface: "Vlan20", address: "192.168.20.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.10.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.20.20" },
    { type: "ping", from: "PC1", to: "192.168.10.1", expect: "success" },
    { type: "ping", from: "PC1", to: "192.168.20.20", expect: "success" },
  ],
  grading: { passScore: 80 },
};
