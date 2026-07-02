# ArenaHub Asset & Knowledge Library

The building-block library that powers AI-assembled games on [arenahub.gg](https://arenahub.gg).

Instead of generating games from scratch, an AI agent (Claude) **assembles** them: it searches this library for assets, vendors the engine and a starter template, writes only the game-specific logic, and ships a self-contained browser game. The library was validated by exactly that test — a fresh AI session, given nothing but this repo, produced a playable Breakout without writing a single line of engine code.

## How it works

```
Prompt ("make a snake game")
   → grep catalog/            find sprites & SFX by keyword
   → copy templates/canvas-game/   engine + SDK pre-wired
   → write src/game/ logic only
   → npm run build             self-contained static dist/ → CDN
```

Three principles, extracted from real games rather than designed up front:

1. **Assemble, don't invent** — reuse `engine/`, `components/`, `templates/`, `assets/` before writing anything new.
2. **Vendoring** — generated games copy engine modules and asset files in at generation time. A deployed game never imports library paths at runtime; the library evolves freely without breaking shipped games.
3. **Contract-first SDK** — games talk to the ArenaHub platform only through the `ArenaHubSDK` interface. A localStorage stub stands in until the platform ships; swapping in the real SDK touches zero game code.

The primary consumer is an AI agent: [CLAUDE.md](CLAUDE.md) is the machine-facing entry point, and "search" is nothing more than grep over generated markdown catalogs with descriptive filenames. No database, no API, no infra.

## Quick start

```bash
git clone git@github.com:arenahub-gg/arenahub-assets.git
cd arenahub-assets
npm install
npm run assets:download   # rebuilds assets/ (~0.8 GB, 207 CC0 packs from kenney.nl)

# play the reference games
cd games/snake    && npm install && npm run dev
cd games/breakout && npm install && npm run dev
```

Binary asset payloads are **not** committed — `assets/packs-manifest.json` + the download script rebuild them reproducibly on any machine.

## Repository layout

| Path | Contents |
|---|---|
| `CLAUDE.md` | AI-facing guide: library rules + the game-generation recipe |
| `catalog/` | Generated search indexes (assets, components, games) — grep these |
| `assets/` | 207 CC0 packs (~83k files): sprites, audio, textures, 3D kits; `pack.json` metadata per pack |
| `engine/` | Core TypeScript modules: fixed-timestep loop, canvas renderer (DPR-aware), keyboard/touch input, asset loader, audio |
| `components/` | Reusable UI systems: score HUD, game-over overlay |
| `sdk/` | `ArenaHubSDK` contract + localStorage stub (identity, scores, storage, rooms-interface) |
| `templates/canvas-game/` | Vite + TS + Canvas starter with engine and SDK pre-wired |
| `games/` | Complete games — `snake/` (hand-built reference), `breakout/` (AI-generated acceptance test) |
| `rules/` | Structured game-rule specs (grows in future rounds) |
| `scripts/` | Catalog generator + asset pack downloader |
| `docs/` | Conventions, extraction procedure, journals |

## Adding an asset pack

1. Append `{ "slug": "...", "category": "2D" }` to `assets/packs-manifest.json`
2. `npm run assets:download` (skips existing packs, scrapes the current zip from kenney.nl)
3. Curate the generated `pack.json` (set a real `style` value)
4. `npm run catalog`

## Stack

HTML5 Canvas + TypeScript (strict), Vite, zero engine frameworks, zero runtime dependencies. Games build to static files deployable on any CDN.

## License

- **Code** (engine, components, SDK, templates, games, scripts): [MIT](LICENSE)
- **Assets**: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/), created by [Kenney](https://kenney.nl) — thank you for making game development accessible to everyone. Consider [donating](https://kenney.nl/donate).
