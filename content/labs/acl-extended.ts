import type { LabSpec } from "@/simulation/grading/lab-schema";

/** Extended ACL — deny ICMP between subnets; permit other IP protocols. */
export const ACL_EXTENDED_LAB: LabSpec = {
  schemaVersion: 1,
  id: "acl-extended",
  title: "Extended ACL (ICMP Filter)",
  difficulty: "intermediate",
  estimatedMinutes: 25,
  objectives: [
    "Address R1 Gi0/0 (192.168.1.0/24) and Gi0/1 (192.168.2.0/24)",
    "Configure PC1 and PC2 with IPs and default gateways",
    "Create extended ACL 100: deny icmp from 192.168.1.0/24 to 192.168.2.0/24",
    "Add `access-list 100 permit ip any any` and apply outbound on Gi0/1",
    "Verify PC1→PC2 ping fails but PC1→192.168.1.1 succeeds",
  ],
  topology: {
    nodes: [
      {
        id: "R1",
        name: "R1",
        type: "router",
        interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }],
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
        b: { deviceId: "R1", interfaceName: "Gi0/0" },
        latencyMs: 1,
      },
      {
        id: "L2",
        a: { deviceId: "PC2", interfaceName: "eth0" },
        b: { deviceId: "R1", interfaceName: "Gi0/1" },
        latencyMs: 1,
      },
    ],
  },
  startupConfig: {
    R1: "enable\nconfigure terminal\nhostname R1\nend",
    PC1: "enable\nconfigure terminal\nhostname PC1\nend",
    PC2: "enable\nconfigure terminal\nhostname PC2\nend",
  },
  checks: [
    { type: "interface_ip", device: "R1", interface: "Gi0/0", address: "192.168.1.1" },
    { type: "interface_ip", device: "R1", interface: "Gi0/1", address: "192.168.2.1" },
    { type: "interface_ip", device: "PC1", interface: "eth0", address: "192.168.1.10" },
    { type: "interface_ip", device: "PC2", interface: "eth0", address: "192.168.2.10" },
    { type: "ping", from: "PC1", to: "192.168.2.10", expect: "fail" },
    { type: "ping", from: "PC1", to: "192.168.1.1", expect: "success" },
  ],
  grading: { passScore: 80 },
};
