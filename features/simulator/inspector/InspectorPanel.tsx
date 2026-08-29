"use client";

export type InspectorSelection = {
  kind: "device" | "link" | "none";
  id?: string;
  title?: string;
  subtitle?: string;
  rows?: { label: string; value: string }[];
};

export type InspectorPanelProps = {
  selection: InspectorSelection;
  collapsed?: boolean;
};

export function InspectorPanel({ selection, collapsed = false }: InspectorPanelProps) {
  if (collapsed) {
    return (
      <aside className="sim-panel flex w-10 shrink-0 flex-col" aria-label="Inspector collapsed" />
    );
  }

  return (
    <aside
      className="sim-panel flex w-[var(--sim-panel-width)] shrink-0 flex-col overflow-hidden"
      aria-label="Inspector"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="section-label">Inspector</p>
      </div>
      {selection.kind === "none" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-sm text-muted">Select a device or link</p>
          <p className="text-[0.7rem] leading-relaxed text-muted/80">
            Interfaces, tables, and config appear here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <p className="font-display text-sm font-semibold text-foreground">
            {selection.title ?? selection.id}
          </p>
          {selection.subtitle && (
            <p className="mt-0.5 font-mono text-[0.7rem] text-muted">{selection.subtitle}</p>
          )}
          {selection.rows && selection.rows.length > 0 && (
            <dl className="mt-3 space-y-2">
              {selection.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[5.5rem_1fr] gap-2 text-[0.75rem]">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="truncate font-mono text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </aside>
  );
}
