import { STORES, idbGet, idbSet, isIndexedDbAvailable } from "./idb";

const PROGRESS_KEY = "state";
const META_LAST_SYNC_KEY = "last-sync-at";

export async function mirrorProgressToIdb(serialized: string): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  await idbSet(STORES.progress, PROGRESS_KEY, serialized);
  await idbSet(STORES.meta, META_LAST_SYNC_KEY, new Date().toISOString());
}

export async function readProgressFromIdb(): Promise<string | null> {
  if (!isIndexedDbAvailable()) return null;
  const value = await idbGet<string>(STORES.progress, PROGRESS_KEY);
  return value ?? null;
}

export async function getLastSyncTime(): Promise<string | null> {
  if (!isIndexedDbAvailable()) return null;
  const value = await idbGet<string>(STORES.meta, META_LAST_SYNC_KEY);
  return value ?? null;
}

export async function bootstrapProgressFromIdb(
  storageKey: string,
  onRestore: (serialized: string) => void
): Promise<void> {
  if (!isIndexedDbAvailable() || typeof window === "undefined") return;

  const idbValue = await readProgressFromIdb();
  const localValue = localStorage.getItem(storageKey);

  if (idbValue && !localValue) {
    localStorage.setItem(storageKey, idbValue);
    onRestore(idbValue);
    return;
  }

  if (localValue && idbValue !== localValue) {
    await mirrorProgressToIdb(localValue);
  } else if (localValue && !idbValue) {
    await mirrorProgressToIdb(localValue);
  }
}
