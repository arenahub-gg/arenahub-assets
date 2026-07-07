---
phase: 2
title: Generated-asset conventions + docs
status: completed
effort: S
priority: P2
dependencies:
  - 1
---

# Phase 2: Generated-asset conventions + docs

## Overview

Extend `pack.json` schema + conventions for AI-generated packs; write the short user guide (API key, license matrix, workflow).

## Requirements

- Functional: contributor (human or AI) can produce a valid `meshy-*` pack from conventions alone; license branch unambiguous.
- Non-functional: docs concise (guide < 100 lines); no duplication between conventions.md and guide (conventions = schema/rules, guide = how-to).

## Related Code Files

- Modify: `docs/conventions.md`
- Create: `docs/generated-assets-guide.md`

## Implementation Steps

1. `docs/conventions.md` — add section `## Generated asset packs` after the "Multiple sources" section:
   - Folder: `assets/meshy-{slug}/` (source key = generator name; follows existing `{source}-{pack-name}` rule).
   - `pack.json` extension (all base fields still mandatory):
     ```json
     {
       "id": "meshy-crystal-golem",
       "name": "Crystal Golem",
       "source": "https://www.meshy.ai",
       "license": "CC-BY-4.0",
       "attribution": "Generated with Meshy (meshy.ai)",
       "generator": "meshy",
       "provenance": {
         "prompt": "low-poly crystal golem, game-ready",
         "taskId": "0195...",
         "plan": "free",
         "generatedAt": "2026-07-07"
       },
       "style": "low-poly-3d",
       "tags": ["character", "3d", "generated"],
       "types": ["3d-models"],
       "importedAt": "2026-07-07"
     }
     ```
   - License rule: `plan: "free"` → `license: "CC-BY-4.0"` + `attribution` MANDATORY; `plan: "paid"` → `license: "proprietary-owned"` + `attribution` omitted. No third state.
   - Reuse existing CC-BY warning: CC-BY pack in a game ⇒ game MUST render attribution (same rule as conventions.md Multiple-sources section — reference it, don't restate).
   - Git policy: generated binaries ARE committed (contrast with Kenney). Revisit LFS/external storage when `assets/meshy-*` total exceeds ~500MB.
   - Provenance rule: no generated pack without `prompt` + `taskId` + `plan` — this is the generated-asset equivalent of "no pack without provenance".
2. Create `docs/generated-assets-guide.md` (how-to, short):
   - Prerequisites: Meshy account, API key from https://www.meshy.ai/settings/api, `MESHY_API_KEY` env var set before launching Claude Code (+ phase-1 fallback note if env expansion was broken).
   - License matrix table (free/CC-BY-4.0/attribution-required vs paid/owned).
   - Workflow pointer: "run the `meshy-model-gen` skill" + 5-line summary (generate → refine → download → pack.json → catalog).
   - Cost note: Meshy credits are per-generation; refine/texture are separate spends.
   - Unity note (roadmap): Unity MCP is machine-local (Unity 6+, subscription, Unity Cloud link) — NOT part of repo config; future Unity WebGL track needs its own brainstorm (link brainstorm report §5 Phase 4).
3. Do NOT touch `scripts/asset-source-resolvers.mjs` — meshy packs are not downloadable, resolver model does not apply.

## Success Criteria

- [ ] conventions.md section added; schema example valid JSON; license rule states exactly two branches
- [ ] generated-assets-guide.md created, < 100 lines, no schema duplication (links to conventions.md)
- [ ] Unity roadmap note present with pointer to brainstorm report
- [ ] `npm run catalog` still passes (no behavior change expected this phase)

## Risk Assessment

- Doc drift between guide and skill (phase 3) → guide holds NO step-by-step duplicated from skill, only pointer + summary.
