# 19 — Technical Risks & Open Questions

## Technical risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Protocol scope creep | Never ships | Strict P0 ping vertical slice |
| Worker/main drift | Bugs | Single shared module build |
| React Flow + packet overlay complexity | Janky UX | Cap animations; step mode |
| IDB quota | Lost labs | Export reminders; size limits |
| CSP/worker packaging on Next 16 | Blocked deploy | Spike in first implementation tasks |
| License contamination | Legal | Ban inspiration imports; code review checklist |
| Over-fidelity OSPF/BGP | Delay | Educational subsets + docs of limits |
| LLM hallucination | Wrong teaching | Evidence-only prompts; structured-first |
| Academy progress schema breakage | Regressions | Additive Zod defaults; separate sim DB |
| Mobile expectations | Poor reviews | Clear desktop-recommended banner |

## Open questions (need user / product decisions)

1. **Product license for NetForge Academy** — MIT/Apache/proprietary? Constrains any future inspiration reuse.
2. **Auth timeline** — Stay local-first indefinitely, or plan Supabase/Clerk in P2?
3. **Brand claim language** — Exact disclaimer wording for “Cisco-style / NetForgeOS” in UI.
4. **Lab Stack dual-path duration** — How long keep PT/EVE as primary vs sim-first?
5. **Zustand vs React context** for simulator UI store — confirm preference.
6. **Monorepo packages now vs folders** — `features/simulation` in-tree first, or npm workspaces immediately?
7. **LLM provider** — None / Vercel AI Gateway / on-device only?
8. **Tier B Containerlab** — In roadmap or explicitly deferred forever for this product?
9. **broadcast-studio license** — Contact upstream or ignore entirely (already idea-only)?
10. **containerlab-app license metadata conflict** — Clarify if forking UI later.
11. **Shareable lab URLs** — Require auth, or signed static blobs?
12. **Gate criteria** — Additive sim labs vs replacing Wireshark setup requirements?

## Assumptions if unanswered

- Local-first through P1; no auth required
- In-tree folders first; packages later
- No LLM until structured tutor exists
- Tier B deferred
- Additive gates only
- Clean-room everything from inspiration
