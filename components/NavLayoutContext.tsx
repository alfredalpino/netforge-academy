"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "netforge-nav-collapsed";
export const NAV_WIDTH_EXPANDED = 260;
/** Fully hidden when collapsed (ChatGPT-style); reopen via panel toggle. */
export const NAV_WIDTH_COLLAPSED = 0;

function readInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved === "1") return true;
  if (saved === "0") return false;
  return window.location.pathname.startsWith("/simulator");
}

type NavLayoutContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  navWidth: number;
};

const NavLayoutContext = createContext<NavLayoutContextValue | null>(null);

export function NavLayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(readInitialCollapsed);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    sessionStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--nav-width",
      `${collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED}px`,
    );
    document.documentElement.dataset.navCollapsed = collapsed ? "1" : "0";
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      setCollapsed,
      navWidth: collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED,
    }),
    [collapsed, setCollapsed, toggleCollapsed],
  );

  return (
    <NavLayoutContext.Provider value={value}>{children}</NavLayoutContext.Provider>
  );
}

export function useNavLayout() {
  const ctx = useContext(NavLayoutContext);
  if (!ctx) {
    throw new Error("useNavLayout must be used within NavLayoutProvider");
  }
  return ctx;
}
