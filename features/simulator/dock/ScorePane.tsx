"use client";

export type ScoreCheckRow = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type ScorePaneProps = {
  score?: number;
  passScore?: number;
  checks?: ScoreCheckRow[];
  message?: string;
  highlightedCheckId?: string | null;
  onRequestHint?: (checkId: string) => void;
};

export function ScorePane({
  score,
  passScore = 80,
  checks = [],
  message,
  highlightedCheckId,
  onRequestHint,
}: ScorePaneProps) {
  if (checks.length === 0 && score === undefined) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm text-muted">Submit a lab to see live grading.</p>
        {message && <p className="text-[0.7rem] text-muted/80">{message}</p>}
      </div>
    );
  }

  const passed = score !== undefined && score >= passScore;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      {score !== undefined && (
        <p className="mb-3 font-display text-lg font-semibold tracking-tight">
          Score{" "}
          <span className={passed ? "text-success" : "text-warning"}>
            {score}%
          </span>
          <span className="ml-2 text-sm font-normal text-muted">
            (pass ≥ {passScore}%)
          </span>
        </p>
      )}
      <ul className="space-y-2">
        {checks.map((c) => {
          const highlighted = highlightedCheckId === c.id;
          return (
            <li
              key={c.id}
              id={`score-check-${c.id}`}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                highlighted
                  ? "border-accent/60 bg-accent/[0.06]"
                  : "border-border bg-surface-elevated/40"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={c.pass ? "text-success" : "text-error"}>
                  {c.pass ? "PASS" : "FAIL"}
                </span>
                <span className="font-medium text-foreground">{c.label}</span>
                {!c.pass && onRequestHint && (
                  <button
                    type="button"
                    onClick={() => onRequestHint(c.id)}
                    className="ml-auto rounded-md border border-border bg-surface px-2 py-0.5 text-[0.65rem] font-medium text-accent transition hover:border-accent/40 hover:bg-surface-hover"
                  >
                    View hint →
                  </button>
                )}
              </div>
              <p className="mt-1 font-mono text-[0.7rem] text-muted">{c.detail}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
