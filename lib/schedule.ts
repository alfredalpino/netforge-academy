import type { DailyBlock, WeeklyDay } from "./types";

export const DAILY_BLOCKS: DailyBlock[] = [
  {
    id: "block-1",
    start: "08:00",
    end: "10:00",
    title: "Deep Theory",
    focus: "Architecture, protocols, packet behavior, RFC concepts",
    activities: ["Study diagrams", "Read RFC concepts", "Understand design rationale", "No labs yet"],
  },
  {
    id: "block-2",
    start: "10:30",
    end: "12:00",
    title: "Configuration",
    focus: "CLI practice — Cisco IOS, Linux, FortiOS, Azure CLI, PowerShell",
    activities: ["Configure devices", "Verify with show commands", "Document configs"],
  },
  {
    id: "block-3",
    start: "13:00",
    end: "15:00",
    title: "Lab",
    focus: "Build something — not videos, not notes",
    activities: ["Packet Tracer / EVE-NG lab", "Wireshark capture", "Topology build"],
  },
  {
    id: "block-4",
    start: "15:30",
    end: "17:00",
    title: "Break / Fix",
    focus: "Intentionally break and troubleshoot",
    activities: [
      "Break VLAN, route, ACL, DNS, DHCP",
      "Break OSPF, VPN, firewall, Azure NSG/UDR",
      "Use systematic troubleshooting methodology",
    ],
  },
  {
    id: "block-5",
    start: "19:00",
    end: "20:00",
    title: "Recall + Questions",
    focus: "From memory — no textbook",
    activities: ["Explain concepts aloud", "Draw diagrams", "Configure from memory", "Answer interview questions"],
  },
  {
    id: "block-6",
    start: "20:15",
    end: "21:15",
    title: "Cert / Interview (Optional)",
    focus: "Exam prep and interview scenarios",
    activities: ["Practice questions", "Command recall", "Design scenarios"],
  },
];

export const WEEKLY_RHYTHM: WeeklyDay[] = [
  {
    day: "Monday",
    focus: "Theory + Configuration",
    emphasis: ["New concepts", "CLI configuration", "Foundation building"],
  },
  {
    day: "Tuesday",
    focus: "Theory + Lab",
    emphasis: ["Deep dive topics", "Hands-on lab build", "Wireshark analysis"],
  },
  {
    day: "Wednesday",
    focus: "Theory + Lab",
    emphasis: ["Continue module", "Expand topology", "Verify with show/debug"],
  },
  {
    day: "Thursday",
    focus: "Advanced + Troubleshooting",
    emphasis: ["Complex scenarios", "Break/fix exercises", "Edge cases"],
  },
  {
    day: "Friday",
    focus: "Integrated Lab",
    emphasis: ["Large multi-concept lab", "Combine week's topics", "Document learnings"],
  },
  {
    day: "Saturday",
    focus: "Assessment Day",
    emphasis: [
      "1 hr theory test",
      "1 hr configuration test",
      "2 hr troubleshooting lab",
      "1 hr interview practice",
    ],
  },
  {
    day: "Sunday",
    focus: "Recovery + Review",
    emphasis: [
      "2–3 hours only",
      "Subnetting drills",
      "Flashcards & packet analysis",
      "Review previous mistakes",
      "Architecture diagrams",
    ],
  },
];

export const THEORY_PRACTICE_RATIO = [
  { phase: "Early (0–2)", theory: 60, practice: 40 },
  { phase: "Middle (3–5)", theory: 40, practice: 60 },
  { phase: "Advanced (6–8)", theory: 30, practice: 70 },
  { phase: "Engineering", learn: 20, configure: 20, troubleshoot: 40, design: 20 },
];

export const TOTAL_WEEKS = 28;
export const HOURS_PER_DAY = "6–8";
export const TOTAL_HOURS = "1,200–1,500";

export function getDayOfWeek(week: number, day: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[(day - 1) % 7];
}

export function getWeekPhase(week: number): string {
  if (week === 1) return "Phase 0 — Engineering Foundation";
  if (week <= 4) return "Phase 1 — Network Fundamentals";
  if (week <= 7) return "Phase 2 — Switching";
  if (week <= 11) return "Phase 3 — Routing";
  if (week <= 14) return "Phase 4 — Services/Enterprise";
  if (week <= 18) return "Phase 5 — Security";
  if (week === 19) return "Fortinet NSE 4 Intensive";
  if (week <= 22) return "Phase 6 — Enterprise Engineering";
  if (week === 23) return "Automation/SDN";
  if (week <= 25) return "Phase 7 — Azure/AZ-104";
  return "Phase 8 — AZ-700/L3 Engineering";
}
