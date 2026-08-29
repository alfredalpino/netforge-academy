# 11 — State Management & Persistence

## Three state planes

| Plane | Contents | Store |
|-------|----------|-------|
| Academy progress | Days, modules, drills, gates | Existing `netforge-progress` + IDB mirror — **unchanged** |
| Simulator UI | Selection, viewport, panel layout, anim settings | In-memory + optional sessionStorage |
| Simulator durable | Labs, topologies, configs, checkpoints, captures | **New** IndexedDB `netforge-sim` |

**Tradeoff — extend ProgressState vs separate DB:** Separate DB avoids quota blowups and Zod churn. Cross-link via lab IDs / gate criteria only.

## IndexedDB schema (`netforge-sim`)

| Store | Key | Value |
|-------|-----|-------|
| `labs` | labId | LabDocument (schemaVersion, topology, configs, meta) |
| `checkpoints` | `${labId}:${checkpointId}` | Snapshot |
| `captures` | captureId | { labId, packets meta, pcapBlob? } |
| `attempts` | attemptId | { labId, score, checks[], ts } |
| `meta` | key | misc (lastOpenedLabId, …) |

## Lab document

```typescript
interface LabDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  updatedAt: string;
  topology: TopologySpec;
  runningConfigs: Record<string, string>; // deviceId → text
  startupConfigs: Record<string, string>;
  ui: { positions: Record<string, { x: number; y: number }>; viewport?: unknown };
  origin?: { catalogId?: string; templateId?: string };
}
```

## Export / import

- JSON `.nlab.json` (human-readable)
- Optional YAML lab-as-code for catalog authors
- Reuse Accountability-style confirm on overwrite

## Undo / redo

Action log for topology + config commits (PRD §52). Runtime tables not individually undoable — restore checkpoint instead.

## Future Postgres (optional)

Tables sketched in PRD §50 — only with auth. Until then, no server persistence required.
