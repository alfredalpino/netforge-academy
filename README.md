# NetForge — Network Engineering Academy

A distraction-free, browser-based learning system built from your 28-week networking curriculum. Designed to prepare you for **NOC Analyst**, **Network Analyst**, and **Network Engineer** roles — with certification gates for CCNA, Security+, NSE 4, AZ-104, and AZ-700.

## What This Is

Not another video course. This is a structured execution system:

- **28-week curriculum** — 8 phases, 24 modules (Phase 0 → Azure L3)
- **Daily 7-hour schedule** — Theory → Config → Lab → Break/Fix → Recall
- **Focus Mode** — timer + checklist only, no sidebar distractions
- **Week 1–4 day-by-day plans** — theory, commands, labs, break/fix, recall, gates
- **Subnetting drills** — timed practice with instant feedback
- **Progress tracking** — streaks, completed days/blocks (localStorage)
- **Certification gates** — competency checks before exam prep

## Quick Start

```bash
cd network-engineering-academy
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Install Vercel CLI (once)
npm i -g vercel

# From project root
vercel

# Production
vercel --prod
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deploys on push.

## Daily Workflow

1. **Dashboard** — see current week/day and streak
2. **Today** — full daily plan with theory, config, lab, break/fix, recall
3. **Focus Mode** — enter distraction-free session with block timer
4. **Subnet Drills** — daily subnetting practice (especially Sundays)
5. **Labs** — run Packet Tracer / EVE-NG / Wireshark locally per plan

## Curriculum Source

Structured from `Ubaid100xHunter/Time table.md` — one engineering curriculum, not exam silos:

```
Packets → Protocols → Switching → Routing → Services → Security
→ Enterprise → Automation → Cloud → Azure → L3 Troubleshooting
```

**Priority path:** Phase 0 → 1 → 2 → 3 before touching FortiGate, BGP, or AZ-700.

## Project Structure

```
network-engineering-academy/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── focus/page.tsx        # Distraction-free study mode
│   ├── today/page.tsx        # Daily planner
│   ├── curriculum/           # Phase & module browser
│   ├── drills/subnetting/    # Subnet practice tool
│   ├── gates/page.tsx        # Certification gates
│   └── labs/page.tsx         # Lab stack setup
├── lib/
│   ├── curriculum.ts         # Phases, modules, gates
│   ├── daily-plans.ts        # Week 1–4 day-by-day
│   ├── schedule.ts           # Daily blocks, weekly rhythm
│   ├── progress.ts           # Progress hook (localStorage)
│   └── subnetting.ts         # Drill logic
└── components/
```

## NOC / Network Analyst Job Readiness

This curriculum targets the skills NOC and junior network roles actually test:

- Systematic troubleshooting (not command memorization)
- Subnetting at speed
- Wireshark packet analysis
- VLAN/STP/routing fundamentals
- Incident documentation mindset
- Progression: NOC → Network Engineer via demonstrated lab ability

---

Built for Ubaid · Part of UBAID-Engineer tooling
