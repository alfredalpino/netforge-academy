# 17 — Accessibility & Responsive Behavior

## Accessibility

| Requirement | Approach |
|-------------|----------|
| Keyboard | Tab order through chrome; canvas alternatives via device list |
| Screen readers | Live region for CLI output & grade results; announce selection |
| Contrast | Use existing tokens; verify link/packet colors on canvas |
| Reduced motion | Disable packet animation paths |
| Focus visible | Reuse academy focus rings |
| Labels | All icon buttons named |

**Tradeoff — canvas a11y:** Graph canvases are inherently hard. Provide **parallel list/table views** of devices and links for SR users (P1).

## Responsive behavior

| Viewport | Behavior |
|----------|----------|
| Desktop ≥1200px | Full 3-pane + dock |
| Tablet | Collapsible palette/inspector; dock as drawer |
| Mobile | **Read-only explore** or simplified single-pane; editing optional later |

Broadcast Studio blocks mobile editing — NetForge should prefer **graceful degrade** over hard block: allow browsing labs and reading objectives on phone; recommend desktop for build mode.

## Touch

- Larger hit targets for nodes on tablet
- Avoid hover-only affordances for connect

## Canvas density

Simulator is practice-dense — do not auto-collapse academy chrome. Optional “zen canvas” toggle can collapse the academy nav later if needed.
