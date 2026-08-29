# 14 — Academy / Lab Stack / Drills / Gates / Curriculum Integration

## Principle

Simulator **augments** external Lab Stack; it does not immediately delete PT/EVE-NG tooling from the curriculum. Dual-path until content migrates.

## Lab Stack (`/labs`)

Today: external tools + week runbooks (`lib/lab-runbooks.ts`).

Extend runbook type:

```typescript
simulatorLabId?: string; // opens /simulator/labs/[id]
```

UI: primary CTA “Open in NetForge Simulator” when id present; keep “External tool” secondary.

## Drills

| Drill | Integration |
|-------|-------------|
| Subnetting / VLSM | Optional “Apply addressing in lab” deep link with pre-seeded topology |
| Recall | Unchanged |

Do not force drills through simulator for gate math in P0.

## Cert Gates (`lib/gates.ts`)

Additive criteria examples:

- `simulatorLabPassed: "basic-lan"`
- `simulatorLabsPassedCount >= N`

Preserve existing Wireshark/FortiGate/Azure setup flags until replaced intentionally.

**Tradeoff — replace external lab criteria early:** Risks blocking graduates who rely on PT. Prefer **additional** sim criteria, not removal, until content parity.

## Curriculum / Today / Focus

- Day plans may reference `simulatorLabId` in lab blocks
- Focus study material can embed “Launch lab” button
- Journey milestones may include “First simulator lab completed”

## Progress coupling

- Store sim attempts in `netforge-sim` IDB
- Mirror **summary only** into academy progress if needed:

```typescript
// additive optional field — Zod default {}
simulator: { completedLabIds: string[]; lastScoreByLab: Record<string, number> }
```

Keep payloads small.

## Dashboard

Secondary CTA to Simulator; do not displace Focus/Today as primary study loop.
