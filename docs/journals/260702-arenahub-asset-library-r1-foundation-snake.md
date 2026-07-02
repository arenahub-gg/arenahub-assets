# ArenaHub Asset Library R1 Foundation + Snake Game Completed

**Date**: 2026-07-02 11:50
**Severity**: N/A
**Component**: ArenaHub SDK, Asset Catalog, Snake Game Implementation
**Status**: Resolved

## What Happened

Completed 6-phase foundation plan + first game (Snake). Greenfield repo went from brainstorm to a working SDK contract with asset library (795 sprites, 62 SFX), engine/renderer, and a verified playable game in a single session. Acceptance test (fresh subagent building Breakout from template) passed without requiring engine rewrites. All 17 pure-logic node tests pass.

## The Brutal Truth

One debugging detour burned 90 minutes: the preview panel browser stayed hidden, rAF never fired, canvas rendered 0×0. Looked like a code bug. Turned out: ResizeObserver + rAF pause in hidden windows. Once we switched to agent-browser headless Chromium for verification, the real issue vanished instantly and we saw Snake working perfectly. That's frustrating because the error message had nothing to do with the actual cause—it felt like chasing ghosts in test setup rather than real logic.

## Technical Details

- 8 commits, 913a5ff..a27bbda: foundation layer, CLAUDE.md, pack.json + catalog generation, ArenaHubSDK stub, snake game (17 tests, all pass), reverse-extracted engine (6 modules) + components (2)
- Code review: 2 majors fixed: stub high-score key moved out of game-writable namespace (arenahub:sys:*), death path wrapped in try/catch + guaranteed overlay (soft-lock prevention)
- Snake verification: keyboard input, touch swipe, death overlay, localStorage persist via SDK stub, all working via agent-browser headless Chromium

## What We Tried

- Preview panel browser debugging: checked rAF loop, canvas context, ResizeObserver callbacks—all correct in isolation. ResizeObserver + rAF pause behavior only visible when panel hidden.
- Switched to agent-browser headless Chromium: Snake ran on first try, acceptance test (Breakout from template) passed, zero canvas issues.

## Root Cause Analysis

Preview panel was a red herring. The real issue: browser pauses rAF + ResizeObserver when tab/window hidden. We had defensive code checking size each frame, but hadn't anticipated the hidden-panel scenario. The acceptance test forced us to use headless Chromium, which doesn't have that pause behavior—and suddenly the actual logic was visible and correct.

The soft-lock in death path was real: stub SDK `onDeath()` returned void; a real rejecting SDK would hang the game. Code review caught it, fix was trivial (try/catch, always show overlay).

## Lessons Learned

1. **Preview panel is a trap**: hidden windows pause rAF + ResizeObserver. Use headless browsers for verification; preview panel is for human eyeballs, not test truth.
2. **Acceptance tests are brutal teachers**: forcing a fresh subagent to use the template surfaced real API gaps (8 items in gap report, all folded into docs/recipe).
3. **Stub SDKs must fail safely**: void returns in critical paths invite soft-locks. Always guard with try/catch + guaranteed fallback UI.

## Next Steps

- R2: Caro (turn-based game) to drive component API maturity and rules/ population. Backlog in engine/README.md (touch pointer-drag, SDK gameId scoping, breakout rng injection + speed cap).
- R3: real SDK implementation + multiplayer layer.

Status: DONE
Summary: Foundation + Snake shipped with verified SDK contract and asset library; preview browser debugging detour resolved via headless Chromium verification; acceptance test passed.
