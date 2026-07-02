# Components (canonical sources)

Reusable DOM/UI systems for games. Extracted from `games/snake/` (R1). Same vendoring rule as `engine/` — copy into a game's `src/ui/`.

| Component | Purpose |
|---|---|
| `score-hud.ts` | Score + best row above the canvas (prepends into stage's parent). |
| `game-over-overlay.ts` | Full-stage overlay: title, final score, restart button (stage must be position:relative). |

Growth rule: add a component here only after a real game used it (extraction over speculation).
