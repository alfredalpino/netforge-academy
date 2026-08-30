export type DrillTimerStatus = "idle" | "running" | "paused" | "expired";

export interface DrillTimerState {
  status: DrillTimerStatus;
  secondsLeft: number;
  elapsed: number;
  durationSeconds: number;
}

export function createDrillTimerState(durationSeconds: number): DrillTimerState {
  return {
    status: "idle",
    secondsLeft: durationSeconds,
    elapsed: 0,
    durationSeconds,
  };
}

export function startDrillTimer(state: DrillTimerState): DrillTimerState {
  if (state.status === "running") return state;
  if (state.status === "paused") {
    return { ...state, status: "running" };
  }
  // idle or expired → fresh run
  return {
    ...state,
    status: "running",
    secondsLeft: state.durationSeconds,
    elapsed: 0,
  };
}

export function pauseDrillTimer(state: DrillTimerState): DrillTimerState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused" };
}

export function resetDrillTimer(state: DrillTimerState): DrillTimerState {
  return createDrillTimerState(state.durationSeconds);
}

/** Advance one second while running. Returns next state and whether expire just fired. */
export function tickDrillTimer(state: DrillTimerState): {
  state: DrillTimerState;
  expired: boolean;
} {
  if (state.status !== "running") {
    return { state, expired: false };
  }

  const secondsLeft = state.secondsLeft - 1;
  const elapsed = state.elapsed + 1;

  if (secondsLeft <= 0) {
    return {
      state: {
        ...state,
        status: "expired",
        secondsLeft: 0,
        elapsed,
      },
      expired: true,
    };
  }

  return {
    state: { ...state, secondsLeft, elapsed },
    expired: false,
  };
}
