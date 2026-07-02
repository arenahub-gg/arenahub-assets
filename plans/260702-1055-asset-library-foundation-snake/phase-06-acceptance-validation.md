---
phase: 6
title: Acceptance Validation
status: in-progress
priority: P2
dependencies:
  - 5
effort: S
---

# Phase 6: Acceptance Validation

## Overview
Prove the whole-plan acceptance criterion: a fresh Claude session, given only this repo + CLAUDE.md, generates a NEW playable game (Breakout) from the template/engine/assets without writing engine code from scratch. Fix whatever gaps the test exposes.

## Requirements
- Functional: `games/breakout/` exists, playable, built from template + library assets + SDK stub.
- Non-functional: the generation must follow CLAUDE.md recipe only — plan files and brainstorm report are off-limits to the test session (that's the point: library must be self-documenting).

## Architecture
Test protocol:
1. Spawn a FRESH agent/session whose prompt contains only: repo path + "Read CLAUDE.md, then create a playable Breakout game following the library's generation recipe."
2. Agent output lands in `games/breakout/`.
3. Evaluate against checklist below; every failure = documentation/library gap, not agent error.
4. Fix gaps in CLAUDE.md / catalogs / template (NOT by hand-fixing breakout mid-test); re-run test if gaps were blocking.

## Related Code Files
- Create: `games/breakout/**` (by the test session, via template).
- Modify: `CLAUDE.md`, `catalog/*`, `templates/canvas-game/**`, `docs/*` — gap fixes only.
- Create: validation report at `plans/reports/` per naming convention (test transcript summary: what the fresh session did, gaps found, fixes applied).

## Implementation Steps
1. Ensure working tree committed before test (clean diff = attributable changes).
2. Run test protocol via Agent tool (fresh subagent, prompt limited per above; include env info per orchestration protocol).
3. Grade checklist; collect gaps (e.g., recipe step ambiguous, asset keyword missing from catalog, template script broken on Windows).
4. Apply fixes to library docs/template; re-run if generation was blocked (max 2 iterations; if still failing, report to user — library design issue, not polish).
5. Regenerate catalogs (`npm run catalog`) including breakout in games catalog.
6. Write validation report; update `docs/` if conventions changed.
7. Commit: `feat: validate library via generated breakout game` + `docs: record acceptance validation findings`.

## Success Criteria
- [ ] Breakout playable (paddle, ball, bricks, score via SDK, game over/restart) in dev and `vite build`.
- [ ] Fresh session used template + engine + catalog assets — did NOT write its own game loop/renderer from scratch (verify by diff against template).
- [ ] Zero human edits inside `games/breakout/` during the test.
- [ ] Gaps found are documented in validation report with fixes committed.
- [ ] Whole-plan acceptance criterion declared met or explicitly failed with reasons.

## Risk Assessment
- Test session ignores recipe and freestyles → prompt constraint explicitly forbids external knowledge of repo layout; if it still freestyles, CLAUDE.md discoverability is the bug.
- Breakout needs assets Snake didn't (paddle/brick/ball sprites) → good stress test of catalog search; Kenney packs chosen in phase 2 should anticipate this (prefer packs with generic shapes/tiles).
