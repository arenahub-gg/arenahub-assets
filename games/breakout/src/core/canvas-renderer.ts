// Canvas 2D renderer: creates the canvas inside a container, handles
// device-pixel-ratio scaling and resize, exposes drawing primitives in CSS
// pixel coordinates. Size is re-checked every clear() — cheap, and more
// reliable than ResizeObserver across embedded/headless browsers.
export class CanvasRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;

  constructor(private readonly container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    container.appendChild(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.ensureSize();
  }

  get width(): number {
    return this.cssWidth;
  }

  get height(): number {
    return this.cssHeight;
  }

  /** Sync the backing store with the container's current CSS size + DPR. */
  private ensureSize(): void {
    const cssWidth = this.container.clientWidth;
    const cssHeight = this.container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (cssWidth === this.cssWidth && cssHeight === this.cssHeight && dpr === this.dpr) {
      return;
    }
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    this.canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  clear(color: string): void {
    this.ensureSize();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
  }

  /** Draw an image centered at (cx, cy), optionally rotated (radians). */
  drawSprite(
    image: HTMLImageElement,
    cx: number,
    cy: number,
    width: number,
    height: number,
    rotation = 0,
  ): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(cx, cy);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  /** Draw a filled rectangle centered at (cx, cy). */
  drawRect(cx: number, cy: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(cx - width / 2, cy - height / 2, width, height);
  }

  drawGridLines(cols: number, rows: number, color: string): void {
    const { ctx } = this;
    const cellW = this.cssWidth / cols;
    const cellH = this.cssHeight / rows;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < cols; c++) {
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, this.cssHeight);
    }
    for (let r = 1; r < rows; r++) {
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(this.cssWidth, r * cellH);
    }
    ctx.stroke();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options: { font?: string; color?: string; align?: CanvasTextAlign } = {},
  ): void {
    const { ctx } = this;
    ctx.font = options.font ?? "16px system-ui, sans-serif";
    ctx.fillStyle = options.color ?? "#ffffff";
    ctx.textAlign = options.align ?? "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  destroy(): void {
    this.canvas.remove();
  }
}
