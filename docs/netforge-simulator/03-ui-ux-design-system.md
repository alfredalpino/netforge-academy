# 03 — UI / UX & Design System Extension

## Principle

**Extend** NetForge’s existing visual language into a denser professional net-eng workspace. Do **not** invent a new brand.

## Preserve (from `app/globals.css`)

- Background `#070b12`, accent `#4aa3ff`, surfaces, borders, success/warning/error
- Syne display + Geist sans/mono
- Card variants, section labels, elevated shadows
- `prefers-reduced-motion` behavior

## Workspace visual mode

Introduce a **lab/workspace mode** (CSS scope e.g. `.sim-workspace`) that:

- Uses denser spacing (8px rhythm vs academy page breathing room)
- Darker canvas (`--sim-canvas-bg` derived from `--focus-bg` / `--background`)
- Subtle grid on canvas (reuse border color at low alpha)
- Thin topology edges; clear device silhouettes; restrained status colors
- Strong monospace for CLI (Geist Mono)
- Minimal chrome chrome — avoid oversized academy cards inside the IDE

### New tokens (additive only)

```css
--sim-canvas-bg: #05080d;
--sim-grid: color-mix(in srgb, var(--border) 45%, transparent);
--sim-link: color-mix(in srgb, var(--muted) 70%, var(--accent));
--sim-link-up: var(--success);
--sim-link-down: var(--error);
--sim-packet-arp: #fbbf24;
--sim-packet-icmp: #4aa3ff;
--sim-packet-dhcp: #a78bfa; /* use sparingly; not brand purple wash */
--sim-panel-width: 280px;
--sim-bottom-height: 280px;
```

**Tradeoff — purple packet color:** Protocol legend needs distinction; keep brand accent cyan primary; use muted secondary hues only for packet types, never as page theme.

## Feel target (PRD §9)

> Linear + Vercel + modern network engineering console — not a college project.

Avoid: cartoon icons, excessive gradients/glass, fake 3D hardware, cluttered chip rows in hero of academy pages (simulator chrome may use compact toolbars).

## Component hierarchy (UI)

```text
SimulatorShell
├── SimTopBar (lab title, save, run, submit, command palette)
├── SimBody
│   ├── DevicePalette
│   ├── TopologyCanvas (React Flow)
│   └── InspectorPanel (tabs: Device / Interface / Config / Tables / Logs)
└── SimBottomDock
    ├── TerminalTab (xterm)
    ├── PacketsTab
    ├── EventsTab
    ├── CaptureTab
    ├── ScoreTab
    └── TutorTab
```

Reuse academy `Button`, `Badge`, `Input`, `Select`, `Toast`, `ConfirmDialog` where possible. Do **not** wrap every panel in `Card` — panels are structural chrome.

## Motion

- 2–3 intentional motions: panel open, packet hop, save feedback
- Respect `prefers-reduced-motion` — instant packet jump + static trail

## Brand in workspace

Top bar keeps **NF / NetForge** mark from sidebar language; lab title secondary. Brand must remain visible but workspace density wins over marketing hero.
