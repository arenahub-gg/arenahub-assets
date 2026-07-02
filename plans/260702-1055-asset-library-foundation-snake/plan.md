---
title: 'ArenaHub Asset Library R1: Foundation + Snake'
description: >-
  Greenfield foundation for AI-assembled game library: repo conventions, CC0
  asset packs + catalog, SDK contract-first stub, Snake reference game, reverse
  extraction into engine/components/template, acceptance test.
status: completed
priority: P2
branch: ''
tags:
  - asset-library
  - greenfield
  - canvas
  - typescript
blockedBy: []
blocks: []
created: '2026-07-02T03:59:56.383Z'
createdBy: 'ck:plan'
source: skill
---

# ArenaHub Asset Library R1: Foundation + Snake

## Overview

Build the foundation of `arenahub-asset` — the knowledge/asset library Claude uses to assemble ArenaHub games from reusable blocks instead of generating from scratch.

**Source:** [Brainstorm report](../reports/brainstorm-260702-1055-arenahub-asset-library-foundation-report.md) — design approved by user 2026-07-02.

**Core principles (locked in brainstorm):**
1. Library extracted from a real game (Snake), not designed speculatively.
2. Consumer is Claude → search = Glob/Grep/Read + generated markdown catalogs. Zero infra.
3. Generated games are self-contained (static CDN deploy) → engine/components vendored (copied) at generation time.

**Stack:** HTML5 Canvas + TypeScript (vanilla, no engine framework), Vite dev/build, CC0 assets (Kenney), git repo + markdown catalogs.

**Acceptance criterion (whole plan):** fresh Claude session + this repo + prompt "make game X" → playable browser game reusing library assets/engine/template, not from scratch.

**Out of scope R1:** search engine/MCP/HTTP API, multiplayer implementation (interface only), AI prompt library, versioning beyond git, full 11-branch taxonomy, deploy pipeline, AI-generated assets.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation & Conventions](./phase-01-foundation-conventions.md) | Completed |
| 2 | [Asset Packs & Catalog Generator](./phase-02-asset-packs-catalog-generator.md) | Completed |
| 3 | [SDK Contract & Local Stub](./phase-03-sdk-contract-local-stub.md) | Completed |
| 4 | [Snake Game](./phase-04-snake-game.md) | Completed |
| 5 | [Reverse Extraction](./phase-05-reverse-extraction.md) | Completed |
| 6 | [Acceptance Validation](./phase-06-acceptance-validation.md) | Completed |

**Dependency chain:** 1 → 2 → 3 → 4 → 5 → 6 (strictly sequential; each phase consumes prior outputs). Phase 2 and 3 could run in parallel after 1, but sequential is simpler and total scope is small.

## Dependencies

None. No other unfinished plans in this repo (greenfield).

## Risks (from approved brainstorm)

| Risk | Mitigation |
|---|---|
| Extraction from 1 game → wrong component APIs | Accepted; R2 (Caro, turn-based) forces refactor — intended maturation path |
| Kenney style ≠ ArenaHub brand | `style` field in pack.json from day 1; packs swappable |
| Platform contract diverges from SDK guess | Interface kept minimal; stub isolates blast radius |
| Vendored engine drift across games | Accepted by design; template always vendors latest |

## Unresolved Questions

- Which specific Kenney packs — decided in Phase 2 when browsing candidates.
- ArenaHub brand/style guide — not yet defined; affects future curation, not structure.
- Platform auth/identity shape — `getPlayer()` fields are a guess until platform team confirms.
