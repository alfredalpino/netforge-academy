# NetForge Academy — Regression Checklist

Run before release:

```bash
npm run validate
npm run test:e2e
```

## Automated checks

- [ ] ESLint passes with zero errors
- [ ] TypeScript typecheck passes
- [ ] Vitest unit tests pass (subnetting, progress, gates, simulator grading, milestones)
- [ ] Playwright E2E passes (smoke + all 14 simulator labs)
- [ ] Production build succeeds

## Manual flows

- [ ] Dashboard loads with journey navigator and practice section
- [ ] Today page shows daily plan, keyboard shortcuts (`?`), and module lab/video links
- [ ] Mark block/day complete shows toast feedback; milestone toast on module/phase completion
- [ ] Subnet drill timer counts down; stats update on submit
- [ ] VLSM drill accepts subnet assignments; stats update on submit
- [ ] `/drills` index shows stats and links to all drill types
- [ ] Recall flashcards load from daily plan recall items
- [ ] Lab runbooks appear on `/labs` for current week
- [ ] Certification gates show practice CTAs (subnetting, VLSM, sim labs, wireshark)
- [ ] Weekly review section on Accountability page
- [ ] Backup reminder appears after 7 days without export
- [ ] Import progress shows preview before overwrite
- [ ] Theme toggle switches light/dark without flash
- [ ] Simulator: all 14 labs load, terminal + score dock work, submit grades
- [ ] PWA install prompt / offline shell (service worker registered)
- [ ] Journey jump shows confirmation dialog
- [ ] Export/import progress round-trip on Accountability page
- [ ] Mobile: hamburger menu opens/closes; content not obscured
- [ ] Custom 404 page renders for invalid routes
- [ ] Welcome tour banner appears on first dashboard visit (dismissible)
