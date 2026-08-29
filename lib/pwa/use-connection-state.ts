"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ConnectionState = "online" | "offline" | "syncing";

async function probeConnectivity(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    // Still verify — browsers often lie about being offline.
  }

  try {
    const response = await fetch(`/manifest.webmanifest?__probe=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useConnectionState() {
  // Optimistic: never flash an offline banner on first paint.
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const probeInFlight = useRef<Promise<boolean> | null>(null);

  const confirmOnlineStatus = useCallback(async () => {
    if (probeInFlight.current) return probeInFlight.current;

    const probe = probeConnectivity().finally(() => {
      probeInFlight.current = null;
    });
    probeInFlight.current = probe;

    const online = await probe;
    setIsOnline(online);
    return online;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    const goOnline = () => {
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        offlineTimer = null;
      }
      setIsOnline(true);
    };

    const goOffline = () => {
      // Debounce + verify so a flaky navigator.onLine does not flash the banner.
      if (offlineTimer) clearTimeout(offlineTimer);
      offlineTimer = setTimeout(() => {
        void confirmOnlineStatus().then((online) => {
          if (!cancelled && !online) setIsOnline(false);
        });
      }, 400);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // If the browser claims we are offline at load, verify before showing UI.
    if (!navigator.onLine) {
      void confirmOnlineStatus();
    }

    return () => {
      cancelled = true;
      if (offlineTimer) clearTimeout(offlineTimer);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [confirmOnlineStatus]);

  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  const state: ConnectionState = !isOnline ? "offline" : isSyncing ? "syncing" : "online";

  return { state, isOnline, setSyncing, confirmOnlineStatus };
}
