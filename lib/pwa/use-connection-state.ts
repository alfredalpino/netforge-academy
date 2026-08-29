"use client";

import { useCallback, useEffect, useState } from "react";

export type ConnectionState = "online" | "offline" | "syncing";

export function useConnectionState() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  const state: ConnectionState = !isOnline ? "offline" : isSyncing ? "syncing" : "online";

  return { state, isOnline, setSyncing };
}
