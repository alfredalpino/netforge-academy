# 01 — Product Architecture

## Objective

Ship a **browser-native, zero-install** network engineering laboratory inside NetForge Academy that teaches *why* networks work or fail — not a Packet Tracer clone and not a GNS3/EVE replacement.

## System context

```text
┌─────────────────────────────────────────────────────────────┐
│ NetForge Academy (existing Next.js app)                     │
│  Study OS · Progress · Drills · Gates · Curriculum · PWA    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Simulator Domain (new)                                │  │
│  │  features/simulator (UI)                              │  │
│  │  simulation/* (engine — React-free)                   │  │
│  │  labs/*.nlab.{yaml,json}                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │ optional future
         ▼
   Auth / catalog / grade audit / Containerlab host API
```

## Architectural principles

1. **Determinism** — topology + config + seed + events ⇒ identical outcomes
2. **Domain separation** — simulation core never imports React
3. **Academy shell preserved** — simulator is a feature domain, not a rewrite
4. **NetForgeOS** — Cisco-style educational CLI; no proprietary IOS images
5. **Local-first** — works without accounts; cloud is additive

## Recommended stack (aligned with PRD §50 + audit)

| Layer | Choice | Tradeoff |
|-------|--------|----------|
| App shell | Existing Next.js 16 + React 19 + Tailwind 4 | No greenfield rewrite |
| Canvas | `@xyflow/react` | vs Konva — see research comparison |
| Terminal UI | `xterm.js` | vs textarea — realism vs deps |
| UI state | Lightweight store (Zustand **or** React context) scoped to simulator | vs dumping into ProgressProvider — keep academy progress clean |
| Sim runtime | TypeScript Dedicated Worker | vs Python server / premature WASM |
| Persistence | IndexedDB `netforge-sim` + export JSON | vs Postgres now — no auth yet |
| Validation | Zod for lab schema + persistence | Matches academy pattern |

**Tradeoff — Zustand vs Context:** Zustand matches inspiration and keeps re-renders local; Context matches academy. Prefer **Zustand (or equivalent) only inside simulator feature** so academy ProgressProvider stays untouched.

**Tradeoff — no DB in P0:** Avoids auth project; limits multi-device. Mitigate with export/import + IDB. Introduce Postgres only with optional accounts (P2+).

## Runtime architecture

```text
Main thread                         Worker
───────────                         ──────
React Flow canvas          postMessage
Inspector / palette   ←──────────→  SimulationController
xterm terminal                      EventQueue (DES)
Packet animator ← event log         Protocol modules
Lab grader (preview)                CLI interpreter
IDB save/load                       Capture buffer
```

## Tiering

| Tier | Name | Runtime | Priority |
|------|------|---------|----------|
| A | Browser Lab | DES Worker | P0 default |
| B | Advanced Host Lab | Containerlab via API | Future optional |

## Folder / module structure (target)

Align with PRD §87 but fit current repo layout (`app/`, `components/`, `lib/`):

```text
app/simulator/                 # routes
features/simulator/            # UI: canvas, inspector, terminal, panels
simulation/
  core/                        # DES, controller, types
  devices/
  packets/
  protocols/
  cli/
  grading/
  workers/                     # worker entry + protocol
lib/labs/                      # lab schema parsers (or packages later)
content/labs/                  # lab-as-code files
```

Long-term optional packages: `packages/simulation-core`, `cli-engine`, `lab-schema`, `grading-engine`.

## Non-negotiable boundaries

| Must NOT depend on React | May use React |
|--------------------------|---------------|
| `simulation/core` | `features/simulator/*` |
| `simulation/cli` | `app/simulator/*` |
| `simulation/grading` | Academy pages linking in |
| `simulation/protocols` | |

## Success criteria (product)

- Open `/simulator` with zero install
- Build topology → configure via CLI → ping → watch packets → inspect → grade lab
- Deterministic tests for engine
- Academy nav/progress/gates still work unchanged when simulator unused
