# NetForge — Network Engineering Academy

A distraction-free, browser-based learning system built from your 28-week networking curriculum. Designed to prepare you for **NOC Analyst**, **Network Analyst**, and **Network Engineer** roles — with certification gates for CCNA, Security+, NSE 4, AZ-104, and AZ-700.

## What This Is

Not another video course. This is a structured execution system:

- **28-week curriculum** — 8 phases, 24 modules (Phase 0 → Azure L3)
- **Daily 7-hour schedule** — Theory → Config → Lab → Break/Fix → Recall
- **Focus Mode** — Pomodoro timer + checklist, no sidebar distractions
- **Week 1–4 day-by-day plans** — theory, commands, labs, break/fix, recall, gates
- **Subnetting drills** — timed practice with instant feedback
- **Progress tracking** — streaks, blocks, modules, export/import (localStorage)
- **Certification gates** — readiness tracked from modules, drills, and lab setup
- **Accountability** — daily check-ins, weekly goals, activity heatmap
- **Journey navigator** — jump between milestones with confirmation
- **Onboarding tours** — guided walkthrough of the app

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
npm run test       # Vitest unit tests
npm run build      # Production build
npm run validate   # All of the above
```

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
| `/` | Dashboard — position, journey, progress |
| `/today` | Daily planner with block progress |
| `/focus` | Distraction-free Pomodoro study mode |
| `/accountability` | Streaks, check-ins, export/import |
| `/curriculum` | Phase & module browser |
| `/resources` | Filterable external resource library |
| `/guide` | How-to-use FAQ and tours |
| `/drills/subnetting` | Timed subnet practice |
| `/gates` | Certification gate readiness |
| `/labs` | Lab stack setup checklist |

## Daily Workflow

1. **Dashboard** — see current week/day and streak
2. **Today** — full daily plan with theory, config, lab, break/fix, recall
3. **Focus Mode** — enter distraction-free session with block timer
4. **Subnet Drills** — daily subnetting practice (especially Sundays)
5. **Accountability** — check in, review heatmap, backup progress
6. **Labs** — run Packet Tracer / EVE-NG / Wireshark locally per plan

## Project Structure

```
network-engineering-academy/
├── app/                    # Next.js App Router pages
├── components/             # UI components + ui/ primitives
├── hooks/                  # usePomodoro
├── lib/                    # Curriculum data, progress, gates, subnetting
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

**Note:** Detailed day-by-day plans exist for weeks 1–4. Weeks 5–28 use module-based study content in Today and Focus Mode.

## Data & Privacy

All progress is stored in your browser's `localStorage`. Use **Export Progress** on the Accountability page to back up your data. No account or server sync is required.

---

Built for Ubaid · Part of UBAID-Engineer tooling
