# 15 — Security, Performance & Testing

## Security model

| Threat | Mitigation |
|--------|------------|
| XSS via lab JSON / device names | Sanitize labels; React text nodes; schema max lengths |
| Prototype pollution in import | Zod parse; reject unknown dangerous keys |
| Worker DoS (infinite events) | Caps, timeouts, cancel |
| CLI injection | No eval; allowlisted commands |
| PCAP / blob abuse | Size quotas in IDB |
| Future multi-tenant | Separate auth; never trust client grade alone |
| CSP | Update `next.config.ts` carefully for workers/wasm/blob — least privilege |

Guest mode remains local-only (PRD §65).

No Cisco images → reduced license attack surface.

## Performance strategy

| Target (PRD-aligned) | Guidance |
|----------------------|----------|
| UI responsive while sim runs | Worker off main thread |
| ≤50 nodes educational labs | Design for 100; warn above |
| Packet anim | Cap concurrent animations |
| Save | Debounced IDB writes |
| Bundle | Code-split `/simulator` route |

Profile before WASM.

## Testing strategy

| Layer | Tools | Focus |
|-------|-------|-------|
| Unit | Vitest | DES, ARP/ICMP, CLI parse, grading checks |
| Fixture | Deterministic labs | Golden event traces |
| Component | Vitest + RTL (optional) | Palette, inspector |
| E2E | Playwright (add) | Open sim → ping → grade smoke |
| Visual | Optional | Canvas screenshots later |
| Regression | Existing academy tests | Must stay green |

CI: extend `validate` only when sim packages exist; never weaken academy gates.

## Deterministic fixtures

Store under `simulation/__fixtures__/` — topology + commands + expected tables/events.
