# Phase A — Existing NetForge Academy Audit

**Date:** 2026-08-30  
**Mode:** Read-only  
**Root:** `/Users/ubaid/Infrastructure/UBAIDs-MANAGER/UBAID-Engineer/network-engineering-academy`

---

## 1. Architecture overview

| Item | Detail |
|------|--------|
| Framework | Next.js **16.3.3** App Router |
| React | **19.2.8** |
| Styling | Tailwind CSS **v4** (`app/globals.css` + `@theme inline`) |
| Validation | Zod **^4.4.3** (`lib/progress-schema.ts`) |
| Tests | Vitest (`vitest.config.ts`) |
| Runtime deps | `next`, `react`, `react-dom`, `zod` only |

**Pattern:** Client-heavy study OS. Almost all interactive pages are `"use client"`. No `app/api/` in the product. No database. No authentication.

**Provider stack** (`components/AppProviders.tsx`):

```text
ProgressProvider → ToastProvider → ConfirmProvider → PwaProvider → TourProvider
```

**Fonts** (`app/layout.tsx`): Geist (sans), Geist Mono, Syne (display / brand).

---

## 2. Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Dashboard |
| `/today` | `app/today/page.tsx` | Daily study plan (legacy `/focus` redirects here) |
| `/today` | `app/today/page.tsx` | Daily plan |
| `/accountability` | `app/accountability/page.tsx` | Streaks, export/import |
| `/drills` | `app/drills/page.tsx` | Drill hub |
| `/drills/subnetting` | `app/drills/subnetting/page.tsx` | Timed subnet math |
| `/drills/vlsm` | `app/drills/vlsm/page.tsx` | Timed VLSM |
| `/drills/recall` | `app/drills/recall/page.tsx` | Flashcards (unscored) |
| `/labs` | `app/labs/page.tsx` | External lab stack + runbooks |
| `/gates` | `app/gates/page.tsx` | Cert readiness |
| `/curriculum` | `app/curriculum/page.tsx` | Phase browser |
| `/curriculum/[phaseId]` | `app/curriculum/[phaseId]/page.tsx` | Phase detail |
| `/resources` | `app/resources/page.tsx` | External resources |
| `/guide` | `app/guide/page.tsx` | How-to + tours |

Nav source of truth: `NAV_GROUPS` in `components/Sidebar.tsx`.

---

## 3. Design system (MUST preserve)

Tokens in `app/globals.css` `:root`:

| Token | Value |
|-------|-------|
| `--background` | `#070b12` |
| `--foreground` | `#eef2f7` |
| `--surface` / elevated / hover | `#10161f` / `#161e2a` / `#1c2533` |
| `--border` / `--border-strong` | `#243041` / `#334155` |
| `--accent` | `#4aa3ff` |
| `--success` / `--warning` / `--error` | `#34d399` / `#fbbf24` / `#f87171` |
| `--muted` | `#8b97ab` |
| `--focus-bg` | `#05080d` |

Patterns: dark navy + cyan accent, Syne display brand, `.section-label`, `.card-quiet` / `.card-elevated` / `.card-accent`, grid atmosphere on `body`, `prefers-reduced-motion` hard-disable.

UI kit: `components/ui/{Button,Card,Badge,PageShell,PageHeader,Breadcrumb,Input,Select,ProgressBar,Skeleton,EmptyState,Toast,ConfirmDialog}.tsx`.

---

## 4. State & persistence

| Piece | Path | Notes |
|-------|------|-------|
| Types | `lib/types.ts` | `ProgressState`, curriculum types |
| Zod | `lib/progress-schema.ts` | `progressStateSchema` |
| Storage | `lib/progress-storage.ts` | `STORAGE_KEY = "netforge-progress"` |
| Context | `lib/progress.tsx` | `useSyncExternalStore` + actions |
| IDB | `lib/pwa/idb.ts` | DB `netforge-pwa`: progress, sync-queue, meta |

**No Redux/Zustand/React Query** in shipping app.

---

## 5. Lab Stack / Drills / Gates / Curriculum (today)

| Domain | Status | Key files |
|--------|--------|-----------|
| Labs | Documentary + checklist; **external tools** (PT, EVE-NG, etc.) | `lib/curriculum.ts` (`LAB_STACK`), `lib/lab-runbooks.ts`, `app/labs/page.tsx` |
| Drills | Subnetting + VLSM scored; recall unscored | `lib/subnetting.ts`, `app/drills/*` |
| Gates | Criteria over modules/drills/lab setup | `lib/gates.ts`, `CERTIFICATION_GATES` in curriculum |
| Curriculum | Phases 0–8, 28-week journey | `lib/curriculum.ts`, `lib/journey.ts`, `lib/schedule.ts`, `lib/daily-plans.ts` |

Labs page copy: labs run on the learner’s machine. Simulator does not exist yet.

---

## 6. Backend / auth / deploy

| Concern | Status |
|---------|--------|
| Database | None |
| Auth | None |
| API routes | None (product) |
| Deploy | Vercel (`vercel.json`), `next.config.ts` security headers |
| PWA | Service worker `lib/service-worker.js`, `app/manifest.ts` |
| CI | `.github/workflows/ci.yml` — lint, typecheck, test, build |

CSP today is restrictive (`connect-src 'self'`). Workers / WASM / blob URLs will need careful header updates when implementing.

---

## 7. Preserve vs extend

### Must preserve

- Design tokens, Syne/Geist fonts, dark+cyan language
- UI kit contracts
- `ProgressState` + Zod + `STORAGE_KEY` (additive extensions only)
- Curriculum / journey / gates / drills math
- Nav IA groups (Study / Practice / Academy)
- Today plan, drills, tours
- Lab setup checklist IDs used by gates
- PWA + export/import accountability
- Existing unit tests as regression anchors

### May extend

- New route `/simulator` (and nested lab views)
- Nav item under **Practice**: Network Simulator
- Separate IDB database/store for topologies (prefer **not** bloating `netforge-progress`)
- Lab runbooks → “Open in Simulator” when topologies exist
- Gate criteria for graded in-app labs
- CSP headers for workers/wasm
- Optional future cloud sync (net-new; not required for P0)

### Do not treat as product code

- Everything under `inspiration/**`
- Assumptions of auth/DB from inspiration forks

---

## 8. Integration hooks for simulator

| Hook | File | Action |
|------|------|--------|
| Nav | `components/Sidebar.tsx` | Add Practice → Network Simulator |
| Labs | `app/labs/page.tsx` | CTA + optional runbook launch |
| Gates | `lib/gates.ts` | Optional sim-lab criteria |
| Today/Focus | day plans / runbooks | Link lab blocks when ready |
| Progress | separate sim store | Avoid large blobs in localStorage progress |
| PWA | `lib/service-worker.js` | Cache strategy for sim assets |

---

## 9. Tests that exist

- `lib/progress-schema.test.ts`
- `lib/progress-storage.test.ts`
- `lib/progress.test.ts`
- `lib/gates.test.ts`
- `lib/subnetting.test.ts`

No Playwright e2e in package scripts today.

---

## 10. Audit conclusion

NetForge Academy is a **local-first study operating system**. The Network Simulator must **slot into Practice/Labs/Gates** as a new domain module (`features/simulator` + `simulation/` or packages later), while leaving the academy shell, design language, and progress model intact.
