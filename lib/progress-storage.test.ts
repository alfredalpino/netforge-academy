import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  getProgressSnapshot,
  notifyProgressListeners,
  persistProgressState,
} from "./progress-storage";
import { DEFAULT_PROGRESS } from "./types";

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
}

describe("progress storage snapshot caching", () => {
  beforeEach(() => {
    installMemoryLocalStorage();
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    notifyProgressListeners();
  });

  it("returns a stable object reference when stored data is unchanged", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_PROGRESS,
        currentWeek: 2,
        streak: 4,
      })
    );
    notifyProgressListeners();

    const first = getProgressSnapshot();
    const second = getProgressSnapshot();

    expect(first).toBe(second);
    expect(first.currentWeek).toBe(2);
    expect(first.streak).toBe(4);
  });

  it("returns a new snapshot after persist", () => {
    const before = getProgressSnapshot();
    persistProgressState({
      ...DEFAULT_PROGRESS,
      currentWeek: 3,
      currentDay: 2,
    });
    const after = getProgressSnapshot();

    expect(after).not.toBe(before);
    expect(after.currentWeek).toBe(3);
    expect(after.currentDay).toBe(2);
  });
});
