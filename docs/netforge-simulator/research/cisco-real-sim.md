# Research: NETWORKERS-HOME-123/cisco-real-sim

**Local path:** `inspiration/NETWORKERS-HOME-123-cisco-real-sim/`  
**Upstream:** https://github.com/NETWORKERS-HOME-123/cisco-real-sim  
**License:** MIT  
**Primary stack:** Next.js + TypeScript + Zustand + Konva + Web Worker + optional Go backend

---

## 1. What it does

Browser Cisco IOS–style CLI lab for CCNA/CCNP: Konva topology, xterm terminal, event-driven ARP/ICMP/etc., optional Go API for auth/labs/grading/presets.

## 2. Architecture

- Frontend: `src/lib/{simulation,cli,topology,routing,stp,dhcp,nat,acl,...}`
- Worker: `public/simulation.worker.js` (large; duplicates much main-thread logic)
- Store: Zustand `simulationStore`
- Backend: `backend/` Go Fiber — auth, presets, `handlers/grading.go`
- Docs: `AGENTS.md` stack map

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | EventQueue + min-heap DES |
| Protocols | Modular TS: ARP, ICMP, MAC, OSPF, STP, DHCP, NAT, ACL |
| CLI | Hierarchical parser + large executor; also in worker (duplication smell) |
| Topology | Schema validation / XSS / size limits |
| Rendering | **Konva / react-konva** with packet animation |
| Worker/WASM | **Best Web Worker reference** — no WASM |
| Packets | Canvas hop animation; weak `.pcap` |
| Grading | Server answer keys (config snapshot objectives) |
| UX | Palette, properties, lab picker, grade panel |

## What NetForge should learn

- Client DES + Dedicated Worker boundary
- Modular protocol folder layout
- Answer-key + live-check hybrid grading concept
- Topology validation limits
- Separation: UI thread vs sim thread

## What NetForge should NOT copy

- Worker/main CLI duplication — ship **one** shared engine module for Worker
- Institute branding / any proprietary NetAcad content
- Konva as mandatory (we prefer React Flow for editor UX; may borrow packet-anim ideas)

## Rewrite from first principles

Engine + CLI + canvas under NetForge modules. MIT still → clean-room per inspiration policy.

## Client vs server lesson

**Preferred boundary for NetForge:** DES+CLI in Worker; backend = users/labs/authoritative grades (future).

## Limitations

Worker drift; educational OSPF; grading often snapshot-based; static worker packaging quirks with Next.
