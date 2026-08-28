import type { CertificationGate } from "./types";
import type { ProgressState } from "./types";
import { CERTIFICATION_GATES, getPhase } from "./curriculum";

export interface GateCriterion {
  id: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface GateProgress {
  gate: CertificationGate;
  criteria: GateCriterion[];
  percent: number;
  ready: boolean;
}

function phaseModuleIds(phaseId: string): string[] {
  return getPhase(phaseId)?.modules.map((m) => m.id) ?? [];
}

function phaseCompletionPercent(completedModules: string[], phaseIds: string[]): number {
  const moduleIds = phaseIds.flatMap(phaseModuleIds);
  if (moduleIds.length === 0) return 0;
  const done = moduleIds.filter((id) => completedModules.includes(id)).length;
  return Math.round((done / moduleIds.length) * 100);
}

function subnettingReady(progress: ProgressState): GateCriterion {
  const { drillStats } = progress;
  const accuracy =
    drillStats.totalAttempts > 0
      ? Math.round((drillStats.totalCorrect / drillStats.totalAttempts) * 100)
      : 0;
  const met = drillStats.bestStreak >= 5 || (drillStats.totalAttempts >= 10 && accuracy >= 80);
  return {
    id: "subnetting",
    label: "Subnetting at speed",
    met,
    detail: met
      ? `Best streak ${drillStats.bestStreak}, ${accuracy}% accuracy`
      : `Need 5+ streak or 80%+ over 10 attempts (currently ${drillStats.bestStreak} streak, ${accuracy}%)`,
  };
}

function wiresharkReady(progress: ProgressState): GateCriterion {
  const wiresharkSteps = ["pa-wireshark", "pa-tcpdump", "pa-filters", "pa-review"];
  const done = wiresharkSteps.filter((id) => progress.labSetupComplete.includes(id)).length;
  const met = done >= 2;
  return {
    id: "wireshark",
    label: "Wireshark proficiency",
    met,
    detail: met
      ? `${done}/${wiresharkSteps.length} packet analysis steps complete`
      : `Complete at least 2 packet analysis lab steps (${done}/${wiresharkSteps.length})`,
  };
}

function phasesReady(
  completedModules: string[],
  phaseIds: string[],
  label: string
): GateCriterion {
  const percent = phaseCompletionPercent(completedModules, phaseIds);
  const met = percent >= 100;
  return {
    id: `phases-${phaseIds.join("-")}`,
    label,
    met,
    detail: met ? "All modules complete" : `${percent}% of required modules complete`,
  };
}

export function getGateProgress(progress: ProgressState): GateProgress[] {
  return CERTIFICATION_GATES.map((gate) => {
    const criteria = getGateCriteria(gate.id, progress);
    const metCount = criteria.filter((c) => c.met).length;
    const percent = criteria.length > 0 ? Math.round((metCount / criteria.length) * 100) : 0;
    return {
      gate,
      criteria,
      percent,
      ready: criteria.length > 0 && criteria.every((c) => c.met),
    };
  });
}

function getGateCriteria(gateId: string, progress: ProgressState): GateCriterion[] {
  const { completedModules } = progress;

  switch (gateId) {
    case "ccna":
      return [
        phasesReady(completedModules, ["phase-0", "phase-1", "phase-2", "phase-3"], "Phase 0–3 complete"),
        subnettingReady(progress),
        wiresharkReady(progress),
      ];
    case "security-plus":
      return [
        phasesReady(completedModules, ["phase-5"], "Phase 5 security fundamentals"),
        {
          id: "security-modules",
          label: "Security module competency",
          met: completedModules.some((id) => id.includes("security") || id.includes("fortinet")),
          detail: "Complete Phase 5 security-related modules",
        },
      ];
    case "nse4":
      return [
        phasesReady(completedModules, ["phase-5"], "Phase 5 Fortinet module"),
        {
          id: "fortigate-lab",
          label: "FortiGate lab setup",
          met: progress.labSetupComplete.includes("fa-fortigate"),
          detail: progress.labSetupComplete.includes("fa-fortigate")
            ? "FortiGate VM step complete"
            : "Mark FortiGate VM setup complete in Lab Stack",
        },
      ];
    case "az104":
      return [
        phasesReady(completedModules, ["phase-7"], "Phase 7 complete"),
        {
          id: "azure-lab",
          label: "Azure lab environment",
          met: progress.labSetupComplete.includes("fa-azure"),
          detail: progress.labSetupComplete.includes("fa-azure")
            ? "Azure account configured"
            : "Set up Azure free account in Lab Stack",
        },
      ];
    case "az700":
      return [
        {
          id: "az104-prep",
          label: "AZ-104 foundation",
          met: getGateProgressForId("az104", progress).ready,
          detail: "Complete AZ-104 gate requirements first",
        },
        phasesReady(completedModules, ["phase-7", "phase-8"], "Phase 7–8 networking depth"),
        subnettingReady(progress),
      ];
    default:
      return [];
  }
}

function getGateProgressForId(gateId: string, progress: ProgressState): GateProgress {
  const gate = CERTIFICATION_GATES.find((g) => g.id === gateId)!;
  const criteria = getGateCriteria(gateId, progress);
  const metCount = criteria.filter((c) => c.met).length;
  const percent = criteria.length > 0 ? Math.round((metCount / criteria.length) * 100) : 0;
  return {
    gate,
    criteria,
    percent,
    ready: criteria.length > 0 && criteria.every((c) => c.met),
  };
}

export function getGateProgressById(gateId: string, progress: ProgressState): GateProgress | undefined {
  const gate = CERTIFICATION_GATES.find((g) => g.id === gateId);
  if (!gate) return undefined;
  return getGateProgressForId(gateId, progress);
}
