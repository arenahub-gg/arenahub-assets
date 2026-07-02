# Brainstorm Report: ArenaHub Asset & Knowledge Library — Foundation (Round 1)

- Date: 2026-07-02
- Mode: `/brainstorm --html` (HTML report: `brainstorm-260702-1055-arenahub-asset-library-foundation-report.html`)
- Repo: `E:\development\arenahub-asset` (greenfield, empty at brainstorm time)
- Status: **Design approved by user** — ready for `/ck:plan`

---

## 1. Problem Statement

User vision: knowledge/asset library so Claude assembles ArenaHub games from reusable blocks instead of generating from scratch.

Problem-first decompression — underlying problem:

> AI-generated games are inconsistent, low quality, and each generation restarts from zero. Nothing is reused; games don't plug into the platform uniformly; art/audio can't be produced by Claude at all.

### Solution-jumping diagnosis
- Signal: past AI game generations felt random, unreusable, unbrandable.
- Proposed solution (11-branch taxonomy, hundreds of assets) = compressed confession of 3 distinct pains: consistency, asset scarcity, knowledge reuse.

### Assumption challenges
| Assumption | Risk if wrong | Validation |
|---|---|---|
| Full taxonomy needed upfront | Months of work, most assets never used (YAGNI) | Build 1 game, extract only what it used |
| Search infra needed | Over-engineering; Claude greps fine | Test Glob/Grep on descriptive filenames + MD catalog |
| Code snippets = valuable | Claude already writes code cheaply | Compare: time saved by snippet vs binary asset vs platform contract |
| Metadata per asset file | Kenney packs = hundreds of files; hand-written metadata unmaintainable | Pack-level metadata + filename search |

### Evidence status
**Weak-to-medium**: founder conviction + general industry pattern (AI codegen consistent when given templates/contracts). No production data yet — platform still being built, no games live. Justifies cheap validated slice, not full build-out.

## 2. Requirements (confirmed via Q&A)

| Item | Decision |
|---|---|
| Platform status | arenahub.gg in development, no games live, game↔platform contract open |
| Game stack | HTML5 Canvas + TypeScript, no engine framework |
| Binary asset source | CC0 packs (Kenney et al.) |
| Claude consumption | Git repo + markdown catalogs (Glob/Grep/Read), zero infra |
| Round-1 scope | Foundation + 1 complete game with reverse extraction |
| Multiplayer | Contract-first: SDK interface defined now, local stub impl, single-player first game |
| First game | Snake (real-time family: game loop, input, collision, render, score) |

Acceptance criterion: fresh Claude session + this repo + prompt "make game X" → playable browser game reusing library assets/components, not from scratch.

Out of scope round 1: search engine/MCP/HTTP API, multiplayer implementation, AI prompt library, versioning beyond git, full 11-branch taxonomy, deploy pipeline, AI-generated assets.

## 3. Alternative Framings Evaluated

| Frame | Problem reading | Solution space | Verdict |
|---|---|---|---|
| A. Consistency | Every generated game = different stack, can't plug into platform | 1 standard template + SDK contract + docs | **Priority 1** — cheapest, highest leverage |
| B. Asset bottleneck | Claude can't make art/audio | Clean-license binary packs + catalog | **Priority 2** — seeded via CC0 import |
| C. Knowledge | Claude re-derives rules/patterns each time | Rules specs + reference implementations | Priority 3 — grows via extracted games; `rules/` dir reserved |

Rejected approaches:
- **Full taxonomy skeleton upfront** — empty dirs + guessed APIs; classic speculative design. Rejected.
- **Foundation-only (no game)** — library never validated against real usage. Rejected: extraction-from-real-game is the core method.
- **Multiplayer from game 1** — two unstable ends (platform contract + room infra) at once. Rejected; interface-only now.
- **Vector DB / search service** — over-engineered for Claude-as-consumer at repo scale. Rejected.

## 4. Approved Design

### Principles
1. Library **extracted from real games**, not designed speculatively.
2. Consumer is Claude → search = Glob/Grep/Read + markdown catalogs. No infra.
3. Generated games **self-contained** (static CDN deploy) → engine/components **vendored** (copied in) at generation time, not npm-linked.

### Repo structure
```
arenahub-asset/
├── CLAUDE.md                  # how Claude uses the library (most important entry point)
├── catalog/
│   ├── assets-catalog.md      # generated from pack.json + filenames
│   ├── components-catalog.md
│   └── games-catalog.md
├── assets/
│   └── kenney-{pack-name}/
│       ├── pack.json          # {name, source, license, style, tags, contents}
│       └── sprites|audio|fonts/...
├── engine/                    # core TS: game-loop, input, canvas-renderer, audio-player, asset-loader
├── components/                # reusable systems — only what Snake uses (score, timer, hud...)
├── sdk/
│   ├── arenahub-sdk.ts        # interface: getPlayer, submitScore, storage, room (interface only)
│   └── arenahub-sdk-local-stub.ts  # localStorage impl until platform ready
├── templates/
│   └── canvas-game/           # Vite + TS + Canvas starter, engine + SDK stub pre-wired
├── games/
│   └── snake/                 # first complete game — demo + reference implementation
├── rules/                     # structured game-rule specs (populated later rounds)
└── docs/                      # conventions, add-a-pack guide, extraction guide
```

### Key decisions
- **Pack-level metadata, not per-file**: `pack.json` holds style/tags/license; individual assets found via Kenney's descriptive filenames + script-generated catalog MD. Grep "explosion" → hit.
- **SDK contract-first**: game code calls `ArenaHubSDK` interface only; stub swaps for real impl when platform ships. Solves Frame A earliest possible.
- **Vendoring over package dependency**: generated game pins the engine copy it shipped with; library evolves freely without breaking deployed games.

### Execution flow
1. Structure + conventions + CLAUDE.md
2. Import 1-2 Kenney packs fitting Snake (sprites + SFX) + catalog generator script
3. SDK interface + local stub
4. Build Snake complete (real assets, SDK stub, score)
5. Reverse-extract: generic parts → `engine/` + `components/`; skeleton → `templates/canvas-game/`
6. Acceptance test: fresh session, prompt "make breakout" → playable game using library

## 5. Risks

| Risk | Mitigation |
|---|---|
| Extraction from 1 game → wrong component APIs | Accepted; round 2 (Caro, turn-based) forces refactor — intended maturation path |
| Kenney style ≠ ArenaHub brand | `style` field in pack.json from day 1; packs swappable without structural change |
| Platform contract diverges from SDK interface guess | Interface kept minimal (identity/score/storage/room); stub isolates blast radius |
| Vendored engine copies drift across games | Acceptable by design (deployed games frozen); template always vendors latest |

## 6. Success Metrics
- Fresh Claude session generates a playable new Canvas game from the repo without writing engine/asset code from scratch.
- Snake runs in browser with library assets + SDK stub score persistence.
- Catalog regenerable by script; grep finds assets by keyword.
- Zero external infra required.

## 7. Next Steps
1. `/ck:plan` this report → phased implementation plan (recommended: default mode; greenfield, no existing tests → TDD gate not warranted).
2. Round 2 (future brainstorm): Caro (turn-based family) → component API refactor + `rules/` first entries.
3. Round 3+ (future): platform SDK real implementation, multiplayer room, AI-generated asset pipeline.

## Unresolved Questions
- Which specific Kenney packs (style direction) — decide during implementation when browsing pack candidates.
- ArenaHub brand/style guide — not yet defined; affects future pack curation, not structure.
- Platform auth/identity shape — SDK `getPlayer()` field set is a guess until platform team confirms.
