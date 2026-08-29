# Research: joxorsayan/netsim (Python NetSim)

**Local path:** `inspiration/joxorsayan-netsim/`  
**Upstream:** https://github.com/joxorsayan/netsim  
**License:** MIT  
**Primary stack:** Python FastAPI + vanilla JS SPA

---

## 1. What it does

Browser-facing CCNA-level logical network simulator: topology editing, Cisco-style CLI, discrete-event forwarding, PCAP export, lab grading, optional AI tutor / NetDevOps automation.

## 2. Architecture

- Server: FastAPI (`app/main.py`) owns simulation + CLI
- Engine: `app/engine/` — `simulator.py`, `cli.py`, `packet.py`, `pcap.py`, `labs.py`, routing (`igp.py`, `bgp.py`), `acl.py`, etc.
- Client: `app/static/{index.html,app.js,style.css}` — thin SVG UI over REST
- Labs-as-code: `automation/labs/*.yaml`

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | DES (frame arrival events; heapq; event caps) |
| Protocols | Broad educational set: L2, ARP, ICMP, DHCP, OSPF/EIGRP/RIP/BGP (simplified), NAT, ACL, STP, EtherChannel, IPv6 |
| CLI | Mode machine + unique-prefix match + `?` (~1600 lines) |
| Topology | Runtime graph; positions via API |
| Rendering | Vanilla SVG — no React Flow |
| Worker/WASM | None for sim; optional on-device tutor |
| Packets | Hop capture → replay + `.pcap` |
| Grading | Strong live checks (`grade_lab`) |
| UX | Sample topologies, CLI panel, capture animation, automation tab |

## What NetForge should learn

- DES frame/event mental model
- Live grading checks (`ping`, `route`, `interface_up`, …)
- Lab-as-code with `validate:` assertions
- PCAP export shape
- CLI modes + abbreviation + context help

## What NetForge should NOT copy

- Server-side simulation as the **only** path (breaks zero-install / offline / PWA)
- Python engine into Next.js product
- Wholesale UI/SPA structure

## Rewrite from first principles

Entire engine + CLI + UI in TypeScript (Worker) under NetForge license. MIT allows study; inspiration policy requires clean-room for product.

## Client vs server lesson

Invert their split: **sim on client**; server later for catalog/auth/grade audit.

## Limitations

Educational fidelity shortcuts; event caps; server bottleneck; vanilla UI density.
