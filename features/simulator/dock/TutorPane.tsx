"use client";

import type { GradeReport } from "@/simulation/grading/lab-schema";
import type { PacketTrace } from "@/simulation/core/types";
import {
  deriveTutorHints,
  type TutorHint,
} from "@/features/simulator/tutor/tutor-hints";

export type TutorPaneProps = {
  grade: GradeReport | null;
  traces: PacketTrace[];
  selectedPacketId: string | null;
  labTitle?: string;
  labId?: string | null;
  highlightedCheckId?: string | null;
  onViewScore?: (checkId?: string) => void;
};

function severityIcon(severity: TutorHint["severity"]): string {
  if (severity === "success") return "✓";
  if (severity === "warning") return "!";
  return "·";
}

function severityClass(severity: TutorHint["severity"]): string {
  if (severity === "success") return "text-success";
  if (severity === "warning") return "text-warning";
  return "text-accent";
}

export function TutorPane({
  grade,
  traces,
  selectedPacketId,
  labTitle,
  labId,
  highlightedCheckId,
  onViewScore,
}: TutorPaneProps) {
  const selectedTrace =
    traces.find((t) => t.packetId === selectedPacketId) ?? null;

  const hints = deriveTutorHints({
    grade,
    selectedTrace,
    traces,
    labTitle,
    labId,
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="section-label">Teaching hints</p>
        <p className="font-mono text-[0.65rem] text-muted">
          rule-based · no LLM
        </p>
      </div>

      <ul className="space-y-2">
        {hints.map((h) => {
          const highlighted =
            h.relatedCheckId != null &&
            highlightedCheckId === h.relatedCheckId;
          return (
            <li
              key={h.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                highlighted
                  ? "border-accent/60 bg-accent/[0.06]"
                  : "border-border bg-surface-elevated/40"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 font-mono text-xs font-bold ${severityClass(h.severity)}`}
                >
                  {severityIcon(h.severity)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{h.title}</span>
                    <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-muted">
                      {h.source}
                    </span>
                    {h.relatedCheckId && onViewScore && (
                      <button
                        type="button"
                        onClick={() => onViewScore(h.relatedCheckId)}
                        className="ml-auto text-[0.65rem] font-medium text-accent hover:underline"
                      >
                        ← Score
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
                    {h.body}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedTrace && (
        <p className="mt-3 font-mono text-[0.65rem] text-muted">
          Context: packet {selectedTrace.protocol} · {selectedTrace.outcome} ·{" "}
          {selectedTrace.summary}
        </p>
      )}
    </div>
  );
}
