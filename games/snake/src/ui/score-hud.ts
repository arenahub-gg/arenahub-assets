// Score HUD rendered as DOM above the canvas. Generic: shows a score and a
// best value; games decide what those numbers mean.
export class ScoreHud {
  private readonly root: HTMLDivElement;
  private readonly scoreEl: HTMLSpanElement;
  private readonly bestEl: HTMLSpanElement;

  constructor(container: HTMLElement) {
    this.root = document.createElement("div");
    this.root.style.cssText =
      "display:flex;justify-content:space-between;font-size:18px;font-weight:600;" +
      "padding:4px 2px;font-variant-numeric:tabular-nums;";
    this.scoreEl = document.createElement("span");
    this.bestEl = document.createElement("span");
    this.bestEl.style.opacity = "0.7";
    this.root.append(this.scoreEl, this.bestEl);
    container.prepend(this.root);
    this.update(0, 0);
  }

  update(score: number, best: number): void {
    this.scoreEl.textContent = `Score ${score}`;
    this.bestEl.textContent = `Best ${best}`;
  }
}
