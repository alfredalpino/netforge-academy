"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import type { ProgressState } from "@/lib/types";
import {
  detectMilestoneEvents,
  milestoneMessage,
  shouldCelebrateWithConfetti,
} from "@/lib/milestone-celebrations";
import { useToast } from "@/components/ui/Toast";
import { ConfettiBurst } from "@/components/ConfettiBurst";

/** Watches progress transitions and celebrates module, phase, lab, gate, and drill milestones. */
export function MilestoneCelebration() {
  const { progress, loaded } = useProgress();
  const { showToast } = useToast();
  const prevRef = useRef<ProgressState | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!loaded) return;

    if (prevRef.current === null) {
      prevRef.current = progress;
      return;
    }

    const events = detectMilestoneEvents(prevRef.current, progress);
    let celebrate = false;

    for (const event of events) {
      showToast(milestoneMessage(event), "success");
      if (shouldCelebrateWithConfetti(event)) celebrate = true;
    }

    if (celebrate) setShowConfetti(true);
    prevRef.current = progress;
  }, [progress, loaded, showToast]);

  if (!showConfetti) return null;

  return <ConfettiBurst onDone={() => setShowConfetti(false)} />;
}
