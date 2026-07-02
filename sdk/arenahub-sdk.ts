// ArenaHub platform contract — the ONLY boundary between games and the platform.
// Games import from sdk/index.ts and call these interfaces; they never talk to
// platform APIs directly. Until the platform ships, the localStorage stub
// (arenahub-sdk-local-stub.ts) is the default implementation.
//
// Speculative members are marked "platform intent"; expect field-level changes
// when the real platform lands. Keep this surface minimal (YAGNI).

export interface ArenaHubPlayer {
  /** Platform intent: stable platform user id. Stub: generated guest id. */
  id: string;
  /** Platform intent: chosen display name. Stub: "Guest". */
  displayName: string;
}

export interface ArenaHubStorage {
  /** Namespaced per game by the implementation. Values are JSON-serializable. */
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

/**
 * Multiplayer room API — INTERFACE ONLY in R1. No implementation exists yet;
 * the stub throws. Shape is a placeholder for the platform's WebSocket rooms.
 */
export interface ArenaHubRoom {
  join(roomId: string): Promise<void>;
  leave(): Promise<void>;
  send(message: unknown): void;
  onMessage(handler: (message: unknown, senderId: string) => void): void;
}

export interface ArenaHubSDK {
  getPlayer(): Promise<ArenaHubPlayer>;
  /**
   * Platform intent: score is server-authoritative in production.
   * Stub: trusts the client and stores locally.
   */
  submitScore(gameId: string, score: number): Promise<void>;
  /** Highest score ever submitted for this game by this player, or null. */
  getHighScore(gameId: string): Promise<number | null>;
  storage: ArenaHubStorage;
  /** Reserved for R3 multiplayer. Accessing methods on the stub throws. */
  room: ArenaHubRoom;
}
