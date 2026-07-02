---
phase: 1
title: Foundation & Conventions
status: completed
priority: P1
dependencies: []
effort: S
---

# Phase 1: Foundation & Conventions

## Overview
Initialize the repo: git, directory skeleton, TypeScript/Vite baseline config, CLAUDE.md entry point, and convention docs. Everything later phases build on.

## Requirements
- Functional: repo structure matches approved design; CLAUDE.md explains how Claude uses the library.
- Non-functional: zero external infra; Windows-friendly paths; docs ≤800 LOC each.

## Architecture
Top-level layout (create dirs with `.gitkeep` where empty until later phases fill them):

```
arenahub-asset/
├── CLAUDE.md                  # how Claude uses the library (entry point)
├── package.json               # workspace root: scripts only (catalog gen), no runtime deps
├── tsconfig.base.json         # shared strict TS config extended by template/games
├── .gitignore                 # node_modules, dist, *.local
├── catalog/                   # generated MD catalogs (phase 2 fills)
├── assets/                    # CC0 packs (phase 2 fills)
├── engine/                    # core TS modules (phase 5 fills)
├── components/                # reusable systems (phase 5 fills)
├── sdk/                       # contract + stub (phase 3 fills)
├── templates/                 # canvas-game starter (phase 5 fills)
├── games/                     # complete games (phase 4 fills)
├── rules/                     # game-rule specs (reserved, R2+)
├── scripts/                   # catalog generator etc. (phase 2 fills)
└── docs/                      # conventions + guides
```

## Related Code Files
- Create: `CLAUDE.md` — library purpose, layout map, how to find assets (grep catalog/), how to generate a game (vendor template + engine), SDK usage, licensing rules.
- Create: `package.json` (root, `"private": true`, `"type": "module"`, script placeholder `"catalog": "node scripts/generate-asset-catalog.mjs"`).
- Create: `tsconfig.base.json` (strict, ES2022, DOM, moduleResolution bundler).
- Create: `.gitignore`.
- Create: `docs/conventions.md` — naming (kebab-case files), dir semantics, vendoring principle, pack.json schema reference, "extraction over speculation" rule.
- Create: `.gitkeep` in `catalog/ assets/ engine/ components/ sdk/ templates/ games/ rules/ scripts/`.

## Implementation Steps
1. `git init` in `E:\development\arenahub-asset` (repo is not yet git).
2. Create directory skeleton + `.gitkeep` files.
3. Write root `package.json`, `tsconfig.base.json`, `.gitignore`.
4. Write `CLAUDE.md` — the single most important file; must let a fresh session navigate the library without reading this plan.
5. Write `docs/conventions.md`.
6. Commit: `feat: initialize arenahub-asset library foundation`.

## Success Criteria
- [ ] `git status` clean after initial commit; all dirs present.
- [ ] Fresh Claude session reading only `CLAUDE.md` can state where assets/engine/template live and the vendoring rule.
- [ ] No runtime dependencies at root.

## Risk Assessment
Low. Pure scaffolding. Only risk: CLAUDE.md too vague — mitigate by including concrete grep/glob examples and a worked "find an explosion SFX" example.
