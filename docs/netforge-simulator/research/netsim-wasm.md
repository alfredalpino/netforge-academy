# Research: Alechiis/netsim (WASM NetSim)

**Local path:** `inspiration/Alechiis-netsim/`  
**Upstream:** https://github.com/Alechiis/netsim  
**License:** **AGPL-3.0** (high copyleft risk)  
**Primary stack:** React/Vite/TS + Rust WASM + Zustand + React Flow

---

## 1. What it does

Feature-rich browser network simulator with multi-vendor CLI flavors, React Flow canvas, labs/exam mode, optional 3D viz, and a Rust→WASM core for CLI/sim pieces.

## 2. Architecture

- UI: `src/components`, `src/features`, Zustand slices
- WASM: `wasm-core/` Rust (`cli/`, `simulation/`, `protocols/`) via `src/wasm/wasmBridge.ts`
- Dual CLI: large TS command trees + WASM executor
- Schema migrations + Containerlab exporter utilities

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | WASM DES with BinaryHeap — early/partial; much logic still TS |
| Protocols | Broad surface area; depth uneven |
| CLI | Hierarchical multi-vendor profiles |
| Topology | Rich typed devices/ports; schema versioning |
| Rendering | React Flow + optional Three.js |
| Worker/WASM | **Primary WASM reference** among inspiration set |
| Packets | UI packet edges/animations; weak PCAP story |
| Grading | Labs + exam mode (timer, strikes, XP) |
| UX | Device packs, exam pedagogy, glass UI |

## What NetForge should learn (concepts only)

- UI ↔ WASM boundary (`set_topology`, `execute_command`, `ping`)
- Schema migrations for saved labs
- Multi-vendor CLI **profiles** (later)
- Exam UX (timer / strikes) as pedagogy pattern
- React Flow port handles

## What NetForge must NOT copy

**Any substantial TS/Rust/WASM source.** AGPL-3.0 is incompatible with a closed or commercial academy SaaS without AGPL compliance (network copyleft). Treat as **idea-only**.

## Rewrite from first principles

All engines and UI. Prefer TS Worker first; consider **original** WASM later if profiling demands it — not a fork of this crate.

## Client vs server lesson

True browser-first aligns with NetForge; license forbids implementation reuse.

## Limitations

AGPL; dual CLI complexity; incomplete DES; marketing breadth vs fidelity gap.
