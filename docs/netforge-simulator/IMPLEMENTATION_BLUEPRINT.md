# NetForge Network Simulator — Implementation Blueprint

**Status:** P0 shipped; P1 maturity in progress — React Flow + VLAN + icons; Worker protocol ready (UI async main bridge)  
**Date:** 2026-08-30  
**Product vision SSoT:** [`NETFORGE NETWORK SIMULATOR.md`](../../NETFORGE%20NETWORK%20SIMULATOR.md)  
**Existing academy:** preserve and extend; do not replace design language or study OS
**Asset attribution:** [`public/simulator/ATTRIBUTION.md`](../../public/simulator/ATTRIBUTION.md)

---

## Purpose of this folder

This folder is the **executable architecture plan** for building the browser-native NetForge Network Simulator inside the existing Academy app. Another coding agent should follow these docs incrementally without inventing a conflicting stack.

---

## Non-goals (this planning phase)

- **No production simulator features** — no routes, engines, or UI shipped beyond docs
- **No merging / vendoring inspiration code** into `app/`, `components/`, or `lib/`
- **No design-system replacement** — extend tokens in `app/globals.css`, do not invent a new brand
- **No Cisco IOS images** or proprietary NOS in the browser
- **No Containerlab/Docker as the default runtime** for public zero-install labs
- **No auth/DB rewrite** as a prerequisite for P0 (local-first first)

---

## Hard constraints

| Constraint | Implication |
|------------|-------------|
| Zero-install, browser-first | DES + CLI run client-side (Web Worker); server optional later |
| Educational NetForgeOS | Cisco-*style* CLI semantics; never claim to ship Cisco software |
| Deterministic simulation | Same topology + config + seed + events → same results (grading/tests/AI) |
| Preserve Academy | Progress Zod schema, gates, drills, curriculum, PWA stay intact |
| License hygiene | AGPL/GPL/unlicensed inspiration = conceptual only; clean-room rewrite |
| Every major choice | Documented tradeoffs (see architecture docs) |

---

## Document index

### Foundations

| Doc | Topic |
|-----|-------|
| [00-audit-existing-academy.md](./00-audit-existing-academy.md) | Current NetForge audit; preserve vs extend |
| [01-product-architecture.md](./01-product-architecture.md) | System architecture, client/server boundary, tiers |
| [02-information-architecture.md](./02-information-architecture.md) | Nav, routes, user flows |
| [03-ui-ux-design-system.md](./03-ui-ux-design-system.md) | Design tokens, dense workspace mode |
| [04-simulator-workspace.md](./04-simulator-workspace.md) | IDE layout, panels, component hierarchy |

### Core engine & domain

| Doc | Topic |
|-----|-------|
| [05-topology-canvas.md](./05-topology-canvas.md) | React Flow canvas architecture |
| [06-domain-models.md](./06-domain-models.md) | Device / interface / link / packet models |
| [07-simulation-engine.md](./07-simulation-engine.md) | DES engine, execution model |
| [08-protocol-architecture.md](./08-protocol-architecture.md) | Protocol modules & phased roadmap |
| [09-cli-architecture.md](./09-cli-architecture.md) | Parser, modes, show commands |
| [10-worker-wasm-strategy.md](./10-worker-wasm-strategy.md) | Web Worker first; WASM later |

### Persistence, labs, learning

| Doc | Topic |
|-----|-------|
| [11-state-persistence.md](./11-state-persistence.md) | State mgmt, IDB schema, snapshots |
| [12-lab-schema-grading.md](./12-lab-schema-grading.md) | Lab-as-code, grading engine |
| [13-packets-troubleshooting-ai.md](./13-packets-troubleshooting-ai.md) | Viz, capture, root-cause, AI tutor |
| [14-academy-integration.md](./14-academy-integration.md) | Labs / Drills / Gates / Curriculum |

### Cross-cutting

| Doc | Topic |
|-----|-------|
| [15-security-performance-testing.md](./15-security-performance-testing.md) | Security, perf, test strategy |
| [16-api-deployment-observability.md](./16-api-deployment-observability.md) | API contracts, deploy, scale, observability |
| [17-accessibility-responsive.md](./17-accessibility-responsive.md) | a11y + responsive behavior |
| [18-roadmap-milestones.md](./18-roadmap-milestones.md) | P0–P3, milestones, dependency graph |
| [19-risks-open-questions.md](./19-risks-open-questions.md) | Risks + decisions needed from product owner |
| [20-task-sequence.md](./20-task-sequence.md) | Incremental task list for coding agents |
| [21-phase-p1-maturity-plan.md](./21-phase-p1-maturity-plan.md) | **P1 locked decisions + precise next-phase plan** |

### Research (inspiration)

| Doc | Topic |
|-----|-------|
| [research/netsim-python.md](./research/netsim-python.md) | joxorsayan/netsim |
| [research/netsim-wasm.md](./research/netsim-wasm.md) | Alechiis/netsim |
| [research/cisco-real-sim.md](./research/cisco-real-sim.md) | NETWORKERS-HOME-123/cisco-real-sim |
| [research/broadcast-studio.md](./research/broadcast-studio.md) | lukaudev/broadcast-studio |
| [research/containerlab.md](./research/containerlab.md) | srl-labs/containerlab |
| [research/containerlab-app.md](./research/containerlab-app.md) | srl-labs/containerlab-app |
| [research/packettrino.md](./research/packettrino.md) | EvilPrime98/PackeTTrino |
| [research/architecture-comparison.md](./research/architecture-comparison.md) | Cross-repo synthesis |

### Inspiration clones (not product code)

See [`inspiration/README.md`](../../inspiration/README.md).

---

## One-page architectural verdict

```text
Main thread (React / Next.js / existing design system)
  ├── Topology canvas (React Flow / XYFlow)
  ├── Inspector / palette / bottom panels
  └── Terminal UI (xterm.js)
         │ postMessage
Web Worker
  ├── Discrete-event simulation core (TypeScript)
  ├── Protocol modules (L2 → L3 → services)
  ├── CLI interpreter (NetForgeOS Cisco-style)
  └── Capture buffer → event log / PCAP builder

Persistence: IndexedDB `netforge-sim` (separate from academy progress)
Labs: NetForge lab-as-code YAML/JSON + deterministic graders
AI: Rule-based root-cause → LLM narrates structured evidence only
Advanced tier (future): optional Containerlab host — never default path
```

---

## How a coding agent should start

1. Read this blueprint + [00-audit](./00-audit-existing-academy.md) + [18-roadmap](./18-roadmap-milestones.md)
2. Execute [20-task-sequence.md](./20-task-sequence.md) **P0 tasks only** until milestone gates pass
3. Do not import from `inspiration/`
4. Do not change academy progress schema without additive Zod defaults
5. Log actions under `logs/` per parent AGENTS.md
