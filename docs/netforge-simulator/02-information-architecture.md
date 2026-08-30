# 02 — Information Architecture

## Current Academy IA (preserve)

```text
Study
  Dashboard (/)
  Today (/today)
  Today (/today)
  Accountability (/accountability)

Practice
  Drills (/drills)
  Lab Stack (/labs)
  Cert Gates (/gates)

Academy
  Curriculum (/curriculum)
  Resources (/resources)
  How to Use (/guide)
```

Source: `components/Sidebar.tsx` `NAV_GROUPS`.

## Extended IA (simulator)

```text
Practice
  ├── Drills
  ├── Network Simulator          ← NEW primary entry
  ├── Lab Stack                  ← keep external tools + bridge CTAs
  └── Cert Gates
```

### Simulator sub-IA (in-app, not necessarily top-nav)

```text
/simulator                      Workspace (default blank or last lab)
/simulator/labs                 My Labs (IDB)
/simulator/explore              Explore catalog (bundled content/labs)
/simulator/labs/[labId]         Guided lab runtime
/simulator/challenges           Troubleshooting challenges (P1+)
/simulator/templates            Starter templates (P1+)
```

**Tradeoff — flat nav vs nested:** Nested top-nav clutters Academy. Prefer **one** Practice link → simulator shell with internal tabs/sidebar. Matches dense IDE feel without rewriting Academy IA.

## Primary user flows

### Freeform lab

```text
Open Simulator → Drag devices → Connect → Open CLI → Configure → Ping → Inspect → Save
```

### Guided certification lab

```text
Curriculum/Today/Labs CTA → Open lab → Read objectives → Configure → Submit → Score → Gate progress
```

### Break / fix

```text
Load challenge → Observe failure → Capture packets → Root-cause panel → Fix → Re-grade
```

## Cross-links from Academy

| From | To | When |
|------|----|------|
| `/labs` | `/simulator/labs/[id]` | Runbook has `simulatorLabId` |
| `/today` / Focus | same | Day plan lab block |
| `/gates` | Explore labs tagged for gate | Criterion unmet |
| `/drills` | Optional “apply in lab” | After drill streak |
| Dashboard | Simulator CTA | Always secondary to Focus/Today |

## Content taxonomy

- **Templates** — empty-ish starters (Basic LAN, Two-router WAN)
- **Guided labs** — objectives + starter config + checks
- **Challenges** — intentional faults + rubrics
- **Sandboxes** — user-owned freeform saves

## Deep linking

Lab URLs should encode `labId` + optional `checkpoint`. Shareable cloud URLs deferred until auth (PRD §45); until then use export file / local id.
