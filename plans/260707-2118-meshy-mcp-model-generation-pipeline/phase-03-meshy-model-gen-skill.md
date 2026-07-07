---
phase: 3
title: Meshy model-gen skill
status: completed
effort: M
priority: P2
dependencies:
  - 1
  - 2
---

# Phase 3: Meshy model-gen skill

## Overview

Repo-local Claude skill encoding the full generate→ingest→catalog workflow with the license interview. This is where repo rules become enforceable behavior.

## Requirements

- Functional: invoking the skill takes a model request from prompt → committed-ready pack without the user knowing conventions by heart.
- Non-functional: skill self-contained (works for a fresh clone user); no hardcoded API key; Windows + POSIX path safe.

## Architecture

Skill = SKILL.md only (no scripts this round — MCP tools do the API work; YAGNI). Lives IN the repo (`.claude/skills/`), not `~/.claude/skills/`, so every clone ships it.

## Related Code Files

- Create: `.claude/skills/meshy-model-gen/SKILL.md`

## Implementation Steps

1. Frontmatter: `name: meshy-model-gen`; description triggers on "generate 3D model / tạo model / meshy" + mentions it ingests into `assets/meshy-*/` per repo conventions.
2. Workflow section (numbered, imperative):
   1. Preflight: confirm `meshy` MCP tools are available (if not → point to `docs/generated-assets-guide.md` prerequisites and STOP).
   2. License interview (MANDATORY, before any generation): ask user their Meshy plan via AskUserQuestion — `free` → license `CC-BY-4.0` + attribution; `paid` → `proprietary-owned`. Record answer for pack.json.
   3. Generate: `meshy_text_to_3d` (or `meshy_image_to_3d` when user supplies reference image) → preview; confirm silhouette with user; then `meshy_text_to_3d_refine` for textures. Note credit cost before refine.
   4. Download: fetch result GLB + textures into `assets/meshy-{slug}/` (slug = kebab-case model name; preserve Meshy filenames where descriptive, else rename descriptively — filenames are the search index).
   5. Write `pack.json` per conventions.md "Generated asset packs" schema — copy the field list from conventions, fill `provenance.taskId` from the MCP task response, `style` mandatory (ask user if ambiguous, never leave `"uncurated"` for generated packs — the generator knows the style it asked for).
   6. Run `npm run catalog`; confirm pack appears in `catalog/assets-catalog.md`.
   7. Report: file list + license obligations. If CC-BY: warn explicitly "any game using this pack MUST render attribution".
3. Hard rules section:
   - No pack without `license` + `provenance` (prompt, taskId, plan).
   - CC-BY pack may only be used in a game that has an attribution surface — check before wiring into a game.
   - Binaries are committed — never add `meshy-*` payloads to .gitignore.
   - One style per game still applies to generated packs.
4. Out-of-scope pointers: rig/animate/remesh tools exist but are follow-up workflows; sprite-render and three.js template are separate plans (link plan.md).

## Success Criteria

- [ ] SKILL.md exists in repo, valid frontmatter, description self-triggering
- [ ] Workflow enforces license interview BEFORE generation
- [ ] Hard rules cover: provenance, CC-BY attribution gate, commit policy, style
- [ ] Dry read-through: a fresh session with only this skill + docs can execute the flow without guessing

## Risk Assessment

- Official server tool names drift on major version → skill records server package + version checked against; update on bump.
- User skips license interview via direct MCP tool calls → skill is the documented path; conventions.md remains the backstop rule.
