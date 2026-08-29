# 08 — Protocol Architecture

## Module layout

```text
simulation/protocols/
  l2/ethernet.ts
  l2/mac-learning.ts
  l2/vlan.ts
  l2/stp.ts
  l3/arp.ts
  l3/ipv4.ts
  l3/icmp.ts
  l3/routing-table.ts
  l3/static.ts
  l3/ospf/          # later
  services/dhcp.ts
  services/nat.ts
  security/acl.ts
```

Each module exports:

- `onPacket(ctx, packet) → effects`
- `onTimer(ctx, timer)`
- `onConfigChange(ctx, change)` optional

`ctx` provides neighbors, interfaces, schedule(event), drop(reason), learn(...).

## Phased roadmap (from PRD §17, prioritized)

| Phase | Protocols | Milestone |
|-------|-----------|-----------|
| P0 | Ethernet, MAC learn/flood, ARP, IPv4 LPM, ICMP, static routes, basic host | Ping works end-to-end |
| P1 | VLAN access/trunk 802.1Q, DHCP DORA, ACL basic | Switching labs |
| P1–P2 | STP/RSTP | Loop labs |
| P2 | OSPF (neighbors, LSDB, SPF), NAT/PAT, IPv6 basics | Routing cert path |
| P3 | BGP/EIGRP concepts, FHRP, EtherChannel, firewall stateful, services | Advanced |

## Fidelity policy

- Prefer **correct educational semantics** over full RFC FSMs
- Document known simplifications per module (`PROTOCOL.md` sidecar later)
- Show commands must reflect **actual** state (PRD §20) — never hard-coded fake output

## Tradeoff — compute-on-demand vs full adjacency FSM

| Approach | Pros | Cons |
|----------|------|------|
| On-demand SPF (joxo style) | Simple, fast to ship | Weaker troubleshooting of adjacency issues |
| Hello/adjacency FSM | Teaches real OSPF ops | More bugs/time |

**Decision:** Static + connected first; OSPF start with simplified hello + SPF; deepen FSM when labs require adjacency failure modes.
