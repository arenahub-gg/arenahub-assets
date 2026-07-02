# Library Catalog — Engine, Components, Templates

Hand-maintained (small). Update when extracting new modules.

## Engine modules (`engine/`)

- engine/game-loop.ts — fixed-timestep loop, rAF render
- engine/keyboard-input.ts — key state + press callbacks
- engine/touch-input.ts — swipe detection (up/down/left/right)
- engine/canvas-renderer.ts — DPR-aware canvas, drawSprite/drawRect/drawGridLines/drawText
- engine/asset-loader.ts — manifest image preloader
- engine/audio-player.ts — SFX player, mute, overlap-safe

## Components (`components/`)

- components/score-hud.ts — score + best HUD row
- components/game-over-overlay.ts — game over overlay with restart

## SDK (`sdk/`)

- sdk/index.ts — import surface: ArenaHubSDK types + createLocalSdk(gameId)
- sdk/arenahub-sdk.ts — contract: getPlayer, submitScore, getHighScore, storage, room (interface-only)
- sdk/arenahub-sdk-local-stub.ts — localStorage implementation (default until platform ships)

## Templates (`templates/`)

- templates/canvas-game/ — Vite + TS + Canvas starter; engine + components vendored; ExampleGame moving-square demo in src/game/
