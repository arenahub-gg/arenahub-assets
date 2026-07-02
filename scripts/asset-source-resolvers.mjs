// Per-source resolvers for the asset downloader. This is the extension point:
// to add a new asset source, add a resolver here and tag manifest entries with
// its key via a "source" field (entries with no "source" default to "kenney").
//
// A resolver receives a manifest entry ({ slug, category, ... }) and returns:
//   {
//     zipUrl:   string   // direct download URL of the pack archive (.zip)
//     name:     string   // human-readable pack name for pack.json
//     license:  string   // SPDX-ish id, e.g. "CC0-1.0", "CC-BY-3.0"
//     homepage: string   // canonical pack/source page for provenance
//   }
//
// Keep resolvers pure I/O-and-parse: no filesystem writes, no extraction — the
// downloader owns that so every source shares the same extract/cleanup/pack.json
// pipeline.

export const DEFAULT_SOURCE = "kenney";

export const resolvers = {
  // kenney.nl embeds a content hash in download URLs, so the zip URL is scraped
  // from the pack page at runtime rather than pinned in the manifest.
  async kenney({ slug }) {
    const homepage = `https://kenney.nl/assets/${slug}`;
    const html = await (await fetch(homepage)).text();
    const zipMatch = html.match(
      /https:\/\/kenney\.nl\/media\/pages\/assets\/[^'"]+\.zip/,
    );
    if (!zipMatch) throw new Error(`no zip url found on ${homepage}`);
    const nameMatch = html.match(/<title>\s*(.+?)\s*(?:&middot;|·|\||<)/);
    return {
      zipUrl: zipMatch[0],
      name: nameMatch?.[1]?.trim() ?? slug,
      license: "CC0-1.0",
      homepage,
    };
  },

  // --- add future sources below, e.g.:
  //
  // async gameIcons({ slug }) {
  //   // game-icons.net ships one bulk archive (CC-BY-3.0) — attribution
  //   // required in any shipped game. See docs/conventions.md licensing.
  //   return {
  //     zipUrl: "https://game-icons.net/archives/ffffff/transparent/game-icons.net.svg.zip",
  //     name: "Game Icons (game-icons.net)",
  //     license: "CC-BY-3.0",
  //     homepage: "https://game-icons.net/",
  //   };
  // },
};
