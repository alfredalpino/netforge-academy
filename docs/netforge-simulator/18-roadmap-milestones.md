# 18 — Phased Roadmap, P0–P3 & Dependency Graph

## Priority bands

### P0 — Foundation (ship usable ping lab)

1. Research complete (this folder) ✓
2. Simulator route + workspace shell (palette, canvas, inspector, terminal chrome)
3. Domain models + DES Worker skeleton
4. Ethernet + MAC + ARP + IPv4 + ICMP + static routes
5. Minimal CLI (`enable`, `conf t`, interface IP, `no shut`, key `show`s)
6. Basic packet list + hop highlight
7. IDB save/load + one catalog lab + live grading (`ping`, `interface_up`)
8. Nav entry under Practice; academy tests still green

### P1 — Switching & pedagogy

- VLAN access/trunk, DHCP, ACL basics
- Packet inspector + replay + capture buffer
- `?` / tab completion; undo/redo; templates
- Lab Stack / Today CTAs; list/table a11y parallel view
- STP start; failure injection challenges
- Playwright smoke

### P2 — Routing & Academy depth

- OSPF educational; NAT; IPv6 basics
- PCAP export; root-cause engine; structured tutor
- Gate criteria hooks; more catalog labs
- Optional account/cloud save decision point
- LLM narrator behind flag

### P3 — Advanced & optional tiers

- BGP/EIGRP concepts, FHRP, EtherChannel, firewall labs
- WASM hotspots if profiled
- Automation mode (API/Ansible pedagogy)
- Containerlab export / Tier B host
- Collaboration / instructor (architect only until product ready)

---

## Dependency graph

```text
Design tokens / shell UI
        ↓
Domain models ←── Lab schema
        ↓
DES Worker core
   ↓        ↓
Protocols   CLI
   ↓        ↓
Packet traces → Animator / Inspector
        ↓
Grading ←── Catalog labs
        ↓
Academy integration (nav, labs, gates)
        ↓
Tutor / PCAP / advanced protocols
```

## Milestone definitions

| Milestone | Exit criteria |
|-----------|---------------|
| **M0 Research** | Inspiration cloned; docs in `docs/netforge-simulator/` |
| **M1 Shell** | `/simulator` usable empty workspace; no engine yet |
| **M2 Ping** | Two hosts + router/switch path; CLI IP; ping success deterministic test |
| **M3 Grade** | Catalog lab submit scores; IDB persistence |
| **M4 Switch** | VLAN lab passes checks |
| **M5 Route** | OSPF multi-router lab |
| **M6 Academy** | Gates/Today/Labs wired; export/import |
| **M7 Tutor** | Root-cause + optional LLM |

## Mapping to PRD phases §86

| PRD phase | Priority |
|-----------|----------|
| 0 Research | M0 / done in planning |
| 1 Shell | P0 / M1 |
| 2–3 Model + Ethernet/ARP/IP | P0 / M2 |
| 5 CLI | P0 (parallel with M2) |
| 4 VLAN | P1 / M4 |
| 6 Packet UI | P0 basic → P1 rich |
| 7 Routing | P2 / M5 |
| 8 Labs | P0 one lab → P1+ catalog |
| 9 AI | P2–P3 |
| 10 Academy integration | P1–P2 / M6 |
| 11–13 Advanced | P3 |
