// Placeholder game: a square that moves with arrow keys / WASD and bounces off
// walls. REPLACE this file (and main.ts wiring) with real game logic. It exists
// to prove the loop + input + renderer wiring works before you start.
import type { CanvasRenderer } from "../core/canvas-renderer";

export class ExampleGame {
  private x = 0.5; // normalized 0..1 coordinates, resolution-independent
  private y = 0.5;
  private vx = 0.00025; // per ms
  private vy = 0;

  setDirection(dir: "up" | "down" | "left" | "right"): void {
    const speed = 0.00025;
    this.vx = dir === "left" ? -speed : dir === "right" ? speed : 0;
    this.vy = dir === "up" ? -speed : dir === "down" ? speed : 0;
  }

  update(dtMs: number): void {
    this.x += this.vx * dtMs;
    this.y += this.vy * dtMs;
    if (this.x < 0.05 || this.x > 0.95) this.vx *= -1;
    if (this.y < 0.05 || this.y > 0.95) this.vy *= -1;
    this.x = Math.min(0.95, Math.max(0.05, this.x));
    this.y = Math.min(0.95, Math.max(0.05, this.y));
  }

  render(r: CanvasRenderer): void {
    r.clear("#1b2127");
    r.drawText("Replace src/game/ with your game logic", r.width / 2, 24, {
      color: "rgba(255,255,255,0.5)",
      align: "center",
    });
    const size = Math.min(r.width, r.height) * 0.08;
    r.drawRect(this.x * r.width, this.y * r.height, size, size, "#7ac74f");
  }
}
