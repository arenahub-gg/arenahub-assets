---
phase: 5
title: Reverse Extraction
status: completed
priority: P1
dependencies:
  - 4
effort: M
---

# Phase 5: Reverse Extraction

## Overview
Extract Snake's generic modules into canonical library locations: `src/core/` → `engine/`, `src/ui/` → `components/`, and assemble `templates/canvas-game/` — the starter every future generated game vendors. Generate component/game catalogs.

## Requirements
- Functional: engine/ + components/ are canonical sources; template is a runnable skeleton pre-wired with engine + SDK stub; catalogs list them.
- Non-functional: vendoring rule holds — snake keeps its own copies (frozen); template copies FROM engine/ at generation time; no cross-imports from games into engine.

## Architecture
```
engine/
├── game-loop.ts, keyboard-input.ts, touch-input.ts,
├── canvas-renderer.ts, asset-loader.ts, audio-player.ts
└── README.md              # module list, API notes, vendoring instruction
components/
├── score-hud.ts, game-over-overlay.ts
└── README.md
templates/canvas-game/
├── index.html, package.json, tsconfig.json, vite.config.ts
├── public/assets/.gitkeep
└── src/
    ├── main.ts            # boots loop+renderer+input+sdk, renders "hello canvas" scene
    ├── core/              # vendored copy of engine/ (kept in sync manually R1)
    ├── ui/                # vendored copy of components/
    └── game/example-game.ts   # minimal moving-square stub showing where game logic goes
```

Canonical-vs-vendored decision (from brainstorm): `engine/` is source of truth; template holds a copy so generated games are self-contained; snake's copy stays as-shipped. Drift between snake copy and engine is accepted by design.

Extraction is COPY + de-snake-ify (rename/strip any leaked snake specifics), not move — snake remains untouched and working.

## Related Code Files
- Create: `engine/*.ts` + `engine/README.md` (copied/cleaned from `games/snake/src/core/`).
- Create: `components/*.ts` + `components/README.md` (from `games/snake/src/ui/`).
- Create: `templates/canvas-game/**` (skeleton + vendored engine/ui).
- Create: `catalog/components-catalog.md`, `catalog/games-catalog.md` (extend generator or hand-write ≤50 lines each; extend `scripts/generate-asset-catalog.mjs` only if trivial — else separate `scripts/generate-library-catalog.mjs`).
- Modify: `CLAUDE.md` — "generate a new game" recipe: copy template → rename → pick assets from catalog → write game/ logic → build.
- Modify: `docs/conventions.md` — extraction procedure for future games.

## Implementation Steps
1. Review snake's `core/` for leaked game specifics; clean while copying to `engine/`.
2. Copy `ui/` → `components/`; generalize prop types where trivially possible (no speculative abstraction — rename only, API changes wait for game #2).
3. Build `templates/canvas-game/` from snake's scaffold minus snake logic; add `example-game.ts` moving-square demo proving loop/input/render wiring.
4. `npm run dev` in template → demo scene runs; `vite build` passes.
5. Write engine/components READMEs + catalogs.
6. Update CLAUDE.md with the generation recipe (this text is what phase 6 tests).
7. Commit: `feat: extract engine, components, and canvas-game template from snake`.

## Success Criteria
- [ ] Template dev-runs and builds standalone with demo scene.
- [ ] `engine/` modules have zero snake references (grep "snake" → no hits in engine/, components/, templates/).
- [ ] Snake still runs unchanged after extraction.
- [ ] Catalogs list engine modules, components, template, and snake with one-line descriptions.
- [ ] CLAUDE.md generation recipe complete: template copy → asset pick → logic slot → build.

## Risk Assessment
- Over-abstraction temptation during cleanup → rule: rename + strip only; API redesign deferred to R2 second game.
- Template/engine sync burden → accepted R1 (manual); note in engine/README that a sync script is R2+ if drift hurts.
