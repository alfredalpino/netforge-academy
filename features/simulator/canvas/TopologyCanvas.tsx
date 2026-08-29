"use client";

import type { DeviceType } from "@/simulation/core/types";

export type CanvasNode = {
  id: string;
  name: string;
  type: DeviceType;
  x: number;
  y: number;
  selected?: boolean;
};

export type CanvasLink = {
  id: string;
  aDeviceId: string;
  bDeviceId: string;
};

const TYPE_LABEL: Record<string, string> = {
  router: "RTR",
  switch: "SW",
  host: "PC",
  server: "SRV",
};

export type TopologyCanvasProps = {
  nodes: CanvasNode[];
  links: CanvasLink[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  hopDeviceIds?: string[];
};

export function TopologyCanvas({
  nodes,
  links,
  selectedId,
  onSelect,
  hopDeviceIds = [],
}: TopologyCanvasProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      className="sim-canvas-surface relative h-full min-h-[220px] w-full overflow-hidden"
      onClick={() => onSelect(null)}
      role="application"
      aria-label="Topology canvas"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {links.map((link) => {
          const a = nodeMap.get(link.aDeviceId);
          const b = nodeMap.get(link.bDeviceId);
          if (!a || !b) return null;
          const active =
            hopDeviceIds.includes(a.id) && hopDeviceIds.includes(b.id);
          return (
            <line
              key={link.id}
              x1={a.x + 44}
              y1={a.y + 28}
              x2={b.x + 44}
              y2={b.y + 28}
              stroke={active ? "var(--sim-link-up)" : "var(--sim-link)"}
              strokeWidth={active ? 2.5 : 1.75}
            />
          );
        })}
      </svg>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="font-display text-base font-semibold text-foreground">
            Empty topology
          </p>
          <p className="max-w-sm text-sm text-muted">
            Load the Basic LAN sample from the top bar, or add devices from the palette.
          </p>
        </div>
      )}

      {nodes.map((node) => {
        const selected = selectedId === node.id;
        const hopping = hopDeviceIds.includes(node.id);
        return (
          <button
            key={node.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node.id);
            }}
            className={`absolute flex w-[88px] flex-col items-center rounded-xl border px-2 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              selected
                ? "border-accent bg-accent/15 shadow-[0_0_0_1px_var(--accent)]"
                : hopping
                  ? "border-success/60 bg-success/10"
                  : "border-border bg-surface-elevated/90 hover:border-border-strong"
            }`}
            style={{ left: node.x, top: node.y }}
          >
            <span className="font-mono text-[0.65rem] text-accent">
              {TYPE_LABEL[node.type] ?? node.type}
            </span>
            <span className="truncate text-xs font-semibold text-foreground">
              {node.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
