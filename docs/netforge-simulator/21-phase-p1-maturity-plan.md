# 21 — P1 Maturity Phase Plan (Locked Decisions)

**Status:** Decisions locked for execution  
**Date:** 2026-08-30  
**Depends on:** P0 complete (`/simulator` ping lab, DES, CLI, grading, IDB)  
**Goal:** Move from “working vertical slice” to a **mature, production-shaped lab product** — reliable runtime, professional workspace, pedagogical packet/VLAN depth — without protocol scope creep.

---

## Phase objective

Ship a simulator that feels like a real network-engineering console:

- Simulation never blocks the UI
- Topology editing is real (not visual-only)
- Packets explain *why* connectivity works/fails
- One VLAN lab proves L2 pedagogy
- Academy entry points are clear
- CI prevents architectural drift

**Non-goals this phase:** OSPF/BGP, auth/cloud DB, LLM tutor, Containerlab Tier B, WASM, collaboration.

---

## Locked decisions (do not reopen mid-phase)

| # | Topic | Decision | Why (maturity) | Rejected alternative |
|---|--------|----------|----------------|----------------------|
| D1 | Sim runtime | **Dedicated Worker is the only UI runtime** for DES/CLI/grading calls | UI jank-free; matches blueprint; forces clean message protocol | Keep main-thread forever |
| D2 | Canvas | **Adopt `@xyflow/react` now**; replace custom HTML canvas | Industry-standard graph UX; pan/zoom/edges; enables freeform labs | Stay on custom canvas until P2 |
| D3 | Terminal | **`@xterm/xterm` + fit addon** for Terminal tab | Professional density; scrollback; matches net-eng muscle memory | Textarea indefinitely |
| D4 | UI state | **Zustand store scoped to `features/simulator` only** | Local re-renders; clear boundary from academy `ProgressProvider` | Dump into React context / progress Zod |
| D5 | Module layout | **Remain in-tree** (`features/`, `simulation/`, `content/`) | Avoid monorepo tax before protocol surface stabilizes | npm workspaces / packages now |
| D6 | Auth / cloud | **Local-first through end of P1** | No auth project blocking pedagogy | Clerk/Supabase in P1 |
| D7 | Lab format | **Typed TS/JSON catalog is runtime SSoT**; `.nlab.yaml` is authoring mirror validated in CI | Zero fragile runtime YAML in browser; authors still get YAML | Runtime js-yaml only |
| D8 | Freeform topology | **Palette + React Flow must mutate engine topology** (add/remove device/link) | Closes P0 “visual-only” gap; required for maturity | Sample-lab-only forever |
| D9 | Pedagogy order | **Packet inspector + replay → VLAN lab → CLI `?`/abbrev polish → DHCP/ACL (optional late)** | Teaching value before more protocols | Jump to STP/OSPF |
| D10 | Academy wiring | **Additive only**: Labs page CTA + optional `simulatorLabId` on runbooks; **gates additive** | Preserve external Lab Stack; no progress schema break | Replace PT/EVE requirements |
| D11 | Quality gate | **Playwright smoke + engine Vitest goldens required** for simulator PRs | Mature delivery bar | Manual-only QA |
| D12 | AI | **No LLM in P1**; optional structured “hints” from check evidence only | Prevents hallucinated teaching | Vercel AI Gateway now |
| D13 | Tier B | **Containerlab explicitly out** until post-P2 product review | Protects zero-install brand | Host-lab distraction |
| D14 | Legal / license | **Clean-room only**; never import `inspiration/`; product stays closed unless owner publishes otherwise | AGPL/GPL/unlicensed risk | Vendor any inspiration code |
| D15 | Brand language | **UI disclaimer:** “NetForgeOS — educational Cisco-*style* CLI. Not affiliated with Cisco.” in TopBar/help | Mature product honesty | Silent IOS cosplay |
| D16 | Static routes | **Keep educational static + connected routes in P1**; OSPF = P2 | Finish L2 story first | Early OSPF |

---

## Exit criteria (P1 done when all true)

1. UI talks to simulation **only** via Worker message protocol v1 (typed).
2. Student can **add router/switch/host, draw links, delete**, and engine reflects topology.
3. Terminal is **xterm**-based; CLI sessions survive device switches.
4. Packet list → **layer inspector** → hop highlight on canvas; basic **replay**.
5. Catalog lab **`vlan-segment`** grades: access VLAN isolation + trunk success path.
6. Labs page shows **Open in Simulator** for Basic LAN (+ VLAN).
7. Playwright: open `/simulator` → Sample → (fixture-configured state or scripted CLI) → Submit pass **or** documented seeded-pass path.
8. `npm run validate` green; no `inspiration/` imports in product code.
9. TopBar/help shows NetForgeOS disclaimer.

---

## Workstreams (precise order)

Do **not** reorder across streams without updating this doc. Parallelize only within a stream after its prerequisite stream’s exit is met.

### Stream A — Production runtime (first)

