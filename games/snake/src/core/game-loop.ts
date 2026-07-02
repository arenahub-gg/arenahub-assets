// Fixed-timestep game loop: update() runs at a constant step for deterministic
// simulation; render() runs once per animation frame.
export interface GameLoopHandlers {
  /** Called zero or more times per frame with a fixed dt (ms). */
  update: (stepMs: number) => void;
  /** Called once per animation frame after updates. */
  render: () => void;
}

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;

  constructor(
    private readonly handlers: GameLoopHandlers,
    private readonly stepMs = 1000 / 60,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    const frame = (now: number) => {
      if (!this.running) return;
      // Clamp to avoid a huge catch-up burst after a background tab resumes
      this.accumulator += Math.min(now - this.lastTime, 250);
      this.lastTime = now;
      while (this.accumulator >= this.stepMs) {
        this.handlers.update(this.stepMs);
        this.accumulator -= this.stepMs;
      }
      this.handlers.render();
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}
