---
title: Meshy MCP + Generated-Asset Pipeline (Phase 1 core)
description: >-
  Wire official Meshy MCP server into repo (.mcp.json, per-user API key), extend
  pack.json conventions for AI-generated assets with two-branch licensing
  (CC-BY-4.0 free / proprietary-owned paid), add repo skill meshy-model-gen
  encoding generate→ingest→catalog workflow, teach catalog generator 3D file
  types. Unity = docs/roadmap only, out of scope here.
status: completed
priority: P2
branch: claude/vigorous-pascal-36eb80
tags:
  - mcp
  - meshy
  - asset-pipeline
  - generated-assets
blockedBy: []
blocks: []
created: '2026-07-07T14:30:18.529Z'
createdBy: 'ck:plan'
source: skill
---

# Meshy MCP + Generated-Asset Pipeline (Phase 1 core)

## Overview

Give every user who clones this repo the ability to generate 3D models via Meshy AI and ingest them as first-class asset packs — same rigor as Kenney packs (license, provenance, catalog).

**Source:** [Brainstorm report](../reports/brainstorm-260707-2118-meshy-unity-mcp-model-generation-report.md) — Option A approved by user 2026-07-07. HTML version alongside.

**Locked decisions (do not re-litigate):**
- Official `@meshy-ai/meshy-mcp-server` via `.mcp.json` (project-scoped, per-user `MESHY_API_KEY` from env). No custom MCP server.
- Generated binaries COMMIT to git (unique, non-redownloadable). Threshold note: revisit LFS/R2 at ~500MB total `meshy-*`.
- License two-branch: Meshy free plan → `CC-BY-4.0` (attribution mandatory); paid → `proprietary-owned`.
- Unity: NOT in `.mcp.json`, docs/roadmap mention only (future separate brainstorm).
- Sprite-render + three.js template = later phases (separate plans).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Meshy MCP config + gitignore exception](./phase-01-meshy-mcp-config-gitignore-exception.md) | Completed |
| 2 | [Generated-asset conventions + docs](./phase-02-generated-asset-conventions-docs.md) | Completed |
| 3 | [Meshy model-gen skill](./phase-03-meshy-model-gen-skill.md) | Completed |
| 4 | [Catalog 3D support + CLAUDE.md + verification](./phase-04-catalog-3d-support-claude-md-verification.md) | Completed |

Execution order: 1 → 2 → 3 → 4. Phase 3 (skill) references conventions written in phase 2. Phase 4 verifies end-to-end.

## Acceptance Criteria (whole plan)

- Fresh clone + `MESHY_API_KEY` env set → Meshy MCP tools available in Claude Code session, no per-machine config edits.
- A generated model lands in `assets/meshy-{slug}/` with complete `pack.json` (license + provenance + attribution when CC-BY), binaries tracked by git, pack searchable in `catalog/assets-catalog.md` under a 3D file type.
- Skill `.claude/skills/meshy-model-gen/` guides the full workflow including the license interview (free vs paid).
- CLAUDE.md + docs updated; no game-facing behavior changed.

## Dependencies

- Cross-plan: none (`260702-1055-asset-library-foundation-snake` is completed).
- External: user-provided Meshy API key; `@meshy-ai/meshy-mcp-server` on npm.

## Open Questions

- `${MESHY_API_KEY}` env expansion in `.mcp.json` — verify in phase 1; fallback documented there.
- Meshy API response may not carry machine-readable license → skill asks user their plan (free/paid) explicitly.
