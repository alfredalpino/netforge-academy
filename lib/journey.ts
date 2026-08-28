import { PHASES } from "./curriculum";
import type { Module } from "./types";

export interface JourneyMilestone {
  id: string;
  moduleId: string;
  title: string;
  shortLabel: string;
  phaseId: string;
  week: number;
  day: number;
}

/** Ordered curriculum milestones — jump from Linux → OSPF → Azure seamlessly */
export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  { id: "linux", moduleId: "m0-foundation", title: "Engineering Foundations", shortLabel: "Linux", phaseId: "phase-0", week: 1, day: 1 },
  { id: "architecture", moduleId: "m1-architecture", title: "Network Architecture", shortLabel: "OSI/TCP", phaseId: "phase-1", week: 2, day: 1 },
  { id: "ethernet", moduleId: "m2-ethernet", title: "Ethernet & Switching", shortLabel: "Ethernet", phaseId: "phase-1", week: 2, day: 4 },
  { id: "subnetting", moduleId: "m3-subnetting", title: "IP & Subnetting", shortLabel: "Subnetting", phaseId: "phase-1", week: 3, day: 1 },
  { id: "tcpip", moduleId: "m4-tcpip", title: "Core TCP/IP", shortLabel: "TCP/IP", phaseId: "phase-1", week: 4, day: 1 },
  { id: "vlan", moduleId: "m5-vlan", title: "VLANs", shortLabel: "VLANs", phaseId: "phase-2", week: 5, day: 1 },
  { id: "stp", moduleId: "m6-stp", title: "STP", shortLabel: "STP", phaseId: "phase-2", week: 6, day: 1 },
  { id: "routing", moduleId: "m7-routing", title: "Routing Fundamentals", shortLabel: "Routing", phaseId: "phase-3", week: 8, day: 1 },
  { id: "ospf", moduleId: "m8-ospf", title: "OSPF", shortLabel: "OSPF", phaseId: "phase-3", week: 9, day: 1 },
  { id: "advanced-routing", moduleId: "m9-advanced-routing", title: "Advanced Routing", shortLabel: "BGP/EIGRP", phaseId: "phase-3", week: 10, day: 1 },
  { id: "services", moduleId: "m10-services", title: "Network Services", shortLabel: "DNS/DHCP", phaseId: "phase-4", week: 12, day: 1 },
  { id: "wan", moduleId: "m11-wan", title: "WAN & Internet", shortLabel: "WAN", phaseId: "phase-4", week: 13, day: 1 },
  { id: "wireless", moduleId: "m12-wireless-qos", title: "Wireless & QoS", shortLabel: "Wireless", phaseId: "phase-4", week: 14, day: 1 },
  { id: "sec-fundamentals", moduleId: "m13-security-fundamentals", title: "Security Fundamentals", shortLabel: "Security", phaseId: "phase-5", week: 15, day: 1 },
  { id: "network-security", moduleId: "m14-network-security", title: "Network Security", shortLabel: "ACLs", phaseId: "phase-5", week: 16, day: 1 },
  { id: "firewall-vpn", moduleId: "m15-firewall-vpn", title: "Firewalls & VPN", shortLabel: "VPN", phaseId: "phase-5", week: 17, day: 1 },
  { id: "fortinet", moduleId: "m16-fortinet", title: "Fortinet NSE 4", shortLabel: "FortiGate", phaseId: "phase-5", week: 19, day: 1 },
  { id: "enterprise", moduleId: "m17-enterprise", title: "Enterprise Networking", shortLabel: "Enterprise", phaseId: "phase-6", week: 20, day: 1 },
  { id: "monitoring", moduleId: "m18-monitoring", title: "Monitoring", shortLabel: "Monitoring", phaseId: "phase-6", week: 21, day: 1 },
  { id: "automation", moduleId: "m19-automation", title: "Automation & SDN", shortLabel: "Automation", phaseId: "phase-6", week: 23, day: 1 },
  { id: "cloud", moduleId: "m20-cloud", title: "Cloud Fundamentals", shortLabel: "Cloud", phaseId: "phase-7", week: 24, day: 1 },
  { id: "azure-admin", moduleId: "m21-azure-admin", title: "Azure Administration", shortLabel: "AZ-104", phaseId: "phase-7", week: 25, day: 1 },
  { id: "azure-net", moduleId: "m22-azure-networking", title: "Azure Networking", shortLabel: "Azure Net", phaseId: "phase-8", week: 26, day: 1 },
  { id: "azure-conn", moduleId: "m23-azure-connectivity", title: "Azure Connectivity", shortLabel: "Hybrid", phaseId: "phase-8", week: 27, day: 1 },
  { id: "azure-capstone", moduleId: "m24-azure-delivery", title: "AZ-700 Capstone", shortLabel: "AZ-700", phaseId: "phase-8", week: 28, day: 1 },
];

export const TOTAL_JOURNEY_DAYS = 28 * 7;
export const TOTAL_LAB_STEPS = 20;

export function getMilestoneByModule(moduleId: string): JourneyMilestone | undefined {
  return JOURNEY_MILESTONES.find((m) => m.moduleId === moduleId);
}

export function getMilestoneAtPosition(week: number, day: number): JourneyMilestone {
  let current = JOURNEY_MILESTONES[0];
  const position = (week - 1) * 7 + day;
  for (const m of JOURNEY_MILESTONES) {
    const mPos = (m.week - 1) * 7 + m.day;
    if (mPos <= position) current = m;
    else break;
  }
  return current;
}

export function getNextMilestone(moduleId: string): JourneyMilestone | undefined {
  const idx = JOURNEY_MILESTONES.findIndex((m) => m.moduleId === moduleId);
  return idx >= 0 && idx < JOURNEY_MILESTONES.length - 1
    ? JOURNEY_MILESTONES[idx + 1]
    : undefined;
}

export function getMilestoneIndex(moduleId: string): number {
  return JOURNEY_MILESTONES.findIndex((m) => m.moduleId === moduleId);
}

export function getCurriculumPositionPercent(week: number, day: number): number {
  const pos = (week - 1) * 7 + day;
  return Math.round((pos / TOTAL_JOURNEY_DAYS) * 100);
}

export function getAllModules(): Module[] {
  return PHASES.flatMap((p) => p.modules);
}
