"use client";

import { Button } from "@/components/ui/Button";

export type SimTopBarProps = {
  labTitle: string;
  statusLabel?: string;
  onSave?: () => void;
  onRestore?: () => void;
  onSubmit?: () => void;
  onLoadSample?: () => void;
};

export function SimTopBar({
  labTitle,
  statusLabel = "Idle",
  onSave,
  onRestore,
  onSubmit,
  onLoadSample,
}: SimTopBarProps) {
  return (
    <header className="sim-panel flex h-12 shrink-0 items-center gap-3 border-b border-border px-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 font-display text-[0.65rem] font-bold text-accent">
          NF
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground">
            {labTitle}
          </p>
          <p className="truncate text-[0.65rem] text-muted">NetForgeOS · browser lab</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden rounded-md border border-border px-2 py-1 font-mono text-[0.65rem] text-muted sm:inline">
          {statusLabel}
        </span>
        {onLoadSample && (
          <Button type="button" variant="ghost" size="sm" onClick={onLoadSample}>
            Sample
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onSave} disabled={!onSave}>
          Save
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRestore} disabled={!onRestore}>
          Restore
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={onSubmit} disabled={!onSubmit}>
          Submit
        </Button>
      </div>
    </header>
  );
}
