"use client";

import { useCallback, useEffect, useState } from "react";
import { ConnectionBanner } from "@/components/pwa/ConnectionBanner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import {
  OfflineDiagnosticsPanel,
  flushSyncQueue,
} from "@/components/pwa/OfflineDiagnosticsPanel";
import { UpdateBanner } from "@/components/pwa/UpdateBanner";
import {
  isStandaloneDisplayMode,
  trackStandaloneSession,
} from "@/lib/pwa/install-analytics";
import { bootstrapProgressFromIdb, mirrorProgressToIdb } from "@/lib/pwa/progress-idb";
import { registerBackgroundSync } from "@/lib/pwa/sync-queue";
import { useConnectionState } from "@/lib/pwa/use-connection-state";
import { STORAGE_KEY, notifyProgressListeners } from "@/lib/progress-storage";

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { state, isOnline, setSyncing, confirmOnlineStatus } = useConnectionState();
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const processSyncQueue = useCallback(async () => {
    setSyncing(true);
    try {
      await flushSyncQueue();
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        await mirrorProgressToIdb(serialized);
      }
    } finally {
      setSyncing(false);
    }
  }, [setSyncing]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register(
          new URL("../../lib/service-worker.js", import.meta.url),
          {
            scope: "/",
            updateViaCache: "none",
          }
        );

        if (!mounted) return;

        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(registration.waiting);
              setShowUpdate(true);
            }
          });
        });
      } catch {
        // Service worker registration is optional; the app remains usable without it.
      }
    }

    void register();

    const onControllerChange = () => {
      window.location.reload();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_QUEUE") {
        void processSyncQueue();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.addEventListener("message", onMessage);

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [processSyncQueue]);

  useEffect(() => {
    void bootstrapProgressFromIdb(STORAGE_KEY, () => notifyProgressListeners());
  }, []);

  useEffect(() => {
    if (isStandaloneDisplayMode()) {
      trackStandaloneSession();
      document.documentElement.classList.add("pwa-standalone");
    }
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    void processSyncQueue();
    void registerBackgroundSync();
  }, [isOnline, processSyncQueue]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.key.toLowerCase() === "o") {
        setDiagnosticsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function applyUpdate() {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowUpdate(false);
  }

  return (
    <>
      {showUpdate && (
        <UpdateBanner onUpdate={applyUpdate} onDismiss={() => setShowUpdate(false)} />
      )}
      <ConnectionBanner
        state={state}
        onRetry={() => {
          void confirmOnlineStatus();
        }}
      />
      <InstallPrompt />
      {diagnosticsOpen && (
        <OfflineDiagnosticsPanel
          onClose={() => setDiagnosticsOpen(false)}
          onRetrySync={processSyncQueue}
        />
      )}
      {children}
    </>
  );
}
