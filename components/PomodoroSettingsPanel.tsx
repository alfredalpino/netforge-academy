"use client";

import {
  POMODORO_PRESETS,
  type PomodoroSettings,
} from "@/lib/pomodoro";

interface PomodoroSettingsPanelProps {
  presetId: string;
  settings: PomodoroSettings;
  onChange: (presetId: string, settings: PomodoroSettings) => void;
  disabled?: boolean;
}

export function PomodoroSettingsPanel({
  presetId,
  settings,
  onChange,
  disabled,
}: PomodoroSettingsPanelProps) {
  const isCustom = presetId === "custom";

  const update = (partial: Partial<PomodoroSettings>) => {
    onChange(presetId, { ...settings, ...partial });
  };

  const selectPreset = (id: string) => {
    const preset = POMODORO_PRESETS.find((p) => p.id === id)!;
    onChange(id, id === "custom" ? settings : { ...preset.settings });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {POMODORO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            disabled={disabled}
            onClick={() => selectPreset(preset.id)}
            className={`rounded-xl border p-4 text-left transition ${
              presetId === preset.id
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-accent/30"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <p className="text-sm font-medium">{preset.name}</p>
            <p className="mt-0.5 text-xs text-muted">{preset.description}</p>
          </button>
        ))}
      </div>

      {isCustom && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">Custom intervals</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-xs text-muted">Work (min)</span>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.workMinutes}
                disabled={disabled}
                onChange={(e) => update({ workMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs text-muted">Short break (min)</span>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.shortBreakMinutes}
                disabled={disabled}
                onChange={(e) => update({ shortBreakMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs text-muted">Long break (min)</span>
              <input
                type="number"
                min={5}
                max={60}
                value={settings.longBreakMinutes}
                disabled={disabled}
                onChange={(e) => update({ longBreakMinutes: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="text-xs text-muted">Sessions before long break</span>
              <select
                value={settings.sessionsBeforeLongBreak}
                disabled={disabled}
                onChange={(e) =>
                  update({ sessionsBeforeLongBreak: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} sessions
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        {settings.workMinutes}m work → {settings.shortBreakMinutes}m break → repeat{" "}
        {settings.sessionsBeforeLongBreak}x → {settings.longBreakMinutes}m long break
      </p>
    </div>
  );
}
