// localStorage-backed ArenaHubSDK implementation for games running before the
// platform exists. Swapped for the real platform SDK without touching game code.
import type {
  ArenaHubPlayer,
  ArenaHubRoom,
  ArenaHubSDK,
  ArenaHubStorage,
} from "./arenahub-sdk";

const PLAYER_KEY = "arenahub:player";

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function ensureGuestPlayer(): ArenaHubPlayer {
  const existing = readJson<ArenaHubPlayer>(PLAYER_KEY);
  if (existing) return existing;
  const player: ArenaHubPlayer = {
    id: `guest-${crypto.randomUUID()}`,
    displayName: "Guest",
  };
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
  return player;
}

class LocalStorageNamespace implements ArenaHubStorage {
  constructor(private readonly prefix: string) {}

  async get<T>(key: string): Promise<T | null> {
    return readJson<T>(`${this.prefix}${key}`);
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(`${this.prefix}${key}`);
  }
}

// Room is not implemented in R1 — see plan R3 (platform multiplayer).
class NotImplementedRoom implements ArenaHubRoom {
  private fail(): never {
    throw new Error(
      "ArenaHub room API is not implemented in the local stub (planned for the platform multiplayer round)",
    );
  }
  join(): Promise<void> {
    this.fail();
  }
  leave(): Promise<void> {
    this.fail();
  }
  send(): void {
    this.fail();
  }
  onMessage(): void {
    this.fail();
  }
}

class LocalArenaHubSdk implements ArenaHubSDK {
  readonly storage: ArenaHubStorage;
  readonly room: ArenaHubRoom = new NotImplementedRoom();

  constructor(private readonly gameId: string) {
    this.storage = new LocalStorageNamespace(`arenahub:${gameId}:`);
  }

  async getPlayer(): Promise<ArenaHubPlayer> {
    return ensureGuestPlayer();
  }

  // High score lives under "arenahub:sys:" — outside the "arenahub:{gameId}:"
  // namespace that sdk.storage exposes, so game writes can't corrupt it.
  async submitScore(gameId: string, score: number): Promise<void> {
    const key = `arenahub:sys:${gameId}:highscore`;
    const current = readJson<number>(key) ?? 0;
    if (score > current) localStorage.setItem(key, JSON.stringify(score));
  }

  async getHighScore(gameId: string): Promise<number | null> {
    return readJson<number>(`arenahub:sys:${gameId}:highscore`);
  }
}

/** Create the default (localStorage) SDK for a game. gameId = game folder name. */
export function createLocalSdk(gameId: string): ArenaHubSDK {
  return new LocalArenaHubSdk(gameId);
}
