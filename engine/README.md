# Engine (canonical sources)

Core TS modules for Canvas games. Extracted from `games/snake/` (R1). Zero game-specific code allowed here.

**Vendoring:** games never import these paths at runtime. Copy `engine/*.ts` into a game's `src/core/` at generation time (`templates/canvas-game/` already carries current copies). Shipped games freeze their copy; drift is accepted by design.

| Module | Purpose |
|---|---|
| `game-loop.ts` | Fixed-timestep update + rAF render. Clamps catch-up after tab hide. |
| `keyboard-input.ts` | Key state + per-press callbacks by `KeyboardEvent.code`. |
| `touch-input.ts` | 4-way swipe detection on an element. |
| `canvas-renderer.ts` | Canvas in container, DPR-aware size check per clear(); drawSprite (rotatable), drawRect, drawGridLines, drawText. |
| `asset-loader.ts` | Manifest-based image preloading. |
| `audio-player.ts` | SFX via cloned HTMLAudio, mute toggle, autoplay-policy safe. |

Notes:
- rAF pauses in hidden tabs (browser behavior) — game pauses; intended.
- API changes: rename-only cleanups anytime; redesigns wait until a second game demands them (see docs/conventions.md extraction procedure).
- R2+: sync script template↔engine if manual drift becomes painful.

## R2 backlog (flagged by real games)

- `touch-input.ts`: only 4-way swipe. Paddle games (breakout/pong) want continuous pointer-drag — add a pointer-track mode when the next paddle game lands.
- SDK gameId scoping: `createLocalSdk(gameId)` binds an id for storage but `submitScore`/`getHighScore` take `gameId` per call — nothing prevents a mismatch. Decide one scoping model (bind-at-creation preferred) with the platform team before the surface calcifies.
- breakout-state.ts: `serveBall` uses `Math.random()` directly (snake injects rng) — thread rng through for deterministic tests; also cap `ballSpeed()` (uncapped linear growth could tunnel bricks around level ~30).
