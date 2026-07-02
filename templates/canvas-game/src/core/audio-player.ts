// Simple SFX player. Clones the base element per play so overlapping sounds
// don't cut each other off. Autoplay policies: first play must follow a user
// gesture; failures are swallowed (sound is non-critical).
export class AudioPlayer {
  private readonly sounds = new Map<string, HTMLAudioElement>();
  private muted = false;

  register(name: string, url: string): void {
    const audio = new Audio(url);
    audio.preload = "auto";
    this.sounds.set(name, audio);
  }

  play(name: string): void {
    if (this.muted) return;
    const base = this.sounds.get(name);
    if (!base) return;
    const instance = base.cloneNode(true) as HTMLAudioElement;
    void instance.play().catch(() => {
      /* autoplay blocked before first user gesture — ignore */
    });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}
