// Pure snake simulation — no DOM, no canvas, no timers. Deterministic when
// given a seeded rng, which keeps the rules testable.
export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  readonly cols: number;
  readonly rows: number;
  /** Head first. */
  snake: Point[];
  direction: Direction;
  /** Direction applied on the next tick (prevents double-turn reversals). */
  pendingDirection: Direction;
  food: Point;
  score: number;
  status: "running" | "dead";
}

export interface TickResult {
  ate: boolean;
  died: boolean;
}

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DELTA: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createSnakeState(
  cols: number,
  rows: number,
  rng: () => number = Math.random,
): SnakeState {
  const cy = Math.floor(rows / 2);
  const cx = Math.floor(cols / 2);
  const snake: Point[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  const state: SnakeState = {
    cols,
    rows,
    snake,
    direction: "right",
    pendingDirection: "right",
    food: { x: 0, y: 0 },
    score: 0,
    status: "running",
  };
  state.food = spawnFood(state, rng);
  return state;
}

/** Queue a turn; reversals into the snake's own neck are ignored. */
export function setDirection(state: SnakeState, dir: Direction): void {
  if (state.status !== "running") return;
  if (dir === OPPOSITE[state.direction]) return;
  state.pendingDirection = dir;
}

/** Advance one step. Walls and self-collision are fatal. */
export function tick(state: SnakeState, rng: () => number = Math.random): TickResult {
  if (state.status !== "running") return { ate: false, died: false };

  state.direction = state.pendingDirection;
  const head = state.snake[0];
  if (!head) return { ate: false, died: false };
  const delta = DELTA[state.direction];
  const next: Point = { x: head.x + delta.x, y: head.y + delta.y };

  const hitWall =
    next.x < 0 || next.y < 0 || next.x >= state.cols || next.y >= state.rows;
  // Tail cell is safe to move into unless this step also grows the snake
  const ate = next.x === state.food.x && next.y === state.food.y;
  const body = ate ? state.snake : state.snake.slice(0, -1);
  const hitSelf = body.some((p) => p.x === next.x && p.y === next.y);

  if (hitWall || hitSelf) {
    state.status = "dead";
    return { ate: false, died: true };
  }

  state.snake.unshift(next);
  if (ate) {
    state.score += 1;
    state.food = spawnFood(state, rng);
  } else {
    state.snake.pop();
  }
  return { ate, died: false };
}

function spawnFood(state: SnakeState, rng: () => number): Point {
  const occupied = new Set(state.snake.map((p) => `${p.x},${p.y}`));
  const free: Point[] = [];
  for (let y = 0; y < state.rows; y++) {
    for (let x = 0; x < state.cols; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return { x: -1, y: -1 }; // board full — snake won
  const index = Math.floor(rng() * free.length);
  return free[index] ?? { x: -1, y: -1 };
}
