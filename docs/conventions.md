# Library Conventions

Rules for maintaining `arenahub-asset`. Consumer-facing usage lives in `CLAUDE.md`; this file is for contributors (human or AI) extending the library.

## Naming

- Files: kebab-case, long descriptive names (`generate-asset-catalog.mjs`, `game-over-overlay.ts`). Filenames are the search index for Grep/Glob.
- Game folders: kebab-case, folder name = game id used with the SDK.
- Asset pack folders: `{source}-{pack-name}` (e.g. `kenney-pixel-platformer`).

## Directory semantics

- `engine/`, `components/` — canonical sources. No imports FROM `games/` or `templates/`. Zero game-specific code (grep for game names must return no hits here).
- `games/` — self-contained; each game's BUILT `dist/` runs standalone. Games never import from `engine/` directly; they carry vendored copies under `src/core/` and `src/ui/`. Exception: the `sdk/` import is live (not vendored) by design — it's bundled at build time, so SOURCE builds require the full repo checkout. Do not "fix" this by vendoring the SDK.
- `templates/` — runnable skeletons carrying vendored copies of engine/components, kept in sync manually (R1; sync script only if drift hurts).
- `rules/` — one file per game family, structured markdown (roles, phases, win conditions). Populated from R2.

## Vendoring principle

Canonical → copy at generation time → frozen in the game.

- Library evolves freely; deployed games never break.
- Drift between a shipped game's copy and `engine/` is accepted by design.
- Template always vendors the LATEST engine/components.

## pack.json schema

Every pack dir in `assets/` must contain:

```json
{
  "id": "kenney-pixel-platformer",
  "name": "Pixel Platformer",
  "source": "https://kenney.nl/assets/pixel-platformer",
  "license": "CC0-1.0",
  "style": "pixel-art-16px",
  "tags": ["tiles", "characters", "pixel"],
  "types": ["sprites"],
  "importedAt": "2026-07-02"
}
```

- `license` + `source` mandatory — no pack without provenance. Keep the pack's upstream license file.
- `style` mandatory — one style per game; enables future brand curation. Bulk-imported packs start as `"uncurated"`; set a real style value the first time a game uses the pack.
- Preserve original pack file structure and filenames (they ARE the search index).
- After adding/removing packs run `npm run catalog`.

## Bulk import & git policy

- Binary payloads under `assets/*/` are gitignored; only `pack.json` (and the manifest) are committed. Rebuild payloads with `npm run assets:download` (scrapes current zip URLs from kenney.nl per `assets/packs-manifest.json`; safe to re-run, existing packs are skipped).
- The two R1 packs (`kenney-puzzle-pack-2`, `kenney-digital-audio`) predate this policy and stay fully tracked in git — games vendor from them.
- To add a new pack: append `{slug, category}` to `assets/packs-manifest.json`, run `npm run assets:download`, curate `pack.json`, run `npm run catalog`.

### Multiple sources

- Manifest entries may carry a `source` key (default `"kenney"`); packs land in `assets/{source}-{slug}/` so ids never collide.
- Add a new source = add a resolver in `scripts/asset-source-resolvers.mjs` (returns `{zipUrl, name, license, homepage}` for an entry) + manifest entries tagged with that source key. No change to the downloader core.
- `npm run assets:download -- --source <key>` restricts a run to one source.
- **License is per-pack**, carried in `pack.json` from the resolver. Kenney = CC0 (no attribution). A non-CC0 source (e.g. CC-BY) obliges every game using its assets to render attribution — track this before shipping. Do not mix a CC-BY pack into a game without an attribution surface.

## Extraction procedure (how the library grows)

1. Build the game fully inside `games/{name}/`, separating `src/core/` (generic) from `src/game/` (specific) from day 1.
2. When a second game needs the same module, COPY it to `engine/`/`components/`, strip game specifics — rename only, no speculative API redesign.
3. Update template vendored copies + catalogs + CLAUDE.md recipe if it changed.
4. Never move/rewrite the source game — it stays working, frozen.

## Contract-first SDK

- `sdk/arenahub-sdk.ts` is the only game↔platform boundary. Speculative members carry doc comments marking platform intent.
- Grow the interface only when a real game needs it (YAGNI). Room API stays interface-only until the platform ships.

## Commit style

Conventional commits, scoped to one concern. No AI references. Example: `feat: import kenney cc0 packs and asset catalog generator`.
