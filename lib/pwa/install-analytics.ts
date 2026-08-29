const ANALYTICS_KEY = "netforge-pwa-analytics";

export type InstallAnalytics = {
  installPromptShown: number;
  installPromptAccepted: number;
  installPromptDismissed: number;
  standaloneSessions: number;
  lastStandaloneSession?: string;
};

const DEFAULT_ANALYTICS: InstallAnalytics = {
  installPromptShown: 0,
  installPromptAccepted: 0,
  installPromptDismissed: 0,
  standaloneSessions: 0,
};

function readAnalytics(): InstallAnalytics {
  if (typeof window === "undefined") return DEFAULT_ANALYTICS;
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return DEFAULT_ANALYTICS;
    return { ...DEFAULT_ANALYTICS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

function writeAnalytics(data: InstallAnalytics) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

export function trackInstallPromptShown() {
  const data = readAnalytics();
  data.installPromptShown += 1;
  writeAnalytics(data);
}

export function trackInstallPromptAccepted() {
  const data = readAnalytics();
  data.installPromptAccepted += 1;
  writeAnalytics(data);
}

export function trackInstallPromptDismissed() {
  const data = readAnalytics();
  data.installPromptDismissed += 1;
  writeAnalytics(data);
}

export function trackStandaloneSession() {
  const data = readAnalytics();
  data.standaloneSessions += 1;
  data.lastStandaloneSession = new Date().toISOString();
  writeAnalytics(data);
}

export function getInstallAnalytics(): InstallAnalytics {
  return readAnalytics();
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
