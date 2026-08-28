"use client";

import { TourProvider } from "./TourProvider";
import { TourLauncher } from "./TourLauncher";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      {children}
      <TourLauncher />
    </TourProvider>
  );
}
