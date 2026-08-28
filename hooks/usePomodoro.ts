"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type PomodoroPhase,
  type PomodoroSettings,
  formatTimer,
  getPhaseLabel,
  getPhaseMinutes,
  loadPomodoroSettings,
  savePomodoroSettings,
} from "@/lib/pomodoro";

export function usePomodoro() {
  const [presetId, setPresetId] = useState("classic");
  const [settings, setSettings] = useState<PomodoroSettings>(
    loadPomodoroSettings().settings
  );
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  const settingsRef = useRef(settings);
  const completedRef = useRef(0);
  settingsRef.current = settings;
  completedRef.current = completedSessions;

  useEffect(() => {
    const loaded = loadPomodoroSettings();
    setPresetId(loaded.presetId);
    setSettings(loaded.settings);
  }, []);

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      const s = settingsRef.current;
      if (current === "work") {
        const nextCount = completedRef.current + 1;
        completedRef.current = nextCount;
        setCompletedSessions(nextCount);
        const isLong =
          nextCount > 0 && nextCount % s.sessionsBeforeLongBreak === 0;
        const next: PomodoroPhase = isLong ? "long_break" : "short_break";
        const mins = getPhaseMinutes(next, s);
        setTotalSeconds(mins * 60);
        setSecondsLeft(mins * 60);
        return next;
      }
      const mins = s.workMinutes;
      setTotalSeconds(mins * 60);
      setSecondsLeft(mins * 60);
      return "work";
    });
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running || phase === "idle" || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, secondsLeft, advancePhase]);

  useEffect(() => {
    if (!sessionActive || phase === "idle") {
      document.title = "NetForge — Focus Mode";
      return;
    }
    const icon = phase === "work" ? "⏱" : "☕";
    document.title = `${icon} ${formatTimer(secondsLeft)} · ${getPhaseLabel(phase)} · NetForge`;
    return () => {
      document.title = "NetForge — Network Engineering Academy";
    };
  }, [secondsLeft, phase, sessionActive]);

  const updateSettings = useCallback(
    (newPresetId: string, newSettings: PomodoroSettings) => {
      setPresetId(newPresetId);
      setSettings(newSettings);
      savePomodoroSettings(newPresetId, newSettings);
    },
    []
  );

  const startSession = useCallback(() => {
    const mins = settingsRef.current.workMinutes;
    setSessionActive(true);
    setPhase("work");
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setRunning(true);
    setCompletedSessions(0);
    completedRef.current = 0;
  }, []);

  const toggle = useCallback(() => setRunning((r) => !r), []);

  const skipPhase = useCallback(() => {
    if (phase === "idle") return;
    advancePhase();
  }, [phase, advancePhase]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    setPhase("idle");
    setRunning(false);
    setSecondsLeft(0);
    setCompletedSessions(0);
    completedRef.current = 0;
    document.title = "NetForge — Network Engineering Academy";
  }, []);

  const resetPhase = useCallback(() => {
    if (phase === "idle") return;
    const mins = getPhaseMinutes(phase, settingsRef.current);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
    setRunning(false);
  }, [phase]);

  const progress =
    totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return {
    presetId,
    settings,
    phase,
    secondsLeft,
    totalSeconds,
    running,
    completedSessions,
    sessionActive,
    progress,
    updateSettings,
    startSession,
    toggle,
    skipPhase,
    endSession,
    resetPhase,
  };
}
