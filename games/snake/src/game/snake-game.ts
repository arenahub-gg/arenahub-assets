// Snake orchestrator: wires pure state to loop, input, renderer, audio, HUD,
// overlay, and the ArenaHub SDK.
import type { ArenaHubSDK } from "../../../../sdk";
import { GameLoop } from "../core/game-loop";
import { KeyboardInput } from "../core/keyboard-input";
import { TouchInput } from "../core/touch-input";
import { CanvasRenderer } from "../core/canvas-renderer";
import { loadImages } from "../core/asset-loader";
import { AudioPlayer } from "../core/audio-player";
import { ScoreHud } from "../ui/score-hud";
import { GameOverOverlay } from "../ui/game-over-overlay";
import {
  createSnakeState,
  setDirection,
  tick,
  type Direction,
  type SnakeState,
} from "./snake-state";

const GAME_ID = "snake";
const COLS = 20;
const ROWS = 20;
const BASE_TICK_MS = 140;
const MIN_TICK_MS = 70;
// Pentagon head sprite points up; rotate to face movement direction
const HEAD_ROTATION: Record<Direction, number> = {
  up: 0,
  right: Math.PI / 2,
  down: Math.PI,
  left: -Math.PI / 2,
};

const IMAGE_MANIFEST = {
  body: "assets/sprites/snake-body.png",
  head: "assets/sprites/snake-head.png",
  food: "assets/sprites/food-coin.png",
};

export class SnakeGame {
  private state: SnakeState;
  private tickAccumulator = 0;
  private best = 0;
  private readonly loop: GameLoop;
  private readonly renderer: CanvasRenderer;
  private readonly audio = new AudioPlayer();
  private readonly hud: ScoreHud;
  private readonly overlay: GameOverOverlay;
  private images: Awaited<ReturnType<typeof loadImages<keyof typeof IMAGE_MANIFEST>>> | null = null;

  constructor(
    private readonly stage: HTMLElement,
    private readonly sdk: ArenaHubSDK,
  ) {
    this.state = createSnakeState(COLS, ROWS);
    this.renderer = new CanvasRenderer(stage);
    this.hud = new ScoreHud(stage.parentElement ?? stage);
    this.overlay = new GameOverOverlay(stage);
    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: () => this.render(),
    });
  }

  async start(): Promise<void> {
    this.images = await loadImages(IMAGE_MANIFEST);
    this.audio.register("eat", "assets/audio/eat.ogg");
    this.audio.register("lose", "assets/audio/lose.ogg");
    this.best = (await this.sdk.getHighScore(GAME_ID)) ?? 0;
    this.hud.update(0, this.best);

    const keyboard = new KeyboardInput();
    keyboard.attach();
    const turn = (dir: Direction) => setDirection(this.state, dir);
    keyboard.onPress("ArrowUp", () => turn("up"));
    keyboard.onPress("ArrowDown", () => turn("down"));
    keyboard.onPress("ArrowLeft", () => turn("left"));
    keyboard.onPress("ArrowRight", () => turn("right"));
    keyboard.onPress("KeyW", () => turn("up"));
    keyboard.onPress("KeyS", () => turn("down"));
    keyboard.onPress("KeyA", () => turn("left"));
    keyboard.onPress("KeyD", () => turn("right"));
    keyboard.onPress("KeyM", () => this.audio.toggleMute());

    const touch = new TouchInput(this.stage);
    touch.attach();
    touch.onSwipe((dir) => turn(dir));

    this.overlay.onRestart(() => this.restart());
    this.loop.start();
  }

  private restart(): void {
    this.state = createSnakeState(COLS, ROWS);
    this.tickAccumulator = 0;
    this.overlay.hide();
    this.hud.update(0, this.best);
  }

  /** Snake speeds up as it grows: shorter tick per point, floored. */
  private currentTickMs(): number {
    return Math.max(MIN_TICK_MS, BASE_TICK_MS - this.state.score * 3);
  }

  private update(dtMs: number): void {
    if (this.state.status !== "running") return;
    this.tickAccumulator += dtMs;
    const tickMs = this.currentTickMs();
    while (this.tickAccumulator >= tickMs) {
      this.tickAccumulator -= tickMs;
      const result = tick(this.state);
      if (result.ate) {
        this.audio.play("eat");
        this.hud.update(this.state.score, this.best);
      }
      if (result.died) {
        this.audio.play("lose");
        void this.onDeath();
      }
    }
  }

  private async onDeath(): Promise<void> {
    // SDK may reject once the real platform lands (server-authoritative score)
    // — the overlay must show regardless or the player is stuck on a dead board.
    try {
      await this.sdk.submitScore(GAME_ID, this.state.score);
      this.best = (await this.sdk.getHighScore(GAME_ID)) ?? this.state.score;
    } catch {
      this.best = Math.max(this.best, this.state.score);
    }
    this.hud.update(this.state.score, this.best);
    this.overlay.show(this.state.score, this.best);
  }

  private render(): void {
    const r = this.renderer;
    const images = this.images;
    if (!images) return;
    r.clear("#1b2127");
    r.drawGridLines(COLS, ROWS, "rgba(255,255,255,0.04)");

    const cellW = r.width / COLS;
    const cellH = r.height / ROWS;
    const cx = (p: { x: number }) => p.x * cellW + cellW / 2;
    const cy = (p: { y: number }) => p.y * cellH + cellH / 2;

    if (this.state.food.x >= 0) {
      r.drawSprite(images.food, cx(this.state.food), cy(this.state.food), cellW * 0.8, cellH * 0.8);
    }
    for (let i = this.state.snake.length - 1; i >= 1; i--) {
      const seg = this.state.snake[i];
      if (seg) r.drawSprite(images.body, cx(seg), cy(seg), cellW * 0.92, cellH * 0.92);
    }
    const head = this.state.snake[0];
    if (head) {
      r.drawSprite(
        images.head,
        cx(head),
        cy(head),
        cellW,
        cellH,
        HEAD_ROTATION[this.state.direction],
      );
    }
  }
}
