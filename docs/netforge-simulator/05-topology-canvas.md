# 05 — Topology Canvas Architecture

## Choice: React Flow / XYFlow

**Decision:** `@xyflow/react` for the topology editor.

| Alternative | Why not default |
|-------------|-----------------|
| Konva | Better raw anim; weaker graph-editor defaults |
| Vanilla SVG | Too much custom chrome (see joxo) |
| Three.js | Overkill; optional later for “wow” only |

## Responsibilities

| Canvas owns | Engine owns |
|-------------|-------------|
| Positions, selection, viewport | Logical topology, L1/L2/L3 state |
| Drag/drop from palette | Interface/link validity |
| Edge routing visuals | Bandwidth/latency/loss semantics |
| Rendering packet overlays | Emitting packet events |

## Required features (P0–P1)

- Pan, zoom, grid, snap
- Minimap (P1)
- Multi-select, box select (P1)
- Undo/redo of topology edits (P0 basic)
- Link creation via port handles
- Device status / link status styling
- Keyboard delete

## Node model

- Custom nodes per `DeviceType` with **port handles** (not center-only)
- Compact silhouette + label + status LED
- Selection opens Inspector

## Edge model

- One React Flow edge ↔ one `NetworkLink`
- Style by `up/down` and optional traffic heat (later)
- Midpoint label for bandwidth optional (off by default — reduce clutter)

## Packet overlay

```text
DES produces PacketTrace[]
  → main thread PacketAnimator
  → temporary overlay nodes/edges or canvas layer
  → does not block Worker
```

**Tradeoff:** Overlay complexity vs baking packets into RF edges. Prefer dedicated overlay so RF graph stays editable during replay.

## Sync protocol

1. UI edits → `SimulationController` messages (addDevice, connect, move — move may be UI-only)
2. Worker validates connections (interface free, compatible types)
3. Worker returns accepted topology patch + diagnostics

Positions may live primarily in UI state; engine cares about connectivity graph.

## Performance

- Memoize custom nodes
- Virtualize only if >~200 nodes (rare for educational labs)
- Cap animated concurrent packets (e.g. 32) with “+N more” in events panel
