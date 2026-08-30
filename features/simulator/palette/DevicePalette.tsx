"use client";

export type PaletteDevice = {
  type: "router" | "switch" | "host";
  label: string;
  hint: string;
};

const ICON: Record<PaletteDevice["type"], string> = {
  router: "/simulator/icons/router.svg",
  switch: "/simulator/icons/switch.svg",
  host: "/simulator/icons/host.svg",
};

const DEVICES: PaletteDevice[] = [
  { type: "router", label: "Router", hint: "L3 · NetForgeOS" },
  { type: "switch", label: "Switch", hint: "L2 MAC learning" },
  { type: "host", label: "Host", hint: "End station · ping" },
];

export type DevicePaletteProps = {
  onAddDevice?: (type: PaletteDevice["type"]) => void;
  collapsed?: boolean;
};

export function DevicePalette({ onAddDevice, collapsed = false }: DevicePaletteProps) {
  if (collapsed) {
    return (
      <aside className="sim-panel flex w-10 shrink-0 flex-col items-center gap-2 py-2" aria-label="Device palette collapsed">
        <span className="section-label writing-mode-vertical rotate-180 text-[0.55rem]">Devices</span>
      </aside>
    );
  }

  return (
    <aside
      className="sim-panel flex w-[var(--sim-panel-width)] shrink-0 flex-col overflow-hidden"
      aria-label="Device palette"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="section-label">Devices</p>
      </div>
      <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {DEVICES.map((device) => (
          <li key={device.type}>
            <button
              type="button"
              onClick={() => onAddDevice?.(device.type)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-border hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ICON[device.type]}
                alt=""
                width={28}
                height={28}
                className="shrink-0 rounded"
                draggable={false}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{device.label}</span>
                <span className="block text-[0.65rem] text-muted">{device.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-border px-3 py-2 text-[0.65rem] leading-relaxed text-muted">
        Click to place on canvas. Drag between handles to link.
      </p>
    </aside>
  );
}
