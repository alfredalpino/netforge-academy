# 20 — Concrete Development Task Sequence

Executable by another coding agent. **Do not skip order within a milestone.** Do not import `inspiration/`.

---

## M0 — Planning (complete)

- [x] Clone inspiration repos under `inspiration/`
- [x] Write `docs/netforge-simulator/**`
- [x] Action log under `logs/`

---

## M1 — Simulator shell (UI only)

1. Add `app/simulator/page.tsx` route (client) with `SimulatorShell` placeholder panels
2. Add Practice nav item in `components/Sidebar.tsx` → `/simulator`
3. Add `.sim-workspace` tokens in `app/globals.css` (additive)
4. Scaffold `features/simulator/**` chrome: TopBar, Palette (static list), empty Canvas region, Inspector empty state, BottomDock with Terminal textarea stub
5. Ensure `npm run validate` still passes (academy untouched)

**Exit:** User can open `/simulator` and see IDE chrome in NetForge look.

---

## M2 — Engine vertical slice (ping)

1. Create `simulation/core` types (device, iface, link, packet, event)
2. Implement EventQueue + SimulationController in pure TS
3. Implement Ethernet flood/learn, ARP, IPv4+ICMP, static/connected routes
4. Worker entry + `useSimulationWorker` hook; message protocol v1
5. Wire React Flow: add router/switch/host nodes, connect links → worker
6. CLI v1: modes + IP config + `show ip int brief` + `show arp` + `show ip route`
7. Vitest fixtures: ARP+ping success/fail
8. Spike Next.js worker bundling + CSP update if required

**Exit:** Configure addressing in CLI; ping succeeds; deterministic tests green.

---

## M3 — Persist + grade one lab

1. IDB `netforge-sim` helpers
2. Save/Load/Export JSON
3. Lab schema Zod + `content/labs/basic-lan.nlab.yaml`
4. Grading checks: `interface_up`, `ping`
5. Score tab UI + attempt history
6. Explore or open-from-catalog entry

**Exit:** Complete basic-lan lab submit ≥ pass score; reload from IDB.

---

## M4 — Packet UX + VLAN path

1. Packet traces → list + hop highlight overlay
2. Packet inspector layers
3. VLAN access/trunk + MAC table shows
4. Second catalog lab (VLAN)
5. Capture ring buffer (no PCAP yet)

**Exit:** Student sees why ping fails across wrong VLAN.

---

## M5 — CLI polish + Academy hooks

1. `?`, abbreviations hardening, history
2. Lab runbook `simulatorLabId` + Labs page CTA
3. Optional additive `progress.simulator` summary fields (Zod defaults)
4. Tour steps for simulator
5. Playwright smoke: open → load lab → submit

---

## M6 — Routing & tutor foundation

1. DHCP, ACL, NAT as needed for labs
2. OSPF educational subset
3. PCAP export
4. Root-cause rule engine + Tutor tab structured output
5. Gate criteria optional wiring

---

## M7+ — Per roadmap P2/P3

Follow `18-roadmap-milestones.md`. Re-read tradeoffs before WASM, auth, or Containerlab.

---

## Standing rules for every PR

1. No copies from `inspiration/`
2. No drive-by academy refactors
3. Preserve design tokens
4. Engine code React-free
5. Update / add Vitest for engine changes
6. Log significant actions under `logs/` per org AGENTS.md
7. Prefer small PRs: shell → engine → lab → integration
