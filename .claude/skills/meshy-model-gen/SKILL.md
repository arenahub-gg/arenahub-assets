---
name: meshy-model-gen
description: Generate a 3D model with Meshy AI and ingest it as a library asset pack (assets/meshy-*/ with pack.json, license, provenance, catalog). Use when the user asks to generate/create a 3D model ("generate 3D model", "tạo model 3D", "meshy") or when no existing asset in the catalog fits the game's need.
---

# Meshy Model Generation & Ingest

Generate a 3D model via the `meshy` MCP server and land it in the library as a first-class pack. Schema/rules: `docs/conventions.md` § "Generated asset packs". User-facing setup: `docs/generated-assets-guide.md`.

Verified against `@meshy-ai/meshy-mcp-server` v0.4.0 — if tool names below don't match the loaded server, re-check the server version and update this skill.

## Workflow

1. **Preflight.** Confirm `meshy` MCP tools are available (e.g. `meshy_text_to_3d` resolvable). If not: point the user to the prerequisites in `docs/generated-assets-guide.md` (API key + `MESHY_API_KEY` env + session restart) and STOP — do not fall back to raw REST calls.

2. **License interview (MANDATORY — before any generation).** Ask the user which Meshy plan their API key belongs to, via AskUserQuestion:
   - `free` → pack license `CC-BY-4.0`, `attribution: "Generated with Meshy (meshy.ai)"` mandatory, and WARN: every game using this pack must render attribution in-game.
   - `paid` → pack license `proprietary-owned`, no attribution field.
   Record the answer — it goes into `pack.json` (`license`, `provenance.plan`). Exactly these two branches; no third state.

3. **Generate preview.** Use `meshy_text_to_3d` (or `meshy_image_to_3d` / `meshy_multi_image_to_3d` when the user supplies reference images). Prefer game-ready phrasing in prompts (e.g. "low-poly, game-ready, clean topology"). Show the preview result to the user and confirm the silhouette before spending more credits.

4. **Refine.** On confirmation, run `meshy_text_to_3d_refine` to texture the preview mesh. Note to the user: refine is a separate credit spend.

5. **Download & land files.** Create `assets/meshy-{slug}/` (slug = kebab-case model name). Download the result GLB + texture files there via `meshy_download_model` (Meshy result URLs expire — don't stash them for later). Keep Meshy filenames when descriptive; otherwise rename descriptively — filenames are the library's search index. Binaries here ARE committed (gitignore already has `!assets/meshy-*/**` — never re-ignore them).

6. **Write `pack.json`.** Follow the exact schema in `docs/conventions.md` § "Generated asset packs". Fill:
   - `license` + `attribution` from step 2
   - `provenance`: `prompt` (the actual prompt used), `taskId` (from the MCP task response), `plan`, `generatedAt` (today)
   - `style`: a REAL value (you know the style you asked for — e.g. `low-poly-3d`, `stylized-pbr`). Never `"uncurated"`. Ask the user only if genuinely ambiguous.
   - `types`: `["3d-models"]`; `tags` include `"generated"`.

7. **Catalog.** Run `npm run catalog`; confirm the pack renders in `catalog/assets-catalog.md` with its license line.

8. **Report.** List created files + license obligations. If CC-BY: state explicitly — "any game using this pack MUST render attribution (see conventions.md Multiple-sources rule)".

## Hard rules

- No pack without `license` + full `provenance` (`prompt`, `taskId`, `plan`). Missing taskId → do not ingest.
- CC-BY pack may only be wired into a game that has an attribution surface — verify before use, not after.
- Generated binaries are committed; never add `meshy-*` payloads to `.gitignore`.
- One style per game still applies to generated packs (`pack.json` `style`).
- Do not commit the API key or paste it into any file.

## Out of scope (pointers)

- `meshy_rig` / `meshy_animate` / `meshy_remesh` / `meshy_retexture` exist on the server — follow-up workflows, same ingest rules apply if used.
- Rendering GLB → 2D sprite sheets and the three.js game template are separate plans (see `plans/260707-2118-meshy-mcp-model-generation-pipeline/plan.md` locked decisions).
