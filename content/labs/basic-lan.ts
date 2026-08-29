import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Basic LAN — PC1 through SW1 to R1 (catalog P0 lab). */
export const BASIC_LAN_LAB: LabSpec = {
  schemaVersion: 1,
  id: "basic-lan",
  title: "Basic LAN Connectivity",
  difficulty: "beginner",
  estimatedMinutes: 15,
  objectives: [
    "Assign IP addresses on R1 and PC1",
    "Bring interfaces up",
    "Verify PC1 can ping R1",
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
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "10.0.0.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "10.0.0.10" },
    { type: "ping", from: "PC1", to: "10.0.0.1", expect: "success" },
  ],
  grading: { passScore: 80 },
};
