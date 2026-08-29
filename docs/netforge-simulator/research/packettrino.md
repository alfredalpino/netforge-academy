# Research: EvilPrime98/PackeTTrino

**Local path:** `inspiration/EvilPrime98-PackeTTrino/`  
**Upstream:** https://github.com/EvilPrime98/PackeTTrino  
**License:** **GPL-3.0** (LICENSE file; package.json ISC conflict — treat as GPL)  
**Primary stack:** Vanilla JS + Vite (no React)

---

## 1. What it does

Pure browser educational network simulator: drag devices, Linux-like host terminal, DHCP/DNS/HTTP/firewall, animated packets, ARP/MAC/routing tables.

## 2. Architecture

- `src/components/` board, menus, network elements
- `processors/`, `services/`, `packages/`, `animations/`
- Global-function style; no framework

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | Async procedural forwarding gated by `await visualize(...)` — **not classic DES** |
| Protocols | Strong host-centric: ARP, ICMP, DHCP, DNS, HTTP, iptables |
| CLI | **Linux shell** emulation — not Cisco modes |
| Topology | DOM + SVG cables; informal save format |
| Rendering | DOM/SVG |
| Packets | **Best educational packet viz** among inspiration set |
| Grading | None |

## What NetForge should learn (concepts only)

- Color-coded packet types + step/pause controls
- Hop-by-hop teaching UX
- Linux-host persona for PC nodes (separate from router CLI)
- Decouple DES from animation (fix their coupling)

## What NetForge must NOT copy

**GPL source** into the Academy product without GPL compliance. Do not adopt viz-gated async as the event model.

## Rewrite from first principles

All engines/UI. Prefer event-queue DES; animate from event log.

## Client vs server lesson

Fully client-side is good for zero-install; coupling sim correctness to animation FPS is a failure mode.

## Limitations

No Cisco CLI; no grading; GPL; globals; limited L3 control-plane fidelity.
