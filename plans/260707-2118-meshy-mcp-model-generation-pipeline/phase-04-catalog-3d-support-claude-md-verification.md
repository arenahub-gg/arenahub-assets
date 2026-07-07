---
phase: 4
title: Catalog 3D support + CLAUDE.md + verification
status: completed
effort: S
priority: P2
dependencies:
  - 1
  - 2
  - 3
---

# Phase 4: Catalog 3D support + CLAUDE.md + verification

## Overview

Make 3D files first-class in the catalog index, surface the new capability in CLAUDE.md, verify the pipeline end-to-end.

## Requirements

- Functional: `.glb/.gltf/.fbx/.obj` files grouped under `3d-models` in `catalog/assets-catalog.md` instead of `other`; CLAUDE.md documents the generate path.
- Non-functional: catalog output stays deterministic; CLAUDE.md stays scannable (few lines added, no new section sprawl).

## Related Code Files

- Modify: `scripts/generate-asset-catalog.mjs`
- Modify: `CLAUDE.md`

## Implementation Steps

1. `scripts/generate-asset-catalog.mjs` — extend `TYPE_BY_EXT`:
   ```js
   ".glb": "3d-models", ".gltf": "3d-models", ".fbx": "3d-models", ".obj": "3d-models", ".mtl": "3d-models",
   ```
   Side effect (accepted): existing Kenney 3D packs reclassify from `other` → `3d-models`; large deterministic diff in `catalog/assets-catalog.md`. Commit catalog regen separately from code change if diff review matters.
2. `CLAUDE.md` updates (minimal):
   - "Finding assets" section: add line — if no existing asset fits, generate a 3D model via the `meshy-model-gen` skill (needs `MESHY_API_KEY`); generated packs live in `assets/meshy-*/` and carry per-pack license — CHECK `license` before use; CC-BY requires in-game attribution.
   - Layout table `assets/` row: mention `meshy-*/` generated packs are committed (unlike Kenney binaries).
3. End-to-end verification:
   - With user API key available: run skill once for a small test model → confirm pack lands, catalog row appears, `git status` shows binaries tracked. If no key at implementation time: build a fixture pack `assets/meshy-fixture-test/` (tiny placeholder .glb + valid pack.json), run `npm run catalog`, verify grouping + license line render, then DELETE fixture and regen catalog. Do not commit fixtures.
   - `npm run catalog` twice → identical output (determinism preserved).
   - `npm run typecheck` untouched surfaces: skip unless scripts changed TS (they're .mjs — not applicable).
4. Update `catalog/games-catalog.md`: no change (no game touched) — explicitly verify nothing else regenerated unexpectedly.

## Success Criteria

- [ ] 3D extensions map to `3d-models` in catalog; regen deterministic
- [ ] CLAUDE.md mentions generate path + license check in "Finding assets"
- [ ] End-to-end run (real or fixture) proves: pack dir → pack.json → catalog row → git-tracked binaries
- [ ] No fixture/test artifacts left in tree

## Risk Assessment

- Catalog diff noise from Kenney 3D reclassification → separate commit for regen; reviewers diff code, not 80k-line catalog.
- Fixture path: fake .glb can't validate real download flow → mark real-key verification as pending follow-up in final report if skipped.
