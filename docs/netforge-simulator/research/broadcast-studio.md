# Research: lukaudev/broadcast-studio

**Local path:** `inspiration/lukaudev-broadcast-studio/`  
**Upstream:** https://github.com/lukaudev/broadcast-studio  
**License:** **None in tree** (treat as unlicensed / all rights reserved)  
**Primary stack:** Next.js + React Flow + Prisma/auth shell

---

## 1. What it does

Packet Tracer–like **topology studio UI** (palette, hierarchy, React Flow logical view). README claims a Python CORE Emulator backend (`bs-core`) that is **not present** in this clone.

## 2. Architecture

- `app/studio/` — React Flow logical view, nodes, toolbar, context
- Auth/dashboard/community routes
- `lib/` Prisma + better-auth
- **No simulation engine in-tree**

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | None here (external CORE intended) |
| Protocols / CLI / packets / grading | Not in this frontend snapshot |
| Topology UI | Strong: React Flow, hierarchy, node settings |
| Worker/WASM | None |
| UX | Theme system, tours (driver.js), desktop-only gate |

## What NetForge should learn (concepts only)

- Studio chrome: palette + hierarchy + toolbar + inspector
- Multi-panel lab workspace composition
- Guest/auth shell patterns (future)

## What NetForge must NOT copy

- **Any source code** without a license grant
- CORE Emulator as the default academy runtime (install/privilege/latency)

## Rewrite from first principles

Entire UI under NetForge design tokens. Simulation stays DES, not CORE.

## Client vs server lesson

UI↔emulator middleware is the opposite of browser-first. Reserve for optional “advanced lab host” tier only.

## Limitations

Incomplete product in clone; no engine; mobile blocked; license unclear.
