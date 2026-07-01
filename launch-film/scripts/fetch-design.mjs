/**
 * Curated color-craft collage assets. Re-run: node scripts/fetch-design.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public/collage/design");
try {
  rmSync(outDir, { recursive: true, force: true });
} catch {}
mkdirSync(outDir, { recursive: true });

const API = "https://commons.wikimedia.org/w/api.php";
const UA =
  "BirdPaletteLaunchFilm/1.0 (https://birdpalette.web.app; launch@birdpalette) Node";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_BYTES = 2_200_000;

const CURATED_FILES = [
  "Newton's colour circle.png",
  "Color Pigment.png",
  "Moses Harris, The Natural System of Colours.jpg",
  "Paint palette.png",
  "Color wheel palette.png",
  "A palette with a spatula and paint brushes.jpg",
];

const FALLBACK_QUERIES = [
  ["textile swatch sample book 1784", 1],
  ["blue pigment powder sample jars museum", 1],
  ["Gazette du Bon Ton Poiret 1920", 1],
  ["color solid comparison hsl hsv rgb", 1],
  ["artists materials catalogue painting knives", 1],
  ["marbled paper book cover vintage", 1],
  ["azurite mineral blue pigment", 1],
  ["watercolor paint box antique", 1],
  ["oil paint tubes palette colorful", 1],
  ["chromolithograph color printing plate", 1],
];

function reject(title) {
  return /princess|portrait miniature|animal coloration|warning coloration|Luise,|optimal color solid.*ani|person sitting|cake|cattle|calculator/i.test(
    title,
  );
}

function key(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 48);
}

async function resolveBatch(titles) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: titles.map((t) => `File:${t}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|mime|thumburl",
    iiurlwidth: "1100",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`resolve ${res.status}`);
  const json = await res.json();
  const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
  const out = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || "";
    if (!/jpe?g|png$/i.test(mime)) continue;
    const title = (page.title || "").replace(/^File:/, "");
    if (reject(title)) continue;
    out.push({ title, url: info.thumburl || info.url });
  }
  return out;
}

async function search(query, limit) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|mime|thumburl",
    iiurlwidth: "1100",
  });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`search ${res.status} for ${query}`);
  const json = await res.json();
  const pages = json?.query?.pages ? Object.values(json.query.pages) : [];
  return pages
    .map((p) => ({
      title: (p.title || "").replace(/^File:/, ""),
      url: p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url,
      mime: p.imageinfo?.[0]?.mime,
    }))
    .filter((i) => i.url && /jpe?g|png$/i.test(i.mime || i.url) && !reject(i.title));
}

async function download(url, file, attempt = 0) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: "https://commons.wikimedia.org/" },
  });
  if (res.status === 429 && attempt < 6) {
    await sleep(3000 * (attempt + 1));
    return download(url, file, attempt + 1);
  }
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error(`too large ${buf.length}`);
  writeFileSync(file, buf);
  return buf.length;
}

async function main() {
  const items = [];
  const seen = new Set();

  const add = (item) => {
    const k = key(item.title);
    if (seen.has(k)) return;
    seen.add(k);
    items.push(item);
  };

  const curated = await resolveBatch(CURATED_FILES);
  curated.forEach(add);
  await sleep(2500);

  for (const [q, n] of FALLBACK_QUERIES) {
    if (items.length >= 16) break;
    try {
      const found = await search(q, n);
      console.log(`"${q}" -> ${found.length}`);
      found.forEach(add);
    } catch (e) {
      console.warn(`  ${q}: ${e.message}`);
    }
    await sleep(2500);
  }

  console.log(`Resolved ${items.length} unique images.`);

  let n = 0;
  for (const item of items.slice(0, 16)) {
    const name = `design-${String(n + 1).padStart(2, "0")}.jpg`;
    try {
      const bytes = await download(item.url, resolve(outDir, name));
      console.log(`  ${name}  ${item.title.slice(0, 56)}  ${(bytes / 1024).toFixed(0)}kb`);
      n++;
    } catch (e) {
      console.warn(`  skip: ${e.message}`);
    }
    await sleep(1400);
  }
  console.log(`Downloaded ${n} images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
