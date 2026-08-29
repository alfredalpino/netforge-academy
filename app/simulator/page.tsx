"use client";

import { Suspense } from "react";
import { SimulatorShell } from "@/features/simulator/shell/SimulatorShell";

function SimulatorFallback() {
  return (
    <div className="sim-workspace flex h-[calc(100dvh-3.5rem)] items-center justify-center md:h-dvh">
      <p className="text-sm text-muted">Loading simulator…</p>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<SimulatorFallback />}>
      <SimulatorShell />
    </Suspense>
  );
}
