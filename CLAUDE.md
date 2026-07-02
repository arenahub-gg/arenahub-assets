# ArenaHub Asset Library

Knowledge/asset library powering AI-assembled games for arenahub.gg. You (Claude) are the primary consumer: assemble games from these building blocks instead of generating from scratch.

## Core rules

1. **Assemble, don't invent.** Reuse `engine/`, `components/`, `templates/`, and `assets/` before writing anything new.
2. **Vendoring rule.** Generated games are self-contained: copy engine/component modules and asset files INTO the game folder at generation time. A deployed game never imports from library paths at runtime. `engine/` and `components/` are canonical sources; each game freezes the copy it shipped with.
3. **Contract-first SDK.** Games talk to the platform only through the `ArenaHubSDK` interface in `sdk/`. Never call platform APIs directly. Until the platform ships, use the localStorage stub.
4. **License hygiene.** Every asset pack carries a `pack.json` with `license` + `source`. Only use packs present in `assets/`. Record per-file provenance in the game's `public/assets/SOURCES.md`.
5. **Extraction over speculation.** New reusable modules are extracted from working games, never designed upfront. See `docs/conventions.md`.

## Layout

| Path | What lives here |
|---|---|
| `catalog/` | Generated markdown catalogs — START HERE to find anything. Regenerate: `npm run catalog` |
| `assets/` | CC0 binary packs (`kenney-*/`), each with `pack.json` metadata |
| `engine/` | Canonical core TS modules: game loop, input, renderer, asset loader, audio |
| `components/` | Canonical reusable UI/systems: HUD, overlays, ... |
| `sdk/` | `ArenaHubSDK` interface + localStorage stub. Import from `sdk/index.ts` |
| `templates/canvas-game/` | Starter for new games — Vite + TS + Canvas, engine/SDK pre-wired |
| `games/` | Complete games; `games/snake/` is the reference implementation |
| `rules/` | Structured game-rule specs (poker, werewolf, ... — future rounds) |
| `scripts/` | Maintenance scripts (catalog generator) |
| `docs/` | Conventions and guides |

## Finding assets

1. Grep the catalog first: search `catalog/assets-catalog.md` for a keyword.
   - Example — find an explosion SFX: `Grep pattern:"explosion" path:"catalog/"` → returns relative paths like `assets/kenney-.../audio/explosion-01.ogg`.
2. Filenames are the search index (Kenney names are descriptive). If the catalog misses, glob: `assets/**/*food*`.
3. Check the pack's `pack.json` for `style` before mixing packs — keep one style per game.

## Generating a new game (recipe)

1. Copy `templates/canvas-game/` → `games/{game-name}/` (kebab-case). Do NOT copy `node_modules/` or `dist/`.
2. Replace every `RENAME-ME` / `RENAME ME` marker: `package.json` name, `index.html` title, `GAME_ID` in `src/main.ts` (= folder name).
3. Pick assets via catalog; copy files into `public/assets/`; list provenance in `public/assets/SOURCES.md`.
4. Write game logic in `src/game/` only. Keep `src/core/` (vendored engine) and `src/ui/` (vendored components) untouched unless the game truly needs an engine change — if so, note it for extraction review.
5. Score/persistence via `sdk` stub: `createLocalSdk()` → `submitScore(gameId, score)`.
6. Verify: `npm install && npm run dev` plays; `npm run build` produces a standalone `dist/`.
7. Add the game to `catalog/games-catalog.md`.

Reference implementation: `games/snake/` — read it when unsure how pieces fit.

## Stack

HTML5 Canvas + TypeScript (strict, ES2022), Vite. No engine frameworks. TS configs extend `tsconfig.base.json`.
