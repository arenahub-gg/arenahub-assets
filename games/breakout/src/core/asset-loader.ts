// Manifest-based asset preloader. Keys are game-chosen names, values are URLs
// (relative to the game's public/ root).
export async function loadImages<K extends string>(
  manifest: Record<K, string>,
): Promise<Record<K, HTMLImageElement>> {
  const entries = Object.entries<string>(manifest) as [K, string][];
  const loaded = await Promise.all(
    entries.map(
      ([key, url]) =>
        new Promise<[K, HTMLImageElement]>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([key, img]);
          img.onerror = () => reject(new Error(`failed to load image: ${url}`));
          img.src = url;
        }),
    ),
  );
  return Object.fromEntries(loaded) as Record<K, HTMLImageElement>;
}
