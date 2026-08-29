# Research: srl-labs/containerlab

**Local path:** `inspiration/srl-labs-containerlab/`  
**Upstream:** https://github.com/srl-labs/containerlab  
**License:** BSD-3-Clause  
**Primary stack:** Go CLI + Docker/container runtimes

---

## 1. What it does

Orchestrates **real** container/VM-based networking labs from declarative YAML topologies (`*.clab.yml`): deploy, destroy, wire links, inspect, graph.

## 2. Architecture

- `cmd/`, `core/`, `nodes/` (kinds), `links/`, `runtime/`
- Schema: `schemas/clab.schema.json`
- Examples: `lab-examples/`
- Not a browser app

## 3–11. Capabilities (summary)

| Area | Finding |
|------|---------|
| Simulation | Real NOS images — not DES |
| Protocols | Whatever the container NOS runs |
| CLI | Host `containerlab` CLI — not device IOS sim |
| Topology | **Gold-standard lab-as-code** (kinds, links, endpoints) |
| Rendering | Graph export (dot/mermaid/drawio) |
| Grading | None built-in |

## What NetForge should learn

- Declarative nodes / kinds / links / endpoints model
- Kind plugin abstraction
- Optional future export: NetForge lab → `.clab.yml` for advanced tier
- Clear privileged orchestrator boundary

## What NetForge should NOT copy / use as default

- Docker-in-browser fantasies
- Real commercial NOS images in public zero-install product
- Rebuilding containerlab itself

## Client vs server lesson

Declarative file → privileged orchestrator. Browser UI must never embed Docker socket; talk to a lab-host API if advanced tier exists.

## Limitations

Heavy infra; image licensing; not pedagogical packet-level by default; not zero-install.