| Task | Deliverable | Done when |
|------|-------------|-----------|
| A1 | Freeze `ToWorker` / `FromWorker` types in `simulation/workers/protocol.ts` | Shared types; version field `v: 1` |
| A2 | Wire `useSimulationWorker` using `new Worker(new URL(...))` | Shell uses Worker; main-thread hook becomes test-only or deleted from UI |
| A3 | CSP / Next bundling smoke | Dev + production build load Worker; no console CSP errors |
| A4 | Migrate grading submit through Worker | Score tab still works offline |

**Exit A:** Ping Sample lab works end-to-end on Worker in production build.

### Stream B — Mature workspace chrome

| Task | Deliverable | Done when |
|------|-------------|-----------|
| B1 | Add `@xyflow/react`; `TopologyCanvas` on React Flow | Pan/zoom; device nodes; link edges |
| B2 | Freeform: palette drop → `engine.addDevice`; connect handles → `engine.addLink` | Engine topology matches canvas |
| B3 | Delete selection + undo/redo stack (UI + engine snapshots) | Ctrl/Cmd+Z restores last snapshot |
| B4 | Add `@xterm/xterm`; replace textarea | Fit on dock resize; prompt sync |
| B5 | Zustand `simulatorStore` (selection, dock tab, lab meta, UI flags) | Shell thins out; ProgressProvider untouched |
| B6 | Disclaimer + Focus-canvas toggle (collapse academy chrome density later if needed) | Copy visible; optional full-bleed |

**Exit B:** Freeform two-host + switch ping without Sample presets (still may use template helper).

### Stream C — Packet pedagogy

| Task | Deliverable | Done when |
|------|-------------|-----------|
| C1 | Normalize `PacketTrace` + per-hop layer snapshots | Inspector shows Eth/ARP/IP/ICMP fields |
| C2 | Packets tab selection drives canvas hop highlight | Reduced-motion: static hops |
| C3 | Simple replay (step through hops) | Play/pause; no correctness tied to rAF |
| C4 | Capture ring buffer (in-memory; no PCAP file yet) | Capture tab lists frames |

**Exit C:** Student can explain an ARP miss → request → reply → echo from UI alone.

### Stream D — VLAN + second catalog lab

| Task | Deliverable | Done when |
|------|-------------|-----------|
| D1 | Switchport access/trunk model on interfaces | Config via CLI |
| D2 | VLAN-aware L2 forward / isolation | Wrong VLAN ping fails deterministically |
| D3 | `show vlan brief`, `show mac address-table` | CLI coverage |
| D4 | Lab `vlan-segment` + grading checks | Vitest + Submit ≥ pass |
| D5 | `show` / `?` abbreviation hardening | Unique-prefix tests |

**Exit D:** VLAN lab in catalog; Basic LAN still passes.

### Stream E — Academy integration & quality

| Task | Deliverable | Done when |
|------|-------------|-----------|
| E1 | Labs page CTA → `/simulator?lab=basic-lan` | Deep link loads lab |
| E2 | Optional additive `progress.simulator` summary fields (Zod defaults) | No migration break |
| E3 | Playwright smoke spec | CI-ready script |
| E4 | PR checklist: no inspiration imports; Worker-only UI path | Documented in `20-task-sequence` or CONTRIBUTING note |
| E5 | Update blueprint status: P0 done / P1 in progress | Docs match reality |

**Exit E:** Discoverable from Academy; automated smoke exists.

### Stream F — Late P1 (only if A–E green)

- DHCP educational subset  
- Standard ACL (1–2 lab checks)  
- STP *overview* (blocking port demo) — cut if schedule slips  

---

## Dependency graph (P1)

```text
A Worker protocol/cutover
        ↓
B React Flow + freeform + xterm + Zustand
        ↓
C Packet inspector / replay / capture buffer
        ↓
D VLAN model + vlan-segment lab + CLI polish
        ↓
E Academy CTAs + Playwright + progress additives
        ↓
F Optional DHCP/ACL/STP overview
```

---

## Concrete execution checklist (for the next coding agent)

1. [ ] A1–A4 Worker cutover  
2. [ ] B1–B3 React Flow + freeform topology API on controller  
3. [ ] B4–B5 xterm + Zustand  
4. [ ] B6 Disclaimer  
5. [ ] C1–C4 Packet pedagogy  
6. [ ] D1–D5 VLAN lab  
7. [ ] E1–E5 Academy + Playwright + docs  
8. [ ] Log actions under `logs/`  
9. [ ] `npm run validate` before merge  

**Controller API additions expected (engine, React-free):**

- `addDevice` / `removeDevice`  
- `addLink` / `removeLink`  
- `setSwitchport(...)`  
- Snapshot-friendly undo via existing `snapshot`/`restore`  

---

## Risks specific to this phase

| Risk | Mitigation |
|------|------------|
| Worker + Turbopack packaging | Spike A3 immediately; fallback documented only for tests |
| React Flow edge/interface binding complexity | Explicit interface handles in node UI; one cable = one link endpoints |
| xterm SSR | Client-only dynamic import |
| VLAN scope creep into STP | STP stays Stream F optional |
| Zustand duplicated with local useState | Migrate shell state in one PR after Worker |

---

## Success metric

A new learner can: open Simulator from Labs → complete Basic LAN → complete VLAN lab → use packet inspector to debug a wrong-VLAN failure — all **zero-install**, offline-capable, with Worker-isolated simulation — and CI proves the smoke path.
