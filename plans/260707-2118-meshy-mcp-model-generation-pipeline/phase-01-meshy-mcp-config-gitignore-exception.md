---
phase: 1
title: Meshy MCP config + gitignore exception
status: completed
effort: S
priority: P2
dependencies: []
---

# Phase 1: Meshy MCP config + gitignore exception

## Overview

Project-scoped MCP config so any clone gets Meshy tools with their own API key, plus git tracking exception for generated binaries.

## Requirements

- Functional: `.mcp.json` at repo root exposes official Meshy MCP server; `assets/meshy-*/` contents fully tracked by git.
- Non-functional: zero per-machine edits; no secret committed (key comes from user env).

## Related Code Files

- Create: `.mcp.json`
- Modify: `.gitignore`

## Implementation Steps

1. Create `.mcp.json` at repo root:
   ```json
   {
     "mcpServers": {
       "meshy": {
         "command": "npx",
         "args": ["-y", "@meshy-ai/meshy-mcp-server"],
         "env": {
           "MESHY_API_KEY": "${MESHY_API_KEY}"
         }
       }
     }
   }
   ```
   Claude Code documents `${VAR}` expansion in `.mcp.json` env values — VERIFY it resolves (step 4). If expansion fails in the installed version, keep `.mcp.json` but document in phase-2 guide that users must export `MESHY_API_KEY` in the shell that launches Claude Code (npx child process inherits env; an empty expansion would override — in that case drop the `env` block entirely and rely on inheritance).
2. Append to `.gitignore` AFTER the existing `!assets/*/pack.json` line:
   ```gitignore
   # Generated packs (meshy-*) are unique — binaries ARE committed (no re-download source)
   !assets/meshy-*/**
   ```
   Note: negation must come after `assets/*/*`; `**` re-includes subdirectories too (a bare `!assets/meshy-*/*` would fail for nested dirs like `textures/`).
3. Verify gitignore with a throwaway file:
   ```powershell
   New-Item -ItemType Directory -Force assets/meshy-smoke-test/textures
   New-Item -ItemType File assets/meshy-smoke-test/model.glb
   New-Item -ItemType File assets/meshy-smoke-test/textures/base.png
   git check-ignore -v assets/meshy-smoke-test/model.glb; git status --short assets/
   ```
   Expect: `git check-ignore` exits non-zero (NOT ignored) for both files; `git status` lists them as untracked. Delete the smoke-test dir afterwards.
4. Verify MCP registration: restart Claude Code session in repo root with `MESHY_API_KEY` set, run `claude mcp list` (or check tool availability) — `meshy` server listed and tools load. Without a key, server may error at call-time; that is acceptable (config still valid).

## Success Criteria

- [ ] `.mcp.json` committed, `meshy` server resolvable via npx
- [ ] `git check-ignore` confirms `assets/meshy-*/**` files are tracked (incl. nested dirs)
- [ ] No secret value present anywhere in the diff
- [ ] Env-expansion behavior confirmed and, if broken, fallback applied + noted for phase 2 docs

## Risk Assessment

- `${VAR}` expansion unsupported in installed Claude Code → fallback in step 1 (env inheritance), documented in guide.
- npx cold-start latency on first tool call → acceptable; note in guide.
