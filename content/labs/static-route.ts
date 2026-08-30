import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Two routers, two LANs — static routes required for end-to-end ping. */
export const STATIC_ROUTE_LAB: LabSpec = {
  schemaVersion: 1,
  id: "static-route",
  title: "Static Inter-Network Routing",
  difficulty: "intermediate",
  estimatedMinutes: 25,
  objectives: [
    "Address R1↔R2 point-to-point link (10.0.0.0/30) and both LAN interfaces",
    "Configure PC1 (192.168.1.0/24) and PC2 (192.168.2.0/24) with default gateways",
    "Add static routes on R1 and R2 for the remote LAN",
    "Verify PC1 can ping PC2 across both routers",
  ],
  topology: {
    nodes: [
      {
        id: "R1",
        name: "R1",
        type: "router",
        interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }],
        position: { x: 240, y: 160 },
      },
      {
        id: "R2",
        name: "R2",
        type: "router",
        interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }],
        position: { x: 440, y: 160 },
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
        position: { x: 600, y: 160 },
      },
    ],
    links: [
      {
        id: "L1",
        a: { deviceId: "PC1", interfaceName: "eth0" },
        b: { deviceId: "R1", interfaceName: "Gi0/0" },
        latencyMs: 1,
      },
      {
        id: "L2",
        a: { deviceId: "R1", interfaceName: "Gi0/1" },
        b: { deviceId: "R2", interfaceName: "Gi0/0" },
        latencyMs: 1,
      },
      {
        id: "L3",
        a: { deviceId: "R2", interfaceName: "Gi0/1" },
        b: { deviceId: "PC2", interfaceName: "eth0" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    R1: "enable\nconfigure terminal\nhostname R1\nend",
    R2: "enable\nconfigure terminal\nhostname R2\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "192.168.1.1" },
    { type: "interface_ip", device: "R1", interface: "Gi0/1", address: "10.0.0.1" },
    { type: "interface_ip", device: "R2", interface: "Gi0/0", address: "10.0.0.2" },
    { type: "interface_ip", device: "R2", interface: "Gi0/1", address: "192.168.2.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.1.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.2.10" },
    { type: "ping", from: "PC1", to: "192.168.2.10", expect: "success" },
  ],
  grading: { passScore: 80 },
};
