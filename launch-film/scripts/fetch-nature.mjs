/**
 * Downloads public-domain nature illustrations from Wikimedia Commons into
 * public/collage/nature/. Curated toward recognizable, colorful nature art:
 * birds, butterflies/insects, flowers and botanical plates from PD masters
 * (Audubon, Redoute, Merian, Haeckel).
 *
 * Run:  node scripts/fetch-nature.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public/collage/nature");
try {
  rmSync(outDir, { recursive: true, force: true });
} catch {}
mkdirSync(outDir, { recursive: true });

const API = "https://commons.wikimedia.org/w/api.php";
const UA =
  "BirdPaletteLaunchFilm/1.0 (https://birdpalette.web.app; launch@birdpalette) Node";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(query, limit) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|mime",
    iiurlwidth: "1100",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search ${res.status} for ${query}`);
  const json = await res.json();
  const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && /jpe?g$/i.test(i.mime || i.url || ""))
    .map((i) => i.thumburl || i.url);
}

async function download(url, file, attempt = 0) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://commons.wikimedia.org/" } });
  if (res.status === 429 && attempt < 5) {
    await sleep(2000 * (attempt + 1));
    return download(url, file, attempt + 1);
  }
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, buf);
  return buf.length;
}

const QUERIES = [
  ["Audubon Birds of America plate", 4],
  ["Haeckel Trochilidae hummingbird", 2],
  ["Pierre-Joseph Redoute flower lithograph", 4],
  ["Maria Sibylla Merian insect plate", 3],
  ["Haeckel Lepidoptera", 1],
  ["butterfly chromolithograph plate 19th century", 3],
  ["Haeckel Orchidae orchid", 1],
  ["botanical illustration flower color plate", 3],
];

async function main() {
  const urls = [];
  for (const [q, n] of QUERIES) {
    try {
      const found = await search(q, n);
      console.log(`search "${q}" -> ${found.length}`);
      urls.push(...found);
    } catch (e) {
      console.warn(`  ${q}: ${e.message}`);
    }
    await sleep(600);
  }

  const unique = [...new Set(urls)].slice(0, 20);
  console.log(`Resolved ${unique.length} unique images.`);

  let n = 0;
  for (const url of unique) {
    const name = `nature-${String(n + 1).padStart(2, "0")}.jpg`;
    try {
      const bytes = await download(url, resolve(outDir, name));
      console.log(`  ${name}  ${(bytes / 1024).toFixed(0)}kb`);
      n++;
    } catch (e) {
      console.warn(`  skip: ${e.message}`);
    }
    await sleep(1100);
  }
  console.log(`Downloaded ${n} images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
