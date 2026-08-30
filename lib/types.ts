export type Depth = "L2" | "L3" | "L3-L4" | "L4";

export type LearningStep =
  | "theory"
  | "packet-flow"
  | "configuration"
  | "lab"
  | "break-it"
  | "troubleshoot"
  | "design"
  | "explain";

export interface Module {
  id: string;
  title: string;
  phaseId: string;
  depth: Depth;
  competency: string;
  topics: string[];
  commands?: string[];
  labObjective?: string;
  breakScenarios?: string[];
  exitCriteria?: string[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  weeks: string;
  objective: string;
  modules: Module[];
}

export interface DailyBlock {
  id: string;
  start: string;
  end: string;
  title: string;
  focus: string;
  activities: string[];
}

export interface WeeklyDay {
  day: string;
  focus: string;
  emphasis: string[];
}

export interface CertificationGate {
  id: string;
  name: string;
  order: number;
  prerequisites: string[];
  competencies: string[];
}

export interface DayPlan {
  week: number;
  day: number;
  dayOfWeek: string;
  phase: string;
  module: string;
  title: string;
  theory: string[];
  config: string[];
  lab: string;
  breakFix: string[];
  recall: string[];
  gate?: string;
}

export interface AccountCheckIn {
  studied: boolean;
  hours?: number;
  reflection?: string;
}

export interface DrillStats {
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
  totalTimeSeconds?: number;
  averageSeconds?: number;
}

export type ResourceType =
  | "documentation"
  | "book"
  | "video"
  | "lab"
  | "cert-prep"
  | "tool"
  | "community";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
  phases?: string[];
  tags: string[];
  free?: boolean;
}

export interface ProgressState {
  startDate: string;
  currentWeek: number;
  currentDay: number;
  completedDays: string[];
  completedModules: string[];
  completedBlocks: Record<string, string[]>;
  streak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyHistory: string[];
  weeklyGoal: string;
  checkIns: Record<string, AccountCheckIn>;
  drillStats: DrillStats;
  labSetupComplete: string[];
  notes: Record<string, string>;
  currentModuleId: string;
  completedTours: string[];
  /** Browser simulator labs passed at ≥ pass score */
  completedSimulatorLabs: string[];
  lastBackupDate: string;
}

export const DEFAULT_PROGRESS: ProgressState = {
  startDate: new Date().toISOString().split("T")[0],
  currentWeek: 1,
  currentDay: 1,
  completedDays: [],
  completedModules: [],
  completedBlocks: {},
  streak: 0,
  longestStreak: 0,
  lastStudyDate: "",
  studyHistory: [],
  weeklyGoal: "",
  checkIns: {},
  drillStats: { bestStreak: 0, totalCorrect: 0, totalAttempts: 0 },
  labSetupComplete: [],
  notes: {},
  currentModuleId: "m0-foundation",
  completedTours: [],
  completedSimulatorLabs: [],
  lastBackupDate: "",
};
