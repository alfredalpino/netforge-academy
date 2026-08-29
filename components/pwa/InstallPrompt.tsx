"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  isIosDevice,
  isStandaloneDisplayMode,
  trackInstallPromptAccepted,
  trackInstallPromptDismissed,
  trackInstallPromptShown,
} from "@/lib/pwa/install-analytics";

const DISMISS_KEY = "netforge-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function getInitialVisibility() {
  if (typeof window === "undefined") return false;
  if (isStandaloneDisplayMode()) return false;
  if (localStorage.getItem(DISMISS_KEY) === "1") return false;
  if (isIosDevice()) {
    trackInstallPromptShown();
    return true;
  }
  return false;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(getInitialVisibility);
  const [isStandalone] = useState(() =>
    typeof window !== "undefined" ? isStandaloneDisplayMode() : false
  );
  const [isIos] = useState(() => (typeof window !== "undefined" ? isIosDevice() : false));

  useEffect(() => {
    if (isStandalone) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
      trackInstallPromptShown();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [isStandalone]);

  if (isStandalone || !visible) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      trackInstallPromptAccepted();
    } else {
      trackInstallPromptDismissed();
    }
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    trackInstallPromptDismissed();
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Install NetForge"
      className="fixed bottom-4 left-4 right-4 z-[120] mx-auto max-w-lg rounded-xl border border-border bg-surface p-4 shadow-xl md:left-auto md:right-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Install NetForge</p>
          <p className="mt-1 text-sm text-muted">
            {deferredPrompt
              ? "Add NetForge to your home screen for faster access and offline study."
              : isIos
                ? "On iOS, tap Share and choose Add to Home Screen for an app-like experience."
                : "Install NetForge for quick access and offline study sessions."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md px-2 py-1 text-sm text-muted hover:bg-surface-hover"
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {deferredPrompt && (
          <Button type="button" onClick={handleInstall}>
            Install app
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={handleDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
