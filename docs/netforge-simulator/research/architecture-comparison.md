# Architecture Comparison — Inspiration Synthesis

**Date:** 2026-08-30  
**Policy:** Conceptual reuse only; clean-room implementation for NetForge.

---

## License risk ranking (safest → riskiest)

| Rank | Repo | License | Risk note |
|------|------|---------|-----------|
| 1 | joxorsayan-netsim | MIT | Safe to study; still reimplement |
| 1 | NETWORKERS-HOME-123-cisco-real-sim | MIT | Same |
| 3 | srl-labs-containerlab | BSD-3-Clause | Attribution / no-endorsement |
| 4 | srl-labs-containerlab-app | MIT / Apache-2.0 metadata conflict | Clarify before shipping derivatives |
| 5 | EvilPrime98-PackeTTrino | GPL-3.0 | Copyleft if combined |
| 6 | Alechiis-netsim | AGPL-3.0 | Strongest network copyleft |
| 7 | lukaudev-broadcast-studio | None | No permission to copy code |

---

## Best reference by dimension

| Dimension | Best | Runner-up |
|-----------|------|-----------|
| Browser DES engine | cisco-real-sim (Worker + EventQueue) | joxorsayan (clarity of DES) |
| CLI pedagogy | joxorsayan | cisco-real-sim |
| Topology UI | Broadcast Studio (ideas) / Alechiis RF | containerlab-app YAML+graph |
| Lab-as-code schema | containerlab schema | joxorsayan YAML validate |
| WASM / perf ideas | Alechiis (ideas only) | — |
| Packet visualization | PackeTTrino (ideas only) | joxorsayan capture+PCAP |
| Grading | joxorsayan live checks | cisco-real-sim answer keys |

---

## Conceptual synthesis for NetForge

### Product tiers

| Tier | Runtime | When |
|------|---------|------|
| **A — Default** | Browser DES (TS Web Worker) | P0 onward — Academy core |
| **B — Optional advanced** | Containerlab host API | Post-P2 — never required for CCNA path |

### Engine

- Single shared TypeScript core: topology graph, DES queue, protocols, CLI
- Main thread = React UI; Worker = sim + CLI
- Capture buffer → optional `.pcap`
- Optional original WASM later if profiling proves need (not AGPL fork)

### Canvas

- **React Flow / XYFlow** for editor UX (aligns with Next/React Academy)
- Packet animation as **overlay** driven by event log (DES never waits on FPS)

### Tradeoff: React Flow vs Konva

| Option | Pros | Cons |
|--------|------|------|
| React Flow | Fast polished IDE, handles, minimap, ecosystem | Custom packet anim needs overlay work |
| Konva | Pixel-level anim control | More custom editor chrome; weaker graph editor defaults |

**Decision:** React Flow for P0–P2. Revisit only if packet viz cannot meet quality bar.

### Tradeoff: TS Worker vs Python server vs WASM

| Option | Pros | Cons |
|--------|------|------|
| TS Worker | Zero-install, offline, shared types, fits PWA | Perf ceiling for huge labs |
| Python server (joxo style) | Fast protocol research | Breaks offline; scaling cost; not Academy default |
| Rust WASM | Higher throughput | Toolchain cost; premature without profiles; AGPL examples unusable |

**Decision:** TS Worker P0–P2; WASM optional P3+.

### Labs & grading

- NetForge-native lab schema (nodes/links/config/checks) inspired by containerlab + joxo
- Client deterministic live checks for submit
- Future server answer-key audit when auth exists
- Exam UX (timer/strikes) as optional pedagogy later

### What never to copy

- Alechiis / PackeTTrino / Broadcast Studio **source**
- Real Cisco IOS / Packet Tracer assets
- Server-only DES as sole architecture
- Viz-gated async as sole event model
- Docker-in-browser

### Client / server boundary (NetForge)

| Client (required) | Server (optional / future) |
|-------------------|----------------------------|
| Topology editor, DES, CLI, packet viz, local grade preview | Auth, lab catalog CDN, authoritative grade store, clab-api bridge |
| Offline practice via PWA + IDB | Multi-device sync, classroom, certificates |
