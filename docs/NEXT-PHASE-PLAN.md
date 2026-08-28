# NetForge Academy — Next Phase Plan

**Created:** 2026-08-28  
**Start:** Tomorrow morning  
**Status:** Planning only — no implementation yet

---

## Where We Are

The full audit shipped:

- ProgressProvider + Zod-validated localStorage
- UI design system (PageShell, Card, Button, Badge, etc.)
- Certification gates, drill timer, export/import
- Error boundaries, security headers, CI + Vitest
- All 11 routes polished and `npm run validate` passing

**Biggest content gap:** Day-by-day plans exist for weeks 1–4 only. Weeks 5–28 fall back to module study mode.

---

## Phase 1 — Content & Learning Loop (Priority: High)

Goal: Make weeks 5–28 as actionable as weeks 1–4.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 1.1 | **Week 5–8 day plans** | Unblocks module study mode for Phase 1 completion | Add daily plans in `lib/daily-plans.ts` following existing block structure |
| 1.2 | **Week 9–12 day plans** | Phase 2 (Routing) needs structured daily execution | Same format: theory, config, lab, break/fix, recall |
| 1.3 | **Module-linked focus content** | Focus mode should pull richer material per module | Extend `lib/focus-content.ts` with per-module study sections |
| 1.4 | **Lab runbooks per week** | Labs page is setup-only; students need step-by-step | Add lab instructions keyed to week/day in `lib/labs.ts` or curriculum |

**Done when:** Today + Focus pages show full day plans through week 12, with lab steps linked from `/labs`.

---

## Phase 2 — Drills & Assessment (Priority: High)

Goal: Turn drills from a single subnet page into a certification prep engine.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 2.1 | **VLSM drill mode** | CCNA gate requires subnet mastery beyond /24 | New question generator in `lib/subnetting.ts` |
| 2.2 | **Recall quiz mode** | Daily recall block needs in-app practice | Flashcard-style component; questions from day plan recall items |
| 2.3 | **Drill dashboard** | One page for all drill types + history | `/drills` index with stats from `progress.drillStats` |
| 2.4 | **Gate-linked drill targets** | Gates page shows readiness but no drill CTAs | Link each gate to required drill thresholds (e.g. 20-streak subnet) |

**Done when:** Student can run subnet + recall drills, see history, and gates reflect drill progress with clear next actions.

---

## Phase 3 — Progress & Accountability (Priority: Medium)

Goal: Stronger motivation and safer data handling.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 3.1 | **Weekly review screen** | Sunday rhythm exists in schedule but no UI | `/accountability/weekly` or section: goals vs actual, block completion |
| 3.2 | **Milestone celebrations** | Phase/module completion should feel rewarding | Toast + optional confetti (respect `prefers-reduced-motion`) |
| 3.3 | **Auto-backup reminder** | localStorage is fragile | Prompt export every N days; show last backup date |
| 3.4 | **Progress diff on import** | Import is all-or-nothing | Preview imported state before overwrite |

**Done when:** Weekly review flow works; import shows preview; backup nudges appear after 7 days without export.

---

## Phase 4 — UX & Accessibility (Priority: Medium)

Goal: Polish for daily 7-hour use.

| # | Feature | Why | Scope |
|---|---------|-----|-------|
| 4.1 | **Keyboard shortcuts** | Focus mode power users | `Space` pause, `N` next block, `?` help overlay |
| 4.2 | **Dark/light theme toggle** | Long study sessions | CSS variables already exist; add toggle in sidebar |
| 4.3 | **PWA / offline shell** | Study without network after first load | `next-pwa` or manual service worker for static routes |
| 4.4 | **E2E tests** | CI only has unit tests | Playwright smoke: dashboard → today → focus → drill |

**Done when:** Keyboard nav works in focus mode; Playwright runs in CI on PR.

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

1. Day plans through **week 8** at minimum
2. **2+ drill types** with stats feeding gates
3. **Weekly review** UI on accountability page
4. **Playwright smoke test** in CI (stretch)
5. Vercel production deploy green after each push

---

## Reference Files

| Area | Files |
|------|-------|
| Daily plans | `lib/daily-plans.ts`, `lib/schedule.ts` |
| Focus content | `lib/focus-content.ts` |
| Drills | `lib/subnetting.ts`, `app/drills/subnetting/page.tsx` |
| Gates | `lib/gates.ts`, `app/gates/page.tsx` |
| Progress | `lib/progress.tsx`, `lib/progress-schema.ts` |
| Regression | `REGRESSION.md` |

---

*Plan only — implementation starts tomorrow.*
