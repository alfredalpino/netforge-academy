# NetForge — Network Engineering Academy

A browser-based learning system built from your 28-week networking curriculum. Designed to prepare you for **NOC Analyst**, **Network Analyst**, and **Network Engineer** roles — with certification gates for CCNA, Security+, NSE 4, AZ-104, and AZ-700.

## What This Is

Not another video course. This is a structured execution system:

- **28-week curriculum** — 9 phases, 25 modules (Phase 0 → Azure L3)
- **Daily 7-hour schedule** — Theory → Config → Lab → Break/Fix → Recall
- **Topic Videos** — 51 single-concept YouTube lectures on `/topics/[slug]`
- **NetForge Simulator** — browser L2/L3 lab with CLI, packet capture, grading, and tutor hints
- **14 graded simulator labs** — LAN through OSPF, DHCP, STP, ACLs (ICMP + TCP ports), inter-VLAN (ROAS + SVI), NAT PAT
- **Playwright E2E** — 27 tests (smoke + all 14 sim lab configure/submit flows)
- **Drills** — subnetting (timed), VLSM design, recall flashcards from daily plans
- **Progress tracking** — streaks, blocks, modules, sim lab passes, export/import (localStorage + PWA IDB mirror)
- **Certification gates** — readiness with drill/lab/curriculum CTAs
- **Accountability** — check-ins, weekly review, backup reminders, import preview
- **UX polish** — light/dark theme, Today keyboard shortcuts, milestone celebrations, PWA offline shell
- **Journey navigator** — jump between milestones with watch + practice links

## Quick Start

```bash
cd network-engineering-academy
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Development

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run test       # Vitest (99 unit tests)
npm run test:e2e   # Playwright (27 E2E tests)
npm run build      # Production build
npm run validate   # lint + typecheck + test + build
```

CI (`.github/workflows/ci.yml`) runs validate steps and E2E on push/PR.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
vercel --prod
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys on push.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — journey, watch & practice, progress |
| `/today` | Daily planner with block progress + keyboard shortcuts (`N`/`P`, `1–5`, `?`) |
| `/topics` | Curated single-concept explanation videos |
| `/topics/[slug]` | Embedded topic lecture page |
| `/simulator` | NetForge networking simulator (`?lab=` deep links) |
| `/accountability` | Streaks, check-ins, weekly review, export/import |
| `/curriculum` | Phase & module browser (topics + sim lab links) |
| `/resources` | Filterable external resource library |
| `/guide` | How-to-use FAQ and tours |
| `/drills` | Drill dashboard — subnet, VLSM, recall |
| `/drills/subnetting` | Timed subnet practice |
| `/drills/vlsm` | VLSM design drills |
| `/drills/recall` | Recall flashcards from daily plans |
| `/gates` | Certification gate readiness |
| `/labs` | Lab stack + browser simulator lab launchers |

## Daily Workflow

1. **Dashboard** — see current week/day, journey, and suggested watch + practice
2. **Today** — full daily plan; use `?` for keyboard shortcuts
3. **Topic Videos** — watch one concept lecture, then practice in the simulator
4. **Simulator** — configure topology, ping, inspect Capture, submit for grading
5. **Drills** — subnetting / VLSM / recall between study blocks
6. **Accountability** — check in, weekly review, backup progress
7. **Labs** — run Packet Tracer / EVE-NG / Wireshark locally per plan

## Project Structure

```
network-engineering-academy/
├── app/                    # Next.js App Router pages
├── components/             # UI components + ui/ primitives
├── content/labs/           # Graded simulator lab definitions (14 labs)
├── features/simulator/     # Simulator UI (canvas, terminal, dock)
├── simulation/             # Packet engine, CLI, grading (React-free)
├── lib/                    # Curriculum, progress, topic videos, drills
├── tests/e2e/              # Playwright smoke + sim lab specs
├── .github/workflows/      # CI pipeline
└── vitest.config.ts
```

## Curriculum Source

Structured from a single engineering curriculum — not exam silos:

```
Packets → Protocols → Switching → Routing → Services → Security
→ Enterprise → Automation → Cloud → Azure → L3 Troubleshooting
```

**Priority path:** Phase 0 → 1 → 2 → 3 before touching FortiGate, BGP, or AZ-700.

Day-by-day plans exist for **weeks 1–28**.

### Graded simulator labs (`/simulator?lab=<id>`)

| ID | Topic |
|----|--------|
| `basic-lan` | LAN addressing + ping |
| `arp-icmp` | ARP resolution + ICMP |
| `vlan-segment` | Access VLAN isolation |
| `trunk-vlan` | 802.1Q trunk |
| `static-route` | Inter-network static routing |
| `ospf-basic` | OSPF area 0 |
| `dhcp-basic` | DHCP DORA |
| `stp-loop` | Spanning tree loop prevention |
| `acl-standard` | Standard ACL filter |
| `acl-extended` | Extended ACL (ICMP) |
| `acl-tcp` | Extended ACL TCP ports |
| `inter-vlan-routing` | Router-on-a-stick |
| `inter-vlan-svi` | L3 switch SVIs |
| `nat-basic` | NAT PAT overload |

## Data & Privacy

All progress is stored in your browser's `localStorage` (with optional PWA IndexedDB mirror). Use **Export Progress** on the Accountability page to back up your data. No account or server sync is required.

---

Built for Ubaid · Part of UBAID-Engineer tooling
