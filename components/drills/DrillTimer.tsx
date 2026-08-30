"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { DrillTimerStatus } from "@/lib/drill-timer";

interface DrillTimerProps {
  status: DrillTimerStatus;
  secondsLeft: number;
  elapsed: number;
  submitted?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function DrillTimer({
  status,
  secondsLeft,
  elapsed,
  submitted = false,
  onStart,
  onPause,
  onResume,
  onReset,
}: DrillTimerProps) {
  const displaySeconds = submitted || status === "expired" ? elapsed : secondsLeft;
  const warning =
    !submitted && status === "running" && secondsLeft <= 10;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="drill-timer"
      data-status={status}
    >
      <Badge tone={warning || status === "expired" ? "warning" : "default"}>
        {status === "idle" && !submitted
          ? `Ready · ${secondsLeft}s`
          : submitted
            ? `Time: ${elapsed}s`
            : status === "expired"
              ? `Time up · ${elapsed}s`
              : status === "paused"
                ? `Paused · ${secondsLeft}s`
                : `Timer: ${displaySeconds}s`}
      </Badge>

      {!submitted && (
        <div className="flex flex-wrap gap-1.5">
          {status === "idle" || status === "expired" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={onStart}
              data-testid="drill-timer-start"
            >
              Start
            </Button>
          ) : null}
          {status === "running" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={onPause}
              data-testid="drill-timer-pause"
            >
              Pause
            </Button>
          ) : null}
          {status === "paused" ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={onResume}
              data-testid="drill-timer-resume"
            >
              Resume
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            data-testid="drill-timer-reset"
            disabled={status === "idle"}
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
