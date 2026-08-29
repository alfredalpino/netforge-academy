"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getLastSyncTime } from "@/lib/pwa/progress-idb";
import { clearSyncQueue, getSyncQueue, type SyncQueueItem } from "@/lib/pwa/sync-queue";
import { STORAGE_KEY, notifyProgressListeners } from "@/lib/progress-storage";

export function OfflineDiagnosticsPanel({
  onClose,
  onRetrySync,
}: {
  onClose: () => void;
  onRetrySync: () => Promise<void>;
}) {
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [nextQueue, nextLastSync] = await Promise.all([getSyncQueue(), getLastSyncTime()]);
      if (cancelled) return;
      setQueue(nextQueue);
      setLastSync(nextLastSync);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRetry() {
    setRetrying(true);
    try {
      await onRetrySync();
      const [nextQueue, nextLastSync] = await Promise.all([getSyncQueue(), getLastSyncTime()]);
      setQueue(nextQueue);
      setLastSync(nextLastSync);
    } finally {
      setRetrying(false);
    }
  }

  async function handleClearQueue() {
    await clearSyncQueue();
    setQueue([]);
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-diagnostics-title"
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="offline-diagnostics-title" className="text-base font-semibold">
              Offline diagnostics
            </h2>
            <p className="mt-1 text-sm text-muted">
              Local progress is stored in {STORAGE_KEY} and mirrored to IndexedDB.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-hover"
            aria-label="Close diagnostics"
          >
            ×
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Connection</dt>
            <dd>{typeof navigator !== "undefined" && navigator.onLine ? "Online" : "Offline"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Last IndexedDB sync</dt>
            <dd>{lastSync ? new Date(lastSync).toLocaleString() : "Not yet synced"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Queued writes</dt>
            <dd>{queue.length}</dd>
          </div>
        </dl>

        {queue.length > 0 && (
          <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3 text-xs text-muted">
            {queue.map((item) => (
              <li key={item.id ?? item.createdAt}>
                {item.type} · {new Date(item.createdAt).toLocaleString()}
                {item.lastError ? ` · ${item.lastError}` : ""}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={handleRetry} disabled={retrying}>
            {retrying ? "Retrying…" : "Retry sync"}
          </Button>
          {queue.length > 0 && (
            <Button type="button" variant="secondary" onClick={handleClearQueue}>
              Clear queue
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function flushSyncQueue(): Promise<number> {
  const queue = await getSyncQueue();
  let flushed = 0;

  for (const item of queue) {
    if (item.type !== "progress-write") continue;
    try {
      localStorage.setItem(STORAGE_KEY, item.payload);
      notifyProgressListeners();
      flushed += 1;
    } catch {
      break;
    }
  }

  if (flushed > 0) {
    await clearSyncQueue();
  }

  return flushed;
}
