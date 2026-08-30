"use client";

import { useCallback, useMemo, useState } from "react";
import type { PacketTrace } from "@/simulation/core/types";

export type CapturePaneProps = {
  traces: PacketTrace[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

const PROTOCOLS = ["all", "ARP", "ICMP", "TCP", "UDP", "DHCP", "NAT", "ETH"] as const;
type ProtocolFilter = (typeof PROTOCOLS)[number];

function protocolColor(protocol: string): string {
  if (protocol === "ARP") return "text-[color:var(--sim-packet-arp)]";
  if (protocol === "ICMP") return "text-[color:var(--sim-packet-icmp)]";
  if (protocol === "TCP") return "text-[color:var(--sim-packet-tcp,#60a5fa)]";
  if (protocol === "UDP") return "text-[color:var(--sim-packet-udp,#a78bfa)]";
  if (protocol === "NAT") return "text-[color:var(--sim-packet-nat,#fbbf24)]";
  if (protocol === "DHCP") return "text-[color:var(--sim-packet-dhcp,#34d399)]";
  return "text-muted";
}

function outcomeClass(outcome: PacketTrace["outcome"]): string {
  if (outcome === "delivered") return "text-success";
  if (outcome === "dropped") return "text-error";
  return "text-muted";
}

function buildExportPayload(traces: PacketTrace[]) {
  return {
    exportedAt: new Date().toISOString(),
    count: traces.length,
    packets: traces.map((t) => ({
      packetId: t.packetId,
      protocol: t.protocol,
      summary: t.summary,
      outcome: t.outcome,
      hops: t.hops,
    })),
  };
}

export function CapturePane({ traces, selectedId, onSelect }: CapturePaneProps) {
  const [protocol, setProtocol] = useState<ProtocolFilter>("all");
  const [status, setStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (protocol === "all") return traces;
    if (protocol === "NAT") {
      return traces.filter(
        (t) =>
          t.protocol === "NAT" ||
          t.summary.toLowerCase().includes("nat") ||
          t.hops.some((h) => h.action.toLowerCase().includes("nat")),
      );
    }
    return traces.filter((t) => t.protocol === protocol);
  }, [protocol, traces]);

  const exportJson = useMemo(() => JSON.stringify(buildExportPayload(filtered), null, 2), [filtered]);

  const flash = useCallback((msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2000);
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      flash(`Copied ${filtered.length} packet(s) as JSON`);
    } catch {
      flash("Copy failed — check browser permissions");
    }
  }, [exportJson, filtered.length, flash]);

  const onExport = useCallback(() => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `netforge-capture-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash(`Exported ${filtered.length} packet(s)`);
  }, [exportJson, filtered.length, flash]);

  if (traces.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
        Capture buffer fills after ping, ARP, or forwarded frames. Run traffic from the
        terminal first.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <span className="section-label">Filter</span>
        <div className="flex flex-wrap gap-1">
          {PROTOCOLS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProtocol(p)}
              className={`rounded px-2 py-0.5 font-mono text-[0.65rem] uppercase transition ${
                protocol === p
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[0.65rem] text-muted">
          {filtered.length}/{traces.length}
        </span>
        <button
          type="button"
          onClick={() => void onCopy()}
          className="rounded border border-border px-2 py-0.5 font-mono text-[0.65rem] text-foreground hover:bg-surface-hover"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={onExport}
          className="rounded border border-border px-2 py-0.5 font-mono text-[0.65rem] text-foreground hover:bg-surface-hover"
        >
          Export
        </button>
        {status && <span className="font-mono text-[0.65rem] text-accent">{status}</span>}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto font-mono text-[0.75rem]">
        {filtered.length === 0 ? (
          <li className="px-3 py-4 text-center text-muted">No packets match this filter.</li>
        ) : (
          filtered.map((t) => {
            const t0 = t.hops[0]?.t ?? 0;
            return (
              <li key={t.packetId}>
                <button
                  type="button"
                  onClick={() => onSelect?.(t.packetId)}
                  className={`flex w-full gap-2 border-b border-border/60 px-3 py-1.5 text-left hover:bg-surface-hover ${
                    selectedId === t.packetId ? "bg-accent/10" : ""
                  }`}
                >
                  <span className="w-14 shrink-0 text-muted">t={t0.toFixed(1)}</span>
                  <span
                    className={`w-12 shrink-0 ${protocolColor(t.protocol)}`}
                  >
                    {t.protocol}
                  </span>
                  <span className={`w-16 shrink-0 uppercase ${outcomeClass(t.outcome)}`}>
                    {t.outcome}
                  </span>
                  <span className="truncate text-foreground">{t.summary}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
