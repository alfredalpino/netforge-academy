# Research: srl-labs/containerlab-app

**Local path:** `inspiration/srl-labs-containerlab-app/`  
**Upstream:** https://github.com/srl-labs/containerlab-app  
**License:** MIT (root LICENSE); `package.json` also lists Apache-2.0 — **clarify before shipping derivatives**; both permissive  
**Primary stack:** TypeScript monorepo — React/Vite web + Electron; XYFlow

---

## 1. What it does

Web/desktop UI for editing/visualizing `*.clab.yml`, deploying via `clab-api-server`, terminals, file explorer. Sandbox mode = browser-only edit/visualize without deploy.

## 2. Architecture

- `apps/web`, `apps/desktop`
- `packages/{standalone-runtime,app-server,app-contract}`
- Connects to external API; does not start containerlab itself

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | Real labs when API connected; sandbox = files only |
| Topology | First-class YAML editing + graph |
| Rendering | `@xyflow/react` |
| Worker/WASM | Not used as sim engines |
| Grading | None |
| UX | Lab tabs, multi-endpoint hosts, sandbox vs live |

## What NetForge should learn

- Lab workspace: files + graph + terminals
- Sandbox-offline editor mode
- API contract separation (UI unprivileged / API privileged)
- Multi-lab tabs

## What NetForge should NOT do

- Make clab-api-server required for default Academy labs
- Fork Electron packaging unless advanced tier needs it

## Client vs server lesson

Correct privileged boundary for real labs; irrelevant for DES core.

## Limitations

Depends on Linux API host; not a DES teaching tool.
