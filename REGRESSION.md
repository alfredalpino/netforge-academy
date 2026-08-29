# NetForge Academy — Regression Checklist

Run before release:

```bash
npm run validate
```

## Automated checks

- [ ] ESLint passes with zero errors
- [ ] TypeScript typecheck passes
- [ ] Vitest unit tests pass (subnetting, progress, gates, schema)
- [ ] Production build succeeds

## Manual flows

- [ ] Dashboard loads with journey navigator and compact progress
- [ ] Today → Focus Mode opens with study blocks
- [ ] Focus checklist persists after page refresh
- [ ] Mark block/day complete shows toast feedback
- [ ] Subnet drill timer counts down; stats update on submit
- [ ] VLSM drill accepts subnet assignments; stats update on submit
- [ ] `/drills` index shows stats and links to all drill types
- [ ] Recall flashcards load from daily plan recall items (weeks 1–6)
- [ ] Week 5–6 day plans appear on Today page (not module study mode)
- [ ] Lab runbooks appear on `/labs` when current week is 5 or 6
- [ ] Certification gates show practice CTAs for unmet drill criteria
- [ ] Weekly review section on Accountability page
- [ ] Backup reminder appears after 7 days without export
- [ ] Import progress shows preview before overwrite
- [ ] Focus mode keyboard shortcuts: Space (pause), N (next block), ? (help)
- [ ] Journey jump shows confirmation dialog
- [ ] Export/import progress round-trip on Accountability page
- [ ] Mobile: hamburger menu opens/closes; content not obscured
- [ ] Custom 404 page renders for invalid routes
- [ ] Welcome tour banner appears on first dashboard visit (dismissible)
