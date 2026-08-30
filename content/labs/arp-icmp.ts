import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Two hosts on the same L2 segment — ARP resolution then ICMP echo. */
export const ARP_ICMP_LAB: LabSpec = {
  schemaVersion: 1,
  id: "arp-icmp",
  title: "ARP & ICMP (Host-to-Host)",
  difficulty: "beginner",
  estimatedMinutes: 15,
  objectives: [
    "Address PC1 and PC2 on the same subnet through SW1",
    "Bring host interfaces up",
    "Verify PC1 can ping PC2 (watch ARP + ICMP in Packets tab)",
  ],
  topology: {
    nodes: [
      {
        id: "SW1",
        name: "SW1",
        type: "switch",
        interfaces: [{ name: "Gi0/1" }, { name: "Gi0/2" }],
        position: { x: 320, y: 160 },
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
        position: { x: 520, y: 160 },
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
        b: { deviceId: "PC2", interfaceName: "eth0" },
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
    { type: "interface_up", device: "PC1", interface: "eth0" },
    { type: "interface_up", device: "PC2", interface: "eth0" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "10.0.0.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "10.0.0.20" },
    { type: "ping", from: "PC1", to: "10.0.0.20", expect: "success" },
  ],
  grading: { passScore: 80 },
};
