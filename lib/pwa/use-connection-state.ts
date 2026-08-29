"use client";

import { useCallback, useEffect, useState } from "react";

export type ConnectionState = "online" | "offline" | "syncing";

export function useConnectionState() {
  const [state, setState] = useState<ConnectionState>(() =>
    typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
  );

  useEffect(() => {
    const goOnline = () => setState("online");
    const goOffline = () => setState("offline");

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const setSyncing = useCallback((syncing: boolean) => {
    setState(syncing ? "syncing" : navigator.onLine ? "online" : "offline");
  }, []);

  return { state, setSyncing };
}
