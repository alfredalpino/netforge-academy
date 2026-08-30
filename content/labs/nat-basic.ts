import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Inside LAN + outside server — PAT overload on R1 lets PC1 reach the server. */
export const NAT_BASIC_LAB: LabSpec = {
  schemaVersion: 1,
  id: "nat-basic",
  title: "NAT PAT Overload",
  difficulty: "intermediate",
  estimatedMinutes: 25,
  objectives: [
    "Address R1 Gi0/0 (inside 192.168.1.0/24) and Gi0/1 (outside 10.0.0.0/30)",
    "Configure PC1 with IP + default gateway; configure Server on the outside link",
    "Mark inside/outside interfaces and create ACL 1 permitting the inside subnet",
    "Apply `ip nat inside source list 1 interface Gi0/1 overload`",
    "Verify PC1 can ping the outside server (source appears as R1 outside IP)",
  ],
  topology: {
    nodes: [
      {
        id: "R1",
        name: "R1",
        type: "router",
        interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }],
        position: { x: 320, y: 160 },
      },
      {
        id: "PC1",
        name: "PC1",
        type: "host",
        interfaces: [{ name: "eth0" }],
        position: { x: 80, y: 160 },
      },
      {
        id: "Server",
        name: "Server",
        type: "server",
        interfaces: [{ name: "eth0" }],
        position: { x: 560, y: 160 },
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
        b: { deviceId: "Server", interfaceName: "eth0" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    R1: "enable\nconfigure terminal\nhostname R1\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    Server: "enable\nconfigure terminal\nhostname Server\nend",
  },
  checks: [
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "192.168.1.1" },
    { type: "interface_ip", device: "R1", interface: "Gi0/1", address: "10.0.0.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.1.10" },
    { type: "interface_ip", device: "Server", interface: "eth0", address: "10.0.0.2" },
    { type: "ping", from: "PC1", to: "10.0.0.2", expect: "success" },
  ],
  grading: { passScore: 80 },
};
