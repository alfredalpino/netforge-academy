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
- [ ] Certification gates show readiness percentages
- [ ] Journey jump shows confirmation dialog
- [ ] Export/import progress round-trip on Accountability page
- [ ] Mobile: hamburger menu opens/closes; content not obscured
- [ ] Custom 404 page renders for invalid routes
- [ ] Welcome tour banner appears on first dashboard visit (dismissible)
