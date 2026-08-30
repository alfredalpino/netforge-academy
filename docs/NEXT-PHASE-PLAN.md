# NetForge Academy — Next Phase Plan

**Created:** 2026-08-28  
**Updated:** 2026-08-30  
**Status:** Active — simulator + content sprint in progress

---

## Where We Are

Shipped and validated (`npm run validate` + Playwright E2E):

- **Week 1–28 day plans** in `lib/daily-plans.ts`
- **14 graded browser simulator labs** — L2/L3 through OSPF, DHCP, STP, ACLs (ICMP + TCP ports), inter-VLAN routing (ROAS + SVI), NAT PAT
- **Simulator engine** — VLAN/trunk, static/OSPF routes, DHCP DORA, STP blocking, standard + extended ACLs (with TCP/UDP port eq), router subinterfaces (ROAS), L3 switch SVIs, NAT PAT overload, capture/tutor panes, Web Worker runtime
- **96 unit tests**, **27 E2E tests** (smoke incl. gates/drills + all 14 sim lab interactions)
- Progress, gates, drills, topic videos (51 lectures), journey navigator
- **Today keyboard shortcuts** — day nav (N/P), block toggle (1–5), ? help overlay

**Status:** Production-ready for browser-deliverable scope (see `logs/2026-08-30-production-audit.log`).

**Optional expansion:** lab runbooks for weeks beyond 5–6; Supabase sync (Phase 5).

---

## Phase 1 — Content & Learning Loop (Priority: High)

Goal: Tie daily plans to simulator labs and topic videos per module.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 1.1 | **Module → lab mapping** | Students need clear sim deep links per week | Extend `lib/academy-resources.ts` as new labs land |
| 1.2 | **Lab runbooks per week** | Labs page needs step-by-step for browser + local stack | `lib/lab-runbooks.ts` keyed to week/day |
| 1.3 | **Guide + README hygiene** | Onboarding docs match catalog | Keep `/guide`, README lab table current |

**Done when:** Today + Labs pages deep-link to the right browser lab for each VLAN/routing/security week.

---

## Phase 2 — Drills & Assessment (Priority: High)

Goal: Turn drills from a single subnet page into a certification prep engine.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 2.1 | **VLSM drill mode** | CCNA gate requires subnet mastery beyond /24 | New question generator in `lib/subnetting.ts` |
| 2.2 | **Recall quiz mode** | Daily recall block needs in-app practice | Flashcard-style component; questions from day plan recall items |
| 2.3 | **Drill dashboard** | One page for all drill types + history | `/drills` index with stats from `progress.drillStats` |
| 2.4 | **Gate-linked drill targets** | Gates page shows readiness but no drill CTAs | ✅ Subnetting, VLSM, sim labs, wireshark, curriculum CTAs |

**Done when:** Student can run subnet + recall drills, see history, and gates reflect drill progress with clear next actions.

---

## Phase 3 — Progress & Accountability (Priority: Medium)

Goal: Stronger motivation and safer data handling.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 3.1 | **Weekly review screen** | Sunday rhythm exists in schedule but no UI | ✅ WeeklyReview on `/accountability` |
| 3.2 | **Milestone celebrations** | Phase/module completion should feel rewarding | ✅ Toast + confetti (respects `prefers-reduced-motion`) |
| 3.3 | **Auto-backup reminder** | localStorage is fragile | ✅ Banner on accountability when ≥7 days since export |
| 3.4 | **Progress diff on import** | Import is all-or-nothing | Preview imported state before overwrite |

**Done when:** Weekly review flow works; import shows preview; backup nudges appear after 7 days without export.

---

## Phase 4 — UX & Accessibility (Priority: Medium)

Goal: Polish for daily 7-hour use.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 4.1 | **Keyboard shortcuts** | Daily plan power users | ✅ Today: N/P day nav, 1–5 block toggle, `?` help overlay |
| 4.2 | **Dark/light theme toggle** | Long study sessions | ✅ Sidebar toggle + light tokens |
| 4.3 | **PWA / offline shell** | Study without network after first load | ✅ PwaProvider, service worker, install prompt, IDB mirror |
| 4.4 | **E2E tests** | CI only had unit tests | ✅ Playwright smoke + all 14 sim lab interactions; CI job on PR |

**Done when:** Playwright runs in CI on PR; keyboard nav in Today/study blocks. ✅ Today shortcuts shipped.

---

## Phase 5 — Platform (Priority: Lower — Optional)

Goal: Optional sync and deployment hardening. Only if you want multi-device or shared progress.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 5.1 | **Supabase progress sync** | Backup across devices | Auth + single `progress` row per user |
| 5.2 | **Vercel Analytics** | Understand which routes get used | `@vercel/analytics` on key pages |
| 5.3 | **Custom domain + OG images** | Shareable dashboard links | `vercel.json` / metadata per route |

**Defer unless:** You need progress on phone + laptop, or public portfolio link.

---

## Suggested Tomorrow Morning Schedule

### Block 1 (2 hrs) — Content
- [ ] Audit `lib/daily-plans.ts` structure for weeks 1–4
- [ ] Draft week 5 day 1 plan as template
- [ ] Add weeks 5–6 (14 days) minimum viable plans

### Block 2 (1.5 hrs) — Drills
- [ ] Design VLSM question types
- [ ] Scaffold `/drills` index page
- [ ] Wire gate page CTAs to drill targets

### Block 3 (1 hr) — QA
- [ ] Run `REGRESSION.md` manual checklist
- [ ] Fix any gaps found
- [ ] Push + verify Vercel deploy

### Block 4 (optional) — UX
- [ ] Keyboard shortcuts in focus mode
- [ ] Weekly review section on accountability page

---

## Out of Scope (For Now)

- Video hosting or embedded courses
- AI tutor / chat
- Packet Tracer / EVE-NG in-browser (keep local labs)
- Replacing curriculum content (structure only, not rewriting networking material)

---

## Success Metrics (End of Next Sprint)

1. Day plans through **week 28** ✅
2. **≥10 graded simulator labs** ✅ (11)
3. **Playwright E2E** in repo ✅ — CI job on PR ✅
4. **SVI or NAT** stub + lab (next engine target)
5. Vercel production deploy green after each push

---

## Reference Files

| Area | Files |
|------|-------|
| Daily plans | `lib/daily-plans.ts`, `lib/schedule.ts` |
| Simulator labs | `content/labs/index.ts`, `lib/academy-resources.ts` |
| Drills | `lib/subnetting.ts`, `app/drills/subnetting/page.tsx` |
| Gates | `lib/gates.ts`, `app/gates/page.tsx` |
| Progress | `lib/progress.tsx`, `lib/progress-schema.ts` |
| Regression | `REGRESSION.md` |

---

*Plan only — implementation starts tomorrow.*
