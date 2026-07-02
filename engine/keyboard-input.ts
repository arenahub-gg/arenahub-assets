// Keyboard state tracker with per-key press callbacks. Generic: consumers map
// KeyboardEvent.code values to their own game actions.
export class KeyboardInput {
  private readonly down = new Set<string>();
  private readonly pressHandlers = new Map<string, () => void>();
  private readonly onKeyDown = (e: KeyboardEvent) => {
    if (!this.down.has(e.code)) {
      const handler = this.pressHandlers.get(e.code);
      if (handler) {
        e.preventDefault();
        handler();
      }
    }
    this.down.add(e.code);
  };
  private readonly onKeyUp = (e: KeyboardEvent) => {
    this.down.delete(e.code);
  };

  attach(target: Window = window): void {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
  }

  detach(target: Window = window): void {
    target.removeEventListener("keydown", this.onKeyDown);
    target.removeEventListener("keyup", this.onKeyUp);
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  /** Fire once per physical key press (no auto-repeat). */
  onPress(code: string, handler: () => void): void {
    this.pressHandlers.set(code, handler);
  }
}
