---
phase: 3
title: SDK Contract & Local Stub
status: completed
priority: P1
dependencies:
  - 1
effort: S
---

# Phase 3: SDK Contract & Local Stub

## Overview
Define the `ArenaHubSDK` TypeScript interface (game ↔ platform contract) and a localStorage stub implementation. Games code against the interface only; real platform impl swaps in later without touching game code.

## Requirements
- Functional: identity, score submission, key-value storage, room API (interface ONLY — no implementation).
- Non-functional: minimal surface (YAGNI — only what Snake + near-future games need); zero dependencies; framework-agnostic TS.

## Architecture
```
sdk/
├── arenahub-sdk.ts             # interfaces + types (the contract)
├── arenahub-sdk-local-stub.ts  # localStorage-backed implementation
└── index.ts                    # re-exports + createLocalSdk() factory
```

Contract sketch (final shape decided at implementation, keep this minimal):
```ts
interface ArenaHubPlayer { id: string; displayName: string; }
interface ArenaHubStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}
interface ArenaHubRoom { /* interface only — join/leave/send/onMessage signatures, no impl in R1 */ }
interface ArenaHubSDK {
  getPlayer(): Promise<ArenaHubPlayer>;
  submitScore(gameId: string, score: number): Promise<void>;
  getHighScore(gameId: string): Promise<number | null>;
  storage: ArenaHubStorage;
  // room: reserved — typed but throws "not implemented" in stub
}
```

Stub: `createLocalSdk()` — player = generated guest id persisted in localStorage; scores/storage namespaced `arenahub:{gameId}:*`; room methods throw descriptive `NotImplementedError`.

## Related Code Files
- Create: `sdk/arenahub-sdk.ts`
- Create: `sdk/arenahub-sdk-local-stub.ts`
- Create: `sdk/index.ts`
- Modify: `CLAUDE.md` — SDK usage section: "games call the interface; never call platform APIs directly; stub is default until platform ships".
- Modify: `docs/conventions.md` — contract-first rule.

## Implementation Steps
1. Write interface file with doc comments explaining each member's platform intent (comments state contract constraints, e.g. "score is server-authoritative in production; stub trusts client").
2. Write local stub (guest identity, namespaced localStorage, high-score tracking).
3. Write `index.ts` factory.
4. Type-check standalone: `npx tsc --noEmit -p` a minimal tsconfig extending base.
5. Commit: `feat: define arenahub sdk contract with localstorage stub`.

## Success Criteria
- [ ] Interface compiles strict; no `any`.
- [ ] Stub round-trips: submitScore → getHighScore returns max; storage get/set works in browser.
- [ ] Room typed but unimplemented, throwing clear error naming the R3 roadmap.
- [ ] Game code (phase 4) imports only from `sdk/index.ts`.

## Risk Assessment
Main risk (accepted in brainstorm): platform contract diverges from this guess. Mitigation: minimal surface, stub isolates blast radius, doc comments mark every speculative member. Do NOT add auth flows, currencies, achievements — YAGNI until platform exists.
