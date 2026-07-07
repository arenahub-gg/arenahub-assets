# Meshy MCP + Generated-Asset Pipeline Shipped

**Date**: 2026-07-07 22:05
**Severity**: N/A
**Component**: MCP config, asset conventions, meshy-model-gen skill, catalog generator
**Status**: Resolved

## What Happened

Brainstorm → plan → implement in one session (commit d2110e3). Repo gains model-generation capability: official `@meshy-ai/meshy-mcp-server@0.4.0` wired via project `.mcp.json` (per-user `MESHY_API_KEY` from env), generated-asset conventions (two-branch license: free plan → CC-BY-4.0 + mandatory attribution, paid → proprietary-owned), repo-shipped `meshy-model-gen` skill encoding generate→refine→download→pack.json→catalog with a mandatory license interview, gitignore exception committing `meshy-*` binaries, and `.glb/.gltf/.fbx/.obj/.mtl` → `3d-models` catalog grouping.

## The Brutal Truth

Original user ask was "MCP for Meshy AND Unity". Unity survived exactly one research pass: its official MCP is machine-local (Unity 6+, subscription, Unity Cloud link, running Editor) and generates nothing — it's a consumer of models, not a producer. Cutting it to a docs/roadmap note was the single most valuable decision of the session. The second near-miss: this worktree lacks the 205 downloaded Kenney packs, so a naive `npm run catalog` after the TYPE_BY_EXT change would have gutted the committed 83k-file catalog. Caught before running; verification used a throwaway fixture pack + git restore instead.

## Technical Details

- Code review (subagent, empirical: npm tarball grep, git check-ignore, node --check): 8/8 acceptance criteria pass; 1 High fixed — `.mcp.json` floated to `latest` while docs claimed "pinned v0.4.0" (reproducibility + supply-chain gap; one-token fix).
- Gitignore negation `!assets/meshy-*/**` verified against the excluded-parent-dir trap (nested `textures/` re-included correctly).
- Skill registered live in-session immediately after Write — frontmatter validated for free.
- Catalog determinism: two runs, identical md5.

## Lessons Learned

1. **Interrogate the second noun.** "Meshy and Unity" bundled a producer and a consumer; only one belonged in scope.
2. **Gitignored-but-required inputs make generators destructive.** A catalog regen on a payload-less checkout silently deletes listings. Fixture + git-restore is the safe verify pattern; full regen delegated to a machine with assets (spawned follow-up task).
3. **"Verified against vX" in docs without a pin in config is a lie waiting to happen.** Pin or reword; the reviewer was right to flag it High.

## Next Steps

- Follow-up task: full catalog regen on asset-complete checkout (Kenney 3D packs reclassify other → 3d-models).
- Phase 2 (separate plan): GLB → sprite-sheet render spike (headless GL on Windows uncertain; Blender CLI fallback).
- Phase 3 (separate plan): `templates/threejs-game/` + reference 3D game to unlock the 48 dormant Kenney 3D packs.
- Unity WebGL track: own brainstorm when activated (conflicts with vendoring/static-dist).

Status: DONE
Summary: Meshy MCP + generated-asset pipeline shipped with license-hygiene enforcement; Unity descoped to roadmap; one High review finding (unpinned server) fixed pre-commit.
