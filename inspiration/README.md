# NetForge inspiration references (isolated)

These directories are **reference-only clones** used for NetForge / network-simulator **architectural planning**.

## Rules

- **Do not** import, copy-paste en masse, vendor, or merge this code into the production NetForge application.
- Treat each clone as an **isolated study tree**: patterns, UX ideas, lab orchestration models, and stack choices only.
- Prefer learning from structure, docs, and public APIs over lifting implementation.
- Respect each upstream **LICENSE** (MIT, AGPL-3.0, GPL-3.0, BSD-3-Clause, etc.) if you ever reuse ideas in a way that triggers obligations—when in doubt, reimplement cleanly under NetForge’s own licensing.

## Purpose

Capture how other browser/lab network simulators and containerlab tooling solve:

- Topology canvas / device models
- Cisco-style CLI and protocol simulation
- Packet capture / visualization
- Lab orchestration (containers vs in-browser)
- Desktop/web packaging

## Cloned repos

| Local path | Upstream |
|---|---|
| `joxorsayan-netsim` | https://github.com/joxorsayan/netsim |
| `Alechiis-netsim` | https://github.com/Alechiis/netsim |
| `NETWORKERS-HOME-123-cisco-real-sim` | https://github.com/NETWORKERS-HOME-123/cisco-real-sim |
| `lukaudev-broadcast-studio` | https://github.com/lukaudev/broadcast-studio |
| `srl-labs-containerlab` | https://github.com/srl-labs/containerlab |
| `srl-labs-containerlab-app` | https://github.com/srl-labs/containerlab-app |
| `EvilPrime98-PackeTTrino` | https://github.com/EvilPrime98/PackeTTrino |

Shallow clones (`git clone --depth 1`) are intentional to keep this tree small.
