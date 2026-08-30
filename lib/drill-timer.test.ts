import { describe, expect, it } from "vitest";
import {
  createDrillTimerState,
  pauseDrillTimer,
  resetDrillTimer,
  startDrillTimer,
  tickDrillTimer,
} from "./drill-timer";

describe("drill-timer", () => {
  it("starts idle and does not auto-run", () => {
    const state = createDrillTimerState(30);
    expect(state.status).toBe("idle");
    expect(state.secondsLeft).toBe(30);
    expect(tickDrillTimer(state).state.status).toBe("idle");
  });

  it("counts down only while running", () => {
    let state = startDrillTimer(createDrillTimerState(3));
    expect(state.status).toBe("running");

    ({ state } = tickDrillTimer(state));
    expect(state.secondsLeft).toBe(2);
    expect(state.elapsed).toBe(1);

    state = pauseDrillTimer(state);
    const paused = tickDrillTimer(state);
    expect(paused.state.secondsLeft).toBe(2);
    expect(paused.expired).toBe(false);

    state = startDrillTimer(paused.state);
    const expired = tickDrillTimer(tickDrillTimer(state).state);
    expect(expired.state.status).toBe("expired");
    expect(expired.state.secondsLeft).toBe(0);
    expect(expired.expired).toBe(true);
  });

  it("reset returns to idle full duration", () => {
    let state = startDrillTimer(createDrillTimerState(30));
    ({ state } = tickDrillTimer(state));
    state = resetDrillTimer(state);
    expect(state).toEqual(createDrillTimerState(30));
  });

  it("start after expire begins a fresh countdown", () => {
    let state = startDrillTimer(createDrillTimerState(1));
    const expired = tickDrillTimer(state);
    expect(expired.expired).toBe(true);
    state = startDrillTimer(expired.state);
    expect(state.status).toBe("running");
    expect(state.secondsLeft).toBe(1);
    expect(state.elapsed).toBe(0);
  });
});
