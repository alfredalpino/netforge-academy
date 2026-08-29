"use client";

export type EventListItem = {
  id: string;
  t: number;
  type: string;
  detail: string;
};

export function EventsPane({ events }: { events: EventListItem[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
        Simulation events will list here (arrivals, drops, timers).
      </div>
    );
  }

  return (
    <ul className="h-full overflow-y-auto font-mono text-[0.75rem]">
      {events.map((e) => (
        <li key={e.id} className="border-b border-border/60 px-3 py-1.5 hover:bg-surface-hover">
          <span className="text-muted">t={e.t.toFixed(2)}</span>{" "}
          <span className="text-accent">{e.type}</span>{" "}
          <span className="text-foreground">{e.detail}</span>
        </li>
      ))}
    </ul>
  );
}
