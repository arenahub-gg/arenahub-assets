// Breakout orchestrator: wires pure state to loop, input, renderer, audio,
// HUD, overlay, and the ArenaHub SDK.
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
  BALL_RADIUS,
  PADDLE_CENTER_Y,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  createBreakoutState,
  movePaddle,
  tick,
  type BreakoutState,
  type BrickRow,
} from "./breakout-state";

// How far one touch swipe glides the paddle (normalized units)
const SWIPE_GLIDE_DISTANCE = 0.28;

const IMAGE_MANIFEST = {
  paddle: "assets/sprites/paddle.png",
  ball: "assets/sprites/ball.png",
  brick0: "assets/sprites/brick-red.png",
  brick1: "assets/sprites/brick-orange.png",
  brick2: "assets/sprites/brick-yellow.png",
  brick3: "assets/sprites/brick-green.png",
  brick4: "assets/sprites/brick-blue.png",
};

const BRICK_IMAGE_KEY: Record<BrickRow, keyof typeof IMAGE_MANIFEST> = {
  0: "brick0",
  1: "brick1",
  2: "brick2",
  3: "brick3",
  4: "brick4",
};

export class BreakoutGame {
  private state: BreakoutState;
  private best = 0;
  /** Paddle glide destination set by touch swipes; null when idle. */
  private glideTargetX: number | null = null;
  private readonly loop: GameLoop;
  private readonly renderer: CanvasRenderer;
  private readonly keyboard = new KeyboardInput();
  private readonly audio = new AudioPlayer();
  private readonly hud: ScoreHud;
  private readonly overlay: GameOverOverlay;
  private images: Awaited<ReturnType<typeof loadImages<keyof typeof IMAGE_MANIFEST>>> | null = null;

  constructor(
    private readonly stage: HTMLElement,
    private readonly sdk: ArenaHubSDK,
    private readonly gameId: string,
  ) {
    this.state = createBreakoutState();
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
    this.audio.register("brick", "assets/audio/brick.ogg");
    this.audio.register("paddle", "assets/audio/paddle.ogg");
    this.audio.register("levelClear", "assets/audio/level-clear.ogg");
    this.audio.register("lose", "assets/audio/lose.ogg");
    this.best = (await this.sdk.getHighScore(this.gameId)) ?? 0;
    this.hud.update(0, this.best);

    // Held keys are polled in update(); onPress only for toggles
    this.keyboard.attach();
    this.keyboard.onPress("KeyM", () => this.audio.toggleMute());

    const touch = new TouchInput(this.stage);
    touch.attach();
    touch.onSwipe((dir) => {
      if (dir !== "left" && dir !== "right") return;
      const delta = dir === "left" ? -SWIPE_GLIDE_DISTANCE : SWIPE_GLIDE_DISTANCE;
      const half = PADDLE_WIDTH / 2;
      this.glideTargetX = Math.min(1 - half, Math.max(half, this.state.paddleX + delta));
    });

    this.overlay.onRestart(() => this.restart());
    this.loop.start();
  }

  private restart(): void {
    this.state = createBreakoutState();
    this.glideTargetX = null;
    this.overlay.hide();
    this.hud.update(0, this.best);
  }

  /** -1/0/1 from held keys: arrows or A/D. */
  private heldDirection(): -1 | 0 | 1 {
    const left = this.keyboard.isDown("ArrowLeft") || this.keyboard.isDown("KeyA");
    const right = this.keyboard.isDown("ArrowRight") || this.keyboard.isDown("KeyD");
    if (left === right) return 0;
    return left ? -1 : 1;
  }

  private update(dtMs: number): void {
    if (this.state.status !== "running") return;

    const dir = this.heldDirection();
    if (dir !== 0) {
      this.glideTargetX = null; // keyboard overrides a pending swipe glide
      movePaddle(this.state, dir, dtMs);
    } else if (this.glideTargetX !== null) {
      const delta = this.glideTargetX - this.state.paddleX;
      const step = PADDLE_SPEED * dtMs;
      if (Math.abs(delta) <= step) {
        this.state.paddleX = this.glideTargetX;
        this.glideTargetX = null;
      } else {
        movePaddle(this.state, delta < 0 ? -1 : 1, dtMs);
      }
    }

    const events = tick(this.state, dtMs);
    if (events.bricksBroken > 0) {
      this.audio.play("brick");
      this.hud.update(this.state.score, this.best);
    }
    if (events.paddleHit) this.audio.play("paddle");
    if (events.levelCleared) this.audio.play("levelClear");
    if (events.lost) {
      this.audio.play("lose");
      void this.onLoss();
    }
  }

  private async onLoss(): Promise<void> {
    await this.sdk.submitScore(this.gameId, this.state.score);
    this.best = (await this.sdk.getHighScore(this.gameId)) ?? this.state.score;
    this.hud.update(this.state.score, this.best);
    this.overlay.show(this.state.score, this.best);
  }

  private render(): void {
    const r = this.renderer;
    const images = this.images;
    if (!images) return;
    r.clear("#1b2127");

    const w = r.width;
    const h = r.height;

    for (const brick of this.state.bricks) {
      if (!brick.alive) continue;
      r.drawSprite(
        images[BRICK_IMAGE_KEY[brick.row]],
        (brick.x + brick.w / 2) * w,
        (brick.y + brick.h / 2) * h,
        brick.w * w,
        brick.h * h,
      );
    }

    r.drawSprite(
      images.paddle,
      this.state.paddleX * w,
      PADDLE_CENTER_Y * h,
      PADDLE_WIDTH * w,
      PADDLE_HEIGHT * h,
    );

    r.drawSprite(
      images.ball,
      this.state.ball.x * w,
      this.state.ball.y * h,
      BALL_RADIUS * 2 * w,
      BALL_RADIUS * 2 * h,
    );

    r.drawText(`Level ${this.state.level}`, w - 8, 14, {
      color: "rgba(255,255,255,0.45)",
      align: "right",
      font: "13px system-ui, sans-serif",
    });
  }
}
