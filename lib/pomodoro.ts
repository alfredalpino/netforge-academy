export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface PomodoroPreset {
  id: string;
  name: string;
  description: string;
  settings: PomodoroSettings;
}

export const POMODORO_PRESETS: PomodoroPreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "25 min work · 5 min break",
    settings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 },
  },
  {
    id: "deep",
    name: "Deep Focus",
    description: "50 min work · 10 min break",
    settings: { workMinutes: 50, shortBreakMinutes: 10, longBreakMinutes: 20, sessionsBeforeLongBreak: 3 },
  },
  {
    id: "sprint",
    name: "Sprint",
    description: "15 min work · 3 min break",
    settings: { workMinutes: 15, shortBreakMinutes: 3, longBreakMinutes: 10, sessionsBeforeLongBreak: 4 },
  },
  {
    id: "custom",
    name: "Custom",
    description: "Set your own intervals",
    settings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4 },
  },
];

export type PomodoroPhase = "idle" | "work" | "short_break" | "long_break";

export const POMODORO_SETTINGS_KEY = "netforge-pomodoro-settings";
export const POMODORO_PRESET_KEY = "netforge-pomodoro-preset";
export const POMODORO_BUBBLE_POS_KEY = "netforge-pomodoro-bubble-pos";

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getPhaseLabel(phase: PomodoroPhase): string {
  switch (phase) {
    case "work":
      return "Focus";
    case "short_break":
      return "Short Break";
    case "long_break":
      return "Long Break";
    default:
      return "Ready";
  }
}

export function getPhaseMinutes(phase: PomodoroPhase, settings: PomodoroSettings): number {
  switch (phase) {
    case "work":
      return settings.workMinutes;
    case "short_break":
      return settings.shortBreakMinutes;
    case "long_break":
      return settings.longBreakMinutes;
    default:
      return settings.workMinutes;
  }
}

export function loadPomodoroSettings(): { presetId: string; settings: PomodoroSettings } {
  if (typeof window === "undefined") {
    return { presetId: "classic", settings: POMODORO_PRESETS[0].settings };
  }
  try {
    const presetId = localStorage.getItem(POMODORO_PRESET_KEY) ?? "classic";
    const stored = localStorage.getItem(POMODORO_SETTINGS_KEY);
    const preset = POMODORO_PRESETS.find((p) => p.id === presetId) ?? POMODORO_PRESETS[0];
    if (stored) {
      return { presetId, settings: { ...preset.settings, ...JSON.parse(stored) } };
    }
    return { presetId, settings: preset.settings };
  } catch {
    return { presetId: "classic", settings: POMODORO_PRESETS[0].settings };
  }
}

export function savePomodoroSettings(presetId: string, settings: PomodoroSettings) {
  localStorage.setItem(POMODORO_PRESET_KEY, presetId);
  localStorage.setItem(POMODORO_SETTINGS_KEY, JSON.stringify(settings));
}

export interface BubblePosition {
  x: number;
  y: number;
}

export function loadBubblePosition(): BubblePosition {
  if (typeof window === "undefined") return { x: -1, y: -1 };
  try {
    const stored = localStorage.getItem(POMODORO_BUBBLE_POS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* defaults */
  }
  return { x: -1, y: -1 };
}

export function saveBubblePosition(pos: BubblePosition) {
  localStorage.setItem(POMODORO_BUBBLE_POS_KEY, JSON.stringify(pos));
}

export function defaultBubblePosition(): BubblePosition {
  if (typeof window === "undefined") return { x: 24, y: 24 };
  const size = 88;
  return { x: window.innerWidth - size - 24, y: window.innerHeight - size - 24 };
}
