import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Router-on-a-stick — subinterfaces route between VLAN 10 and VLAN 20. */
export const INTER_VLAN_ROUTING_LAB: LabSpec = {
  schemaVersion: 1,
  id: "inter-vlan-routing",
  title: "Inter-VLAN Routing (Router-on-a-Stick)",
  difficulty: "intermediate",
  estimatedMinutes: 25,
  objectives: [
    "Configure SW1 access ports: PC1 VLAN 10, PC2 VLAN 20",
    "Trunk SW1 Gi0/1 to R1 allowing VLANs 10 and 20",
    "Create R1 subinterfaces Gi0/0.10 and Gi0/0.20 with dot1Q encapsulation",
    "Address subinterfaces as each VLAN gateway (.1) and set PC default gateways",
    "Verify PC1 can ping PC2 across VLANs through the router",
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
    { type: "interface_ip", device: "R1", interface: "Gi0/0.10", address: "192.168.10.1" },
    { type: "interface_ip", device: "R1", interface: "Gi0/0.20", address: "192.168.20.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.10.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.20.20" },
    { type: "ping", from: "PC1", to: "192.168.10.1", expect: "success" },
    { type: "ping", from: "PC1", to: "192.168.20.20", expect: "success" },
  ],
  grading: { passScore: 80 },
};
