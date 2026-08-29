"use client";

export type PacketListItem = {
  id: string;
  t: number;
  summary: string;
  protocol: string;
};

export function PacketsPane({
  packets,
  selectedId,
  onSelect,
}: {
  packets: PacketListItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (packets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
        Packet traces appear after ping / ARP activity.
      </div>
    );
  }

  return (
    <ul className="h-full overflow-y-auto font-mono text-[0.75rem]">
      {packets.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect?.(p.id)}
            className={`flex w-full gap-3 border-b border-border/60 px-3 py-1.5 text-left hover:bg-surface-hover ${
              selectedId === p.id ? "bg-accent/10" : ""
            }`}
          >
            <span className="w-14 shrink-0 text-muted">t={p.t.toFixed(1)}</span>
            <span
              className={
                p.protocol === "ARP"
                  ? "w-12 shrink-0 text-[color:var(--sim-packet-arp)]"
                  : "w-12 shrink-0 text-[color:var(--sim-packet-icmp)]"
              }
            >
              {p.protocol}
            </span>
            <span className="truncate text-foreground">{p.summary}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
