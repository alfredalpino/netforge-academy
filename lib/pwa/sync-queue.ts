import { idbAdd, idbClear, idbGetAll, STORES } from "./idb";

export type SyncQueueItem = {
  id?: number;
  type: "progress-write";
  payload: string;
  createdAt: string;
  retries: number;
  lastError?: string;
};

export async function enqueueSyncItem(
  item: Omit<SyncQueueItem, "id" | "retries" | "createdAt"> & { createdAt?: string }
): Promise<void> {
  await idbAdd(STORES.syncQueue, {
    type: item.type,
    payload: item.payload,
    createdAt: item.createdAt ?? new Date().toISOString(),
    retries: 0,
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const items = await idbGetAll<SyncQueueItem>(STORES.syncQueue);
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function clearSyncQueue(): Promise<void> {
  await idbClear(STORES.syncQueue);
}

export async function registerBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const syncCapable = registration as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> };
  };

  if (syncCapable.sync) {
    try {
      await syncCapable.sync.register("netforge-progress-sync");
    } catch {
      // Background Sync may be unavailable or denied.
    }
  }
}
