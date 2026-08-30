"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDrillTimerState,
  pauseDrillTimer,
  startDrillTimer,
  tickDrillTimer,
  type DrillTimerState,
  type DrillTimerStatus,
} from "@/lib/drill-timer";

export interface UseDrillTimerOptions {
  durationSeconds: number;
  onExpire?: () => void;
}

export interface UseDrillTimerResult {
  status: DrillTimerStatus;
  secondsLeft: number;
  elapsed: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useDrillTimer({
  durationSeconds,
  onExpire,
}: UseDrillTimerOptions): UseDrillTimerResult {
  const [state, setState] = useState<DrillTimerState>(() =>
    createDrillTimerState(durationSeconds),
  );
  const onExpireRef = useRef(onExpire);
  const durationRef = useRef(durationSeconds);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    durationRef.current = durationSeconds;
  }, [durationSeconds]);

  useEffect(() => {
    if (state.status !== "running") return;

    const id = window.setInterval(() => {
      setState((prev) => {
        const { state: next, expired } = tickDrillTimer(prev);
        if (expired) {
          queueMicrotask(() => onExpireRef.current?.());
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [state.status]);

  const start = useCallback(() => {
    setState((prev) => startDrillTimer(prev));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => pauseDrillTimer(prev));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => startDrillTimer(prev));
  }, []);

  const reset = useCallback(() => {
    setState(createDrillTimerState(durationRef.current));
  }, []);

  return {
    status: state.status,
    secondsLeft: state.secondsLeft,
    elapsed: state.elapsed,
    start,
    pause,
    resume,
    reset,
  };
}
