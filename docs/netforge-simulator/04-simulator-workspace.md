# 04 — Simulator Workspace Layout

## Layout (desktop)

```text
┌───────────────────────────────────────────────────────────────┐
│ NetForge │ Lab: … │ Save │ Run │ Submit │ ⋯                  │
├─────────────┬─────────────────────────────────────┬───────────┤
│ DEVICE      │                                     │ INSPECTOR │
│ PALETTE     │          TOPOLOGY CANVAS            │           │
│             │                                     │           │
├─────────────┴─────────────────────────────────────┴───────────┤
│ TERMINAL / PACKETS / LOGS / EVENTS / SCORE / AI               │
└───────────────────────────────────────────────────────────────┘
```

Matches PRD §8.

## Panel behavior

| Panel | Default | Collapsible | Notes |
|-------|---------|-------------|-------|
| Palette | Open | Yes | Drag sources only |
| Inspector | Open when selection | Yes | Empty state when none |
| Bottom dock | Open | Yes (height) | Terminal primary tab |
| Academy Sidebar | Remains | Existing mobile drawer | Simulator is dense; consider full-bleed option later |

**Tradeoff — hide Academy sidebar in sim:** Gains canvas space; risks losing study OS orientation. P0 keep sidebar; P1 add “Focus canvas” toggle that collapses academy nav.

## Component hierarchy (implementation)

```text
features/simulator/
  shell/SimulatorShell.tsx
  chrome/SimTopBar.tsx
  palette/DevicePalette.tsx
  canvas/TopologyCanvas.tsx
  canvas/nodes/*DeviceNode.tsx
  canvas/edges/LinkEdge.tsx
  inspector/InspectorPanel.tsx
  inspector/tabs/*
  dock/BottomDock.tsx
  dock/TerminalPane.tsx
  dock/PacketsPane.tsx
  dock/EventsPane.tsx
  dock/CapturePane.tsx
  dock/ScorePane.tsx
  dock/TutorPane.tsx
  hooks/useSimulationWorker.ts
  store/simulatorStore.ts
```

## Keyboard & command palette

Priority shortcuts (PRD §58–59): Save, Undo/Redo, Delete selection, Open terminal, Run ping wizard, Command palette (`⌘K`). Document in `/guide` tour later.

## Empty / first-run

- Empty canvas + “Load template” / “Open sample: Basic LAN”
- Optional short tour (`data-tour`) using existing TourProvider patterns
