import type { ProgressState } from "./types";
import { PHASES, getModule } from "./curriculum";
import { LAB_LIST } from "@/content/labs";
import { getGateProgress } from "./gates";

export type MilestoneEvent =
  | { type: "module"; moduleId: string; title: string }
  | { type: "phase"; phaseId: string; title: string }
  | { type: "sim-labs-complete" }
  | { type: "gate-ready"; gateId: string; title: string }
  | { type: "drill-streak"; streak: number };

const DRILL_STREAK_MILESTONES = [5, 10, 20] as const;

export function detectMilestoneEvents(
  prev: ProgressState,
  next: ProgressState,
): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];

  for (const moduleId of next.completedModules) {
    if (!prev.completedModules.includes(moduleId)) {
      const mod = getModule(moduleId);
      events.push({
        type: "module",
        moduleId,
        title: mod?.module.title ?? moduleId,
      });
    }
  }

  for (const phase of PHASES) {
    const wasComplete = phase.modules.every((m) => prev.completedModules.includes(m.id));
    const nowComplete = phase.modules.every((m) => next.completedModules.includes(m.id));
    if (!wasComplete && nowComplete) {
      events.push({ type: "phase", phaseId: phase.id, title: phase.title });
    }
  }

  const labTotal = LAB_LIST.length;
  if (
    prev.completedSimulatorLabs.length < labTotal &&
    next.completedSimulatorLabs.length >= labTotal
  ) {
    events.push({ type: "sim-labs-complete" });
  }

  const prevReady = new Set(getGateProgress(prev).filter((g) => g.ready).map((g) => g.gate.id));
  for (const gate of getGateProgress(next)) {
    if (gate.ready && !prevReady.has(gate.gate.id)) {
      events.push({ type: "gate-ready", gateId: gate.gate.id, title: gate.gate.name });
    }
  }

  for (const streak of DRILL_STREAK_MILESTONES) {
    if (prev.drillStats.bestStreak < streak && next.drillStats.bestStreak >= streak) {
      events.push({ type: "drill-streak", streak });
    }
  }

  return events;
}

export function milestoneMessage(event: MilestoneEvent): string {
  switch (event.type) {
    case "module":
      return `Module complete — ${event.title}`;
    case "phase":
      return `Phase complete — ${event.title}`;
    case "sim-labs-complete":
      return `All ${LAB_LIST.length} simulator labs passed`;
    case "gate-ready":
      return `Gate ready — ${event.title}`;
    case "drill-streak":
      return `${event.streak}-answer drill streak`;
    default:
      return "Milestone reached";
  }
}

export function shouldCelebrateWithConfetti(event: MilestoneEvent): boolean {
  switch (event.type) {
    case "phase":
    case "sim-labs-complete":
    case "gate-ready":
      return true;
    case "drill-streak":
      return event.streak >= 10;
    default:
      return false;
  }
}
