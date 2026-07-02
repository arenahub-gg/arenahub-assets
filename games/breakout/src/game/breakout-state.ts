// Pure Breakout state + physics. No DOM, no engine imports — the orchestrator
// (breakout-game.ts) wires this to loop/input/renderer/audio.
// Coordinates are normalized 0..1 on both axes (the stage is square).

export type BrickRow = 0 | 1 | 2 | 3 | 4;

export interface Brick {
  x: number; // left edge
  y: number; // top edge
  w: number;
  h: number;
  row: BrickRow; // color/points row (0 = top)
  alive: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number; // per ms
  vy: number; // per ms
}

export interface BreakoutState {
  paddleX: number; // paddle center
  ball: Ball;
  bricks: Brick[];
  score: number;
  level: number;
  status: "running" | "gameover";
}

export interface TickEvents {
  paddleHit: boolean;
  wallHit: boolean;
  bricksBroken: number;
  levelCleared: boolean;
  lost: boolean;
}

export const PADDLE_WIDTH = 0.18;
export const PADDLE_HEIGHT = 0.035;
export const PADDLE_CENTER_Y = 0.94;
export const PADDLE_SPEED = 0.0009; // normalized units per ms
export const BALL_RADIUS = 0.016;

const BASE_BALL_SPEED = 0.00042; // per ms; crosses the field in ~2.4s
const SPEED_PER_LEVEL = 0.00006;
const MAX_BOUNCE_ANGLE = (Math.PI / 180) * 60; // from vertical, at paddle edge

const BRICK_COLS = 8;
const BRICK_ROWS = 5;
const BRICK_TOP = 0.09;
const BRICK_HEIGHT = 0.045;
const BRICK_GAP = 0.008;
const ROW_POINTS: Record<BrickRow, number> = { 0: 50, 1: 40, 2: 30, 3: 20, 4: 10 };

function ballSpeed(level: number): number {
  return BASE_BALL_SPEED + (level - 1) * SPEED_PER_LEVEL;
}

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  const w = (1 - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_GAP + col * (w + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        w,
        h: BRICK_HEIGHT,
        row: row as BrickRow,
        alive: true,
      });
    }
  }
  return bricks;
}

/** Serve the ball from above the paddle at a slight random angle upward. */
function serveBall(paddleX: number, level: number): Ball {
  const speed = ballSpeed(level);
  const angle = (Math.random() * 0.6 - 0.3) * Math.PI; // within ±54° of vertical
  return {
    x: paddleX,
    y: PADDLE_CENTER_Y - PADDLE_HEIGHT / 2 - BALL_RADIUS - 0.01,
    vx: Math.sin(angle) * speed,
    vy: -Math.abs(Math.cos(angle) * speed),
  };
}

export function createBreakoutState(): BreakoutState {
  const paddleX = 0.5;
  return {
    paddleX,
    ball: serveBall(paddleX, 1),
    bricks: buildBricks(),
    score: 0,
    level: 1,
    status: "running",
  };
}

/** Move the paddle by held input direction; clamped to the field. */
export function movePaddle(state: BreakoutState, dir: -1 | 0 | 1, dtMs: number): void {
  if (dir === 0 || state.status !== "running") return;
  const half = PADDLE_WIDTH / 2;
  state.paddleX = Math.min(1 - half, Math.max(half, state.paddleX + dir * PADDLE_SPEED * dtMs));
}

export function brickPoints(row: BrickRow): number {
  return ROW_POINTS[row];
}

/** Reflect the ball off the paddle; exit angle depends on where it hit. */
function bounceOffPaddle(state: BreakoutState): void {
  const { ball } = state;
  const speed = ballSpeed(state.level);
  const offset = Math.min(1, Math.max(-1, (ball.x - state.paddleX) / (PADDLE_WIDTH / 2)));
  const angle = offset * MAX_BOUNCE_ANGLE;
  ball.vx = Math.sin(angle) * speed;
  ball.vy = -Math.abs(Math.cos(angle) * speed);
  ball.y = PADDLE_CENTER_Y - PADDLE_HEIGHT / 2 - BALL_RADIUS;
}

/** Reflect the ball off the first overlapping brick; returns whether one broke. */
function collideBricks(state: BreakoutState): boolean {
  const { ball } = state;
  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    const overlapX = Math.min(ball.x + BALL_RADIUS, brick.x + brick.w) - Math.max(ball.x - BALL_RADIUS, brick.x);
    const overlapY = Math.min(ball.y + BALL_RADIUS, brick.y + brick.h) - Math.max(ball.y - BALL_RADIUS, brick.y);
    if (overlapX <= 0 || overlapY <= 0) continue;
    brick.alive = false;
    state.score += brickPoints(brick.row);
    // Bounce along the axis of least penetration
    if (overlapX < overlapY) {
      ball.vx = ball.x < brick.x + brick.w / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
    } else {
      ball.vy = ball.y < brick.y + brick.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    }
    return true;
  }
  return false;
}

/** Advance physics by dtMs. Score/level/status are mutated on the state. */
export function tick(state: BreakoutState, dtMs: number): TickEvents {
  const events: TickEvents = {
    paddleHit: false,
    wallHit: false,
    bricksBroken: 0,
    levelCleared: false,
    lost: false,
  };
  if (state.status !== "running") return events;

  const { ball } = state;
  ball.x += ball.vx * dtMs;
  ball.y += ball.vy * dtMs;

  // Side and top walls
  if (ball.x - BALL_RADIUS < 0) {
    ball.x = BALL_RADIUS;
    ball.vx = Math.abs(ball.vx);
    events.wallHit = true;
  } else if (ball.x + BALL_RADIUS > 1) {
    ball.x = 1 - BALL_RADIUS;
    ball.vx = -Math.abs(ball.vx);
    events.wallHit = true;
  }
  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS;
    ball.vy = Math.abs(ball.vy);
    events.wallHit = true;
  }

  // Paddle (only when the ball travels downward)
  if (
    ball.vy > 0 &&
    ball.y + BALL_RADIUS >= PADDLE_CENTER_Y - PADDLE_HEIGHT / 2 &&
    ball.y - BALL_RADIUS <= PADDLE_CENTER_Y + PADDLE_HEIGHT / 2 &&
    Math.abs(ball.x - state.paddleX) <= PADDLE_WIDTH / 2 + BALL_RADIUS
  ) {
    bounceOffPaddle(state);
    events.paddleHit = true;
  }

  if (collideBricks(state)) {
    events.bricksBroken = 1;
    if (state.bricks.every((b) => !b.alive)) {
      // Level cleared: refill the wall, speed up, re-serve. Score carries over.
      state.level += 1;
      state.bricks = buildBricks();
      state.ball = serveBall(state.paddleX, state.level);
      events.levelCleared = true;
    }
  }

  // Ball fell below the field — game over (single life)
  if (ball.y - BALL_RADIUS > 1) {
    state.status = "gameover";
    events.lost = true;
  }

  return events;
}
