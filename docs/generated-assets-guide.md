# Generated Assets Guide (Meshy)

How to generate 3D models with Meshy AI and ingest them as library packs. Schema and rules live in [conventions.md](conventions.md) § "Generated asset packs" — this file is the how-to.

## Prerequisites

1. A Meshy account — https://www.meshy.ai
2. An API key — create at https://www.meshy.ai/settings/api
3. Export the key in the shell that launches Claude Code:
   - PowerShell: `$env:MESHY_API_KEY = "msy_..."` (or set a user env var for persistence)
   - Bash: `export MESHY_API_KEY="msy_..."`
4. Open the repo in Claude Code — `.mcp.json` registers the `meshy` MCP server automatically (`@meshy-ai/meshy-mcp-server`, pinned to v0.4.0 — bump the pin in `.mcp.json` deliberately, then re-verify the `meshy-model-gen` skill's tool names). The key is read from your environment via `${MESHY_API_KEY}` expansion; nothing secret is committed.

First tool call may be slow (npx cold start) — normal.

## License matrix — decide BEFORE generating

| Your Meshy plan | Output license | Obligation |
|---|---|---|
| Free | `CC-BY-4.0` | `attribution` field mandatory in pack.json; every game using the pack MUST render attribution in-game |
| Paid | `proprietary-owned` | None — you own the output |

Meshy credits are consumed per generation; texture refine is a separate spend from the preview mesh.

## Workflow

Run the **`meshy-model-gen`** skill — it walks the whole path:

1. License interview (free/paid) → determines pack license
2. Generate preview (`text-to-3d` or `image-to-3d`) → confirm silhouette
3. Refine (textures) → download GLB + textures into `assets/meshy-{slug}/`
4. Write `pack.json` (license + provenance per conventions)
5. `npm run catalog` → pack becomes greppable

Generated binaries are committed to git (no re-download source — Meshy task results expire).

## Unity (roadmap, not configured)

Unity's official MCP server is machine-local: it requires Unity 6+, a Unity subscription, a Unity-Cloud-linked project, and a running Editor — it cannot be project-scoped via this repo's `.mcp.json`. Unity is a possible future game track for ArenaHub (WebGL builds), but it conflicts with the current vendoring/static-dist principles and needs its own design round. See the brainstorm report: `plans/reports/brainstorm-260707-2118-meshy-unity-mcp-model-generation-report.md` (§5, Phase 4).
