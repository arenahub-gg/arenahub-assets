---
phase: 4
title: "Snake Game"
status: pending
priority: P1
dependencies: [2, 3]
effort: "M"
---

# Phase 4: Snake Game

## Overview
Build a complete, polished Snake in `games/snake/` — Vite + TS + Canvas, using Phase 2 assets and Phase 3 SDK stub. This is both the first shippable game and the raw material for Phase 5 extraction. Write it cleanly modularized so extraction is file moves, not rewrites.

## Requirements
- Functional: grid-based snake; keyboard (arrows/WASD) + touch swipe; food pickup grows snake + score; wall/self collision → game over; SFX on eat/lose; score submitted via SDK; high score displayed; restart.
- Non-functional: 60fps game loop with fixed-timestep update; responsive canvas (mobile + desktop); self-contained build (`vite build` → static dist); no imports from outside `games/snake/` except `sdk/` (engine does not exist yet — snake's internal modules BECOME the engine in phase 5).

## Architecture
Modularize with extraction in mind — generic vs game-specific separation from day 1:

```
games/snake/
├── index.html
├── package.json          # vite + typescript only
├── tsconfig.json         # extends ../../tsconfig.base.json
├── vite.config.ts
├── public/assets/        # copied subset of library assets used (self-contained rule)
└── src/
    ├── main.ts               # bootstrap: wire loop, input, renderer, sdk, game
    ├── core/                 # ← generic candidates for engine/ extraction
    │   ├── game-loop.ts          # fixed-timestep update + rAF render
    │   ├── keyboard-input.ts     # key state map + direction helper
    │   ├── touch-input.ts        # swipe detection
    │   ├── canvas-renderer.ts    # ctx setup, resize/DPR, drawSprite/drawText
    │   ├── asset-loader.ts       # load images/audio by manifest
    │   └── audio-player.ts       # play/stop SFX, mute toggle
    ├── ui/                   # ← generic candidates for components/ extraction
    │   ├── score-hud.ts
    │   └── game-over-overlay.ts
    └── game/                 # snake-specific, stays here
        ├── snake-state.ts        # grid, snake body, food spawn, tick rules
        └── snake-game.ts         # orchestrates state + render + input + sfx + sdk
```

Asset flow: copy needed sprites/SFX from `assets/kenney-*/` into `public/assets/` (vendoring rule — deployed game never references library paths). Record provenance in a `public/assets/SOURCES.md` (grammar-light list: file ← library path).

## Related Code Files
- Create: everything under `games/snake/` above.
- Modify: `CLAUDE.md` — register snake as reference implementation.

## Implementation Steps
1. Scaffold Vite vanilla-ts app in `games/snake/`; wire tsconfig to base.
2. Implement `core/` modules (loop, input, renderer, loader, audio) — generic, no snake knowledge.
3. Implement `game/snake-state.ts` pure logic (testable without DOM): grid, movement, growth, collision, food spawn.
4. Implement `game/snake-game.ts` + `ui/` + `main.ts`; integrate SDK stub for score/high-score.
5. Copy chosen assets into `public/assets/` + SOURCES.md.
6. Manual test matrix: desktop keyboard, mobile viewport touch swipe (preview_resize), restart flow, high score persists across reload.
7. `vite build` → verify dist runs via static server (CDN-deployability proof).
8. Commit: `feat: add snake reference game built on sdk stub and cc0 assets`.

## Success Criteria
- [ ] Playable at 60fps desktop + mobile viewport; no console errors.
- [ ] Eat/lose SFX from library pack; sprites from library pack.
- [ ] High score persists via SDK stub across reload.
- [ ] `vite build` output runs standalone (static).
- [ ] `snake-state.ts` has no DOM/canvas imports (pure logic).
- [ ] `core/` modules contain zero snake-specific code (extraction-ready).

## Risk Assessment
- Scope creep (levels, skins, pause menu) → cut; polish limited to the matrix above.
- core/game boundary drawn wrong → detected in phase 5; acceptable, but review boundary at step 2 before building on it.
