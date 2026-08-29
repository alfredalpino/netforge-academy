import type { ProgressState } from "./types";
import { DEFAULT_PROGRESS } from "./types";
import { parseStoredProgress } from "./progress-schema";
import { mirrorProgressToIdb } from "./pwa/progress-idb";
import { enqueueSyncItem, registerBackgroundSync } from "./pwa/sync-queue";

export const STORAGE_KEY = "netforge-progress";

const listeners = new Set<() => void>();

export function subscribeProgress(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function notifyProgressListeners() {
  listeners.forEach((listener) => listener());
}

export function getProgressSnapshot(): ProgressState {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  return parseStoredProgress(localStorage.getItem(STORAGE_KEY));
}

export function getProgressServerSnapshot(): ProgressState {
  return DEFAULT_PROGRESS;
}

export type PersistResult = { ok: true } | { ok: false; reason: "quota" | "unknown" };

function queueProgressWrite(serialized: string) {
  void enqueueSyncItem({ type: "progress-write", payload: serialized })
    .then(() => registerBackgroundSync())
    .catch(() => undefined);
}

export function persistProgressState(next: ProgressState): PersistResult {
  if (typeof window === "undefined") return { ok: true };

  const serialized = JSON.stringify(next);

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
    notifyProgressListeners();
    void mirrorProgressToIdb(serialized);
    return { ok: true };
  } catch (error) {
    void mirrorProgressToIdb(serialized).catch(() => queueProgressWrite(serialized));

    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      queueProgressWrite(serialized);
      return { ok: false, reason: "quota" };
    }

    queueProgressWrite(serialized);
    return { ok: false, reason: "unknown" };
  }
}

export function clearProgressStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  notifyProgressListeners();
}

export function importProgressState(next: ProgressState): PersistResult {
  return persistProgressState(next);
}
