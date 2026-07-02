// Game-over overlay with final score and a restart button. Positioned over the
// game stage (parent must be position:relative).
export class GameOverOverlay {
  private readonly root: HTMLDivElement;
  private readonly scoreEl: HTMLParagraphElement;
  private restartHandler: (() => void) | null = null;

  constructor(stage: HTMLElement) {
    this.root = document.createElement("div");
    this.root.style.cssText =
      "position:absolute;inset:0;display:none;flex-direction:column;align-items:center;" +
      "justify-content:center;gap:16px;background:rgba(10,12,14,0.82);text-align:center;";
    const title = document.createElement("h1");
    title.textContent = "Game Over";
    title.style.cssText = "font-size:32px;margin:0;";
    this.scoreEl = document.createElement("p");
    this.scoreEl.style.cssText = "font-size:20px;margin:0;";
    const button = document.createElement("button");
    button.textContent = "Play again";
    button.style.cssText =
      "font-size:18px;padding:10px 28px;cursor:pointer;border:none;" +
      "background:#7ac74f;color:#14181c;font-weight:700;border-radius:4px;";
    button.addEventListener("click", () => this.restartHandler?.());
    this.root.append(title, this.scoreEl, button);
    stage.appendChild(this.root);
  }

  show(finalScore: number, best: number): void {
    this.scoreEl.textContent = `Score ${finalScore} — Best ${best}`;
    this.root.style.display = "flex";
  }

  hide(): void {
    this.root.style.display = "none";
  }

  onRestart(handler: () => void): void {
    this.restartHandler = handler;
  }
}
