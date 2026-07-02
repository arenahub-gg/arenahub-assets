// Downloads and extracts every Kenney pack listed in assets/packs-manifest.json.
// Binary payloads are gitignored — this script rebuilds assets/ on a fresh clone.
// The current zip URL is scraped from each pack page at runtime (Kenney embeds a
// content hash in download URLs, so pinning them in the manifest would rot).
//
// Usage:
//   node scripts/download-asset-packs.mjs              # all missing packs
//   node scripts/download-asset-packs.mjs --only tiny-farm
//   node scripts/download-asset-packs.mjs --concurrency 6
import AdmZip from "adm-zip";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const assetsDir = join(repoRoot, "assets");
const manifestPath = join(assetsDir, "packs-manifest.json");

const args = process.argv.slice(2);
const onlySlug = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const concurrency = args.includes("--concurrency")
  ? Number(args[args.indexOf("--concurrency") + 1]) || 4
  : 4;

const JUNK_FILES = /(^|[\\/])(desktop\.ini|thumbs\.db|.*\.url)$/i;
const TYPE_BY_EXT = {
  ".png": "sprites", ".jpg": "sprites", ".gif": "sprites", ".svg": "sprites",
  ".ogg": "audio", ".mp3": "audio", ".wav": "audio",
  ".ttf": "fonts", ".otf": "fonts",
  ".gltf": "models", ".glb": "models", ".obj": "models", ".fbx": "models", ".mtl": "models",
};

async function dirHasPayload(dir) {
  try {
    const entries = await readdir(dir);
    return entries.some((e) => e !== "pack.json");
  } catch {
    return false;
  }
}

async function walkExtensions(dir, found = new Set()) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkExtensions(full, found);
    else found.add(extname(entry.name).toLowerCase());
  }
  return found;
}

async function removeJunk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await removeJunk(full);
    else if (JUNK_FILES.test(entry.name)) await rm(full, { force: true });
  }
}

async function importPack({ slug, category }) {
  const dir = join(assetsDir, `kenney-${slug}`);
  if (await dirHasPayload(dir)) return { slug, status: "skipped (exists)" };

  const pageUrl = `https://kenney.nl/assets/${slug}`;
  const html = await (await fetch(pageUrl)).text();
  const zipMatch = html.match(/https:\/\/kenney\.nl\/media\/pages\/assets\/[^'"]+\.zip/);
  if (!zipMatch) throw new Error(`no zip url found on ${pageUrl}`);
  const nameMatch = html.match(/<title>\s*(.+?)\s*(?:&middot;|·|\||<)/);
  const name = nameMatch?.[1]?.trim() ?? slug;

  const zipRes = await fetch(zipMatch[0]);
  if (!zipRes.ok) throw new Error(`download failed ${zipRes.status}: ${zipMatch[0]}`);
  const zipPath = join(tmpdir(), `kenney-${slug}.zip`);
  await writeFile(zipPath, Buffer.from(await zipRes.arrayBuffer()));

  await mkdir(dir, { recursive: true });
  new AdmZip(zipPath).extractAllTo(dir, true);
  await rm(zipPath, { force: true });
  await removeJunk(dir);

  // pack.json is committed to git; payload is not. Style left "uncurated" —
  // set a real style tag when a game first uses the pack.
  const packJsonPath = join(dir, "pack.json");
  try {
    await readFile(packJsonPath);
  } catch {
    const exts = await walkExtensions(dir);
    const types = [...new Set([...exts].map((e) => TYPE_BY_EXT[e]).filter(Boolean))].sort();
    await writeFile(
      packJsonPath,
      JSON.stringify(
        {
          id: `kenney-${slug}`,
          name,
          source: pageUrl,
          license: "CC0-1.0",
          style: "uncurated",
          tags: [category.toLowerCase()],
          types,
          importedAt: new Date().toISOString().slice(0, 10),
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
  }
  return { slug, status: "imported" };
}

async function main() {
  // strip a UTF-8 BOM if present (Windows editors/PowerShell add one)
  let manifest = JSON.parse((await readFile(manifestPath, "utf8")).replace(/^﻿/, ""));
  if (onlySlug) manifest = manifest.filter((p) => p.slug === onlySlug);
  if (manifest.length === 0) {
    console.error(onlySlug ? `slug not in manifest: ${onlySlug}` : "empty manifest");
    process.exit(1);
  }

  const queue = [...manifest];
  const failures = [];
  let done = 0;

  async function worker() {
    for (;;) {
      const pack = queue.shift();
      if (!pack) return;
      const label = `[${++done}/${manifest.length}] kenney-${pack.slug}`;
      try {
        // one retry on transient network errors
        let result;
        try {
          result = await importPack(pack);
        } catch {
          result = await importPack(pack);
        }
        console.log(`${label} ${result.status}`);
      } catch (err) {
        failures.push(pack.slug);
        console.error(`${label} FAILED: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (failures.length) {
    console.error(`\n${failures.length} pack(s) failed: ${failures.join(", ")}`);
    console.error("re-run the script to retry failures (existing packs are skipped)");
    process.exit(1);
  }
  console.log(`\nall ${manifest.length} packs present — run "npm run catalog" next`);
}

await main();
