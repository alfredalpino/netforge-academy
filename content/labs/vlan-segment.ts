import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Two hosts on different access VLANs + trunk to router — wrong VLAN fails, correct path works. */
export const VLAN_SEGMENT_LAB: LabSpec = {
  schemaVersion: 1,
  id: "vlan-segment",
  title: "VLAN Segmentation",
  difficulty: "beginner",
  estimatedMinutes: 20,
  objectives: [
    "Put PC1 on VLAN 10 and PC2 on VLAN 20 (access ports)",
    "Trunk SW1↔R1 allowing 10,20",
    "Address R1 subinterfaces conceptually via physical Gi0/0 + host gateways",
    "Verify PC1 can ping R1 on VLAN 10 path; PC1 cannot reach PC2 L2-directly",
  ],
  topology: {
    nodes: [
      {
        id: "R1",
        name: "R1",
        type: "router",
        interfaces: [{ name: "Gi0/0" }],
        position: { x: 80, y: 180 },
      },
      {
        id: "SW1",
        name: "SW1",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }, { name: "Gi0/3" }],
        position: { x: 320, y: 180 },
      },
      {
        id: "PC1",
        name: "PC1",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 560, y: 80 },
      },
      {
        id: "PC2",
        name: "PC2",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 560, y: 280 },
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
      {
        id: "L3",
        a: { deviceId: "SW1", interfaceName: "Gi0/3" },
        b: { deviceId: "PC2", interfaceName: "eth0" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    R1: "enable\nconfigure terminal\nhostname R1\nend",
    SW1: "enable\nconfigure terminal\nhostname SW1\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_up", device: "PC1", interface: "eth0" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "10.10.10.10" },
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "10.10.10.1" },
    { type: "ping", from: "PC1", to: "10.10.10.1", expect: "success" },
    { type: "ping", from: "PC1", to: "10.20.20.20", expect: "fail" },
  ],
  grading: { passScore: 80 },
};
