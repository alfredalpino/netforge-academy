"use client";

import { ProgressProvider } from "@/lib/progress";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { TourProvider } from "./TourProvider";
import { TourLauncher } from "./TourLauncher";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <ToastProvider>
        <ConfirmProvider>
          <PwaProvider>
            <TourProvider>
              {children}
              <TourLauncher />
            </TourProvider>
          </PwaProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ProgressProvider>
  );
}
