// Swipe detector for touch play. Reports 4-way swipe direction.
export type SwipeDirection = "up" | "down" | "left" | "right";

const MIN_SWIPE_PX = 24;

export class TouchInput {
  private startX = 0;
  private startY = 0;
  private tracking = false;
  private readonly onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    this.tracking = true;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  };
  private readonly onTouchMove = (e: TouchEvent) => {
    if (!this.tracking) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    if (Math.abs(dx) < MIN_SWIPE_PX && Math.abs(dy) < MIN_SWIPE_PX) return;
    this.tracking = false;
    const dir: SwipeDirection =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    this.handler?.(dir);
  };
  private readonly onTouchEnd = () => {
    this.tracking = false;
  };
  private handler: ((dir: SwipeDirection) => void) | null = null;

  constructor(private readonly element: HTMLElement) {}

  attach(): void {
    this.element.addEventListener("touchstart", this.onTouchStart, { passive: true });
    this.element.addEventListener("touchmove", this.onTouchMove, { passive: true });
    this.element.addEventListener("touchend", this.onTouchEnd, { passive: true });
  }

  detach(): void {
    this.element.removeEventListener("touchstart", this.onTouchStart);
    this.element.removeEventListener("touchmove", this.onTouchMove);
    this.element.removeEventListener("touchend", this.onTouchEnd);
  }

  onSwipe(handler: (dir: SwipeDirection) => void): void {
    this.handler = handler;
  }
}
