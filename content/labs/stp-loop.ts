import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Three switches in a triangle — STP blocks one redundant link; PCs ping on same VLAN. */
export const STP_LOOP_LAB: LabSpec = {
  schemaVersion: 1,
  id: "stp-loop",
  title: "Spanning Tree Loop Prevention",
  difficulty: "intermediate",
  estimatedMinutes: 20,
  objectives: [
    "Observe automatic STP root election (lowest switch ID wins — SW1)",
    "Run `show spanning-tree` on each switch — one inter-switch port should be BLK",
    "Address PC1 and PC2 on 192.168.1.0/24 and verify end-to-end ping",
    "Confirm traffic uses the spanning tree path, not the blocked link",
  ],
  topology: {
    nodes: [
      {
        id: "SW1",
        name: "SW1",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }, { name: "Gi0/3" }],
        position: { x: 320, y: 80 },
      },
      {
        id: "SW2",
        name: "SW2",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
        position: { x: 120, y: 240 },
      },
      {
        id: "SW3",
        name: "SW3",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }, { name: "Gi0/3" }],
        position: { x: 520, y: 240 },
      },
      {
        id: "PC1",
        name: "PC1",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 320, y: 280 },
      },
      {
        id: "PC2",
        name: "PC2",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 680, y: 280 },
      },
    ],
    links: [
      {
        id: "L1",
        a: { deviceId: "SW1", interfaceName: "Gi0/1" },
        b: { deviceId: "SW2", interfaceName: "Gi0/1" },
        latencyMs: 1,
      },
      {
        id: "L2",
        a: { deviceId: "SW2", interfaceName: "Gi0/2" },
        b: { deviceId: "SW3", interfaceName: "Gi0/1" },
        latencyMs: 1,
      },
      {
        id: "L3",
        a: { deviceId: "SW3", interfaceName: "Gi0/2" },
        b: { deviceId: "SW1", interfaceName: "Gi0/2" },
        latencyMs: 1,
      },
      {
        id: "L4",
        a: { deviceId: "PC1", interfaceName: "eth0" },
        b: { deviceId: "SW1", interfaceName: "Gi0/3" },
        latencyMs: 1,
      },
      {
        id: "L5",
        a: { deviceId: "PC2", interfaceName: "eth0" },
        b: { deviceId: "SW3", interfaceName: "Gi0/3" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    SW1: "enable\nconfigure terminal\nhostname SW1\nend",
    SW2: "enable\nconfigure terminal\nhostname SW2\nend",
    SW3: "enable\nconfigure terminal\nhostname SW3\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_up", device: "PC1", interface: "eth0" },
    { type: "interface_up", device: "PC2", interface: "eth0" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.1.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.1.20" },
    { type: "ping", from: "PC1", to: "192.168.1.20", expect: "success" },
  ],
  grading: { passScore: 80 },
};
