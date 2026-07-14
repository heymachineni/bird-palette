/**
 * Next.js generateSitemaps() emits /sitemap/0.xml … but not a root index
 * under static export. Write /sitemap.xml as a sitemapindex for Search Console.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://birdpalette.web.app";
const outDir = path.join(process.cwd(), "out");
const shardDir = path.join(outDir, "sitemap");

const files = (await readdir(shardDir))
  .filter((name) => /^\d+\.xml$/.test(name))
  .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));

if (files.length === 0) {
  console.error("No sitemap shards found in out/sitemap/");
  process.exit(1);
}

const body = files
  .map(
    (name) => `  <sitemap>
    <loc>${SITE_URL}/sitemap/${name}</loc>
  </sitemap>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`;

await writeFile(path.join(outDir, "sitemap.xml"), xml);
console.log(`→ Wrote sitemap index (${files.length} shards)`);
