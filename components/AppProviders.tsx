"use client";

import { ProgressProvider } from "@/lib/progress";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { NavLayoutProvider } from "@/components/NavLayoutContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TourProvider } from "./TourProvider";
import { TourLauncher } from "./TourLauncher";
import { MilestoneCelebration } from "./MilestoneCelebration";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <ToastProvider>
        <ConfirmProvider>
          <PwaProvider>
            <ThemeProvider>
              <NavLayoutProvider>
                <TourProvider>
                  {children}
                  <TourLauncher />
                  <MilestoneCelebration />
                </TourProvider>
              </NavLayoutProvider>
            </ThemeProvider>
          </PwaProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ProgressProvider>
  );
}
