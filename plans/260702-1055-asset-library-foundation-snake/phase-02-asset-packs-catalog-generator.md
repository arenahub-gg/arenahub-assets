---
phase: 2
title: Asset Packs & Catalog Generator
status: completed
priority: P1
dependencies:
  - 1
effort: M
---

# Phase 2: Asset Packs & Catalog Generator

## Overview
Import 1-2 CC0 Kenney packs sufficient for Snake (sprites + SFX), define `pack.json` metadata schema, and build the script that generates `catalog/assets-catalog.md` so Claude finds assets by grep.

## Requirements
- Functional: packs on disk with license provenance; catalog regenerable by one command; grep "food"/"click" hits real files.
- Non-functional: pack-level metadata only (no per-file hand-written metadata); original Kenney file names preserved (they are descriptive — that IS the search index).

## Architecture
```
assets/kenney-{pack-name}/
├── pack.json          # metadata (schema below)
└── sprites|audio|fonts/...   # original pack structure preserved
```

`pack.json` schema (documented in docs/conventions.md, phase 1 references it):
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

Catalog generator: `scripts/generate-asset-catalog.mjs` (plain Node, no deps) — walks `assets/*/pack.json`, lists file tree per pack grouped by type, emits `catalog/assets-catalog.md` with pack header (style/license/tags) + relative file paths. Idempotent, deterministic ordering.

## Related Code Files
- Create: `assets/kenney-{sprite-pack}/pack.json` + files (pack chosen at implementation; criteria: simple top-down/grid-friendly tiles or shapes usable as snake segments + food; candidates: Pixel Platformer, Puzzle Pack 2, Shape Characters).
- Create: `assets/kenney-{sfx-pack}/pack.json` + files (criteria: UI click, positive pickup, negative/lose; candidates: Interface Sounds, Digital Audio).
- Create: `scripts/generate-asset-catalog.mjs`.
- Create: `catalog/assets-catalog.md` (generated).
- Modify: `CLAUDE.md` — add "finding assets" section pointing at catalog + grep examples.

## Implementation Steps
1. Download chosen Kenney packs (https://kenney.nl, CC0). Unzip into `assets/kenney-{pack}/` preserving structure; delete non-asset cruft (previews, .txt duplicates) but keep the pack's own `License.txt`.
2. Write `pack.json` for each pack per schema.
3. Write `scripts/generate-asset-catalog.mjs`: read all `assets/*/pack.json`, walk files, group by extension type, write markdown with one section per pack.
4. Run `npm run catalog`; verify output.
5. Grep-test: `explosion|food|click|apple` style keywords resolve to real paths via catalog.
6. Commit: `feat: import kenney cc0 packs and asset catalog generator`.

## Success Criteria
- [ ] ≥1 sprite pack + ≥1 SFX pack imported with valid `pack.json` including `license` + `source`.
- [ ] `npm run catalog` regenerates `catalog/assets-catalog.md` deterministically.
- [ ] Grep for a gameplay keyword in `catalog/` returns usable relative paths.
- [ ] Every pack dir contains upstream license file.

## Risk Assessment
- Pack choice may not suit Snake visually → verify pack contents against Snake needs (segment, food, background tile) before committing; swapping packs later is structural no-op.
- Windows path separators in generated catalog → generator must emit forward-slash relative paths (portable, clickable).
