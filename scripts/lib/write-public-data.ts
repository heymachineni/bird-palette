import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { previewHexes } from "../../src/lib/color/plumage";
import { filterBirdsWithPhotos } from "../../src/lib/photos/placeholder";
import type { BirdIndexEntry, BirdSummary } from "../../src/types/bird";
import type { BirdRecord } from "../bird-record";

export const DEFAULT_PAGE_SIZE = 120;

const DATA_DIR = path.join(process.cwd(), "public", "data");
const PAGES_DIR = path.join(DATA_DIR, "pages");

export function buildSearchIndexEntries(birds: BirdRecord[]): BirdIndexEntry[] {
  const sorted = [...birds].sort((a, b) => a.name.localeCompare(b.name));
  const slugs = new Set(sorted.map((b) => b.slug));

  return sorted.map((b) => ({
    slug: b.slug,
    name: b.name,
    scientificName: b.scientificName,
    region: b.region,
    imageUrl: b.imageUrl,
    colorFamilies: b.colorFamilies,
    preview: previewHexes(b.colors),
    palette: b.colors.map((c) => ({ hex: c.hex, share: c.share })),
    colors: b.colors,
    similar: (b.similar ?? [])
      .map((s) => s.slug)
      .filter((slug) => slugs.has(slug)),
  }));
}

export function buildPageSummaries(birds: BirdRecord[]): BirdSummary[] {
  return buildSearchIndexEntries(birds).map((e) => ({
    id: e.slug,
    slug: e.slug,
    name: e.name,
    scientificName: e.scientificName,
    region: e.region ?? "",
    imageUrl: e.imageUrl ?? "",
    colorFamilies: e.colorFamilies,
    preview: e.preview?.length ? e.preview : ["#64748B"],
    palette: e.palette?.length ? e.palette : [{ hex: "#64748B", share: 100 }],
    colors: e.colors ?? [],
    similar: e.similar ?? [],
  }));
}

export async function writePublicBirdData(
  birds: BirdRecord[],
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<{ total: number; pageCount: number }> {
  const kept = filterBirdsWithPhotos(birds);
  const sorted = [...kept].sort((a, b) => a.name.localeCompare(b.name));
  const summaries = buildPageSummaries(sorted);
  const searchIndex = buildSearchIndexEntries(sorted);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  await mkdir(PAGES_DIR, { recursive: true });

  for (let p = 0; p < pageCount; p++) {
    const chunk = summaries.slice(p * pageSize, (p + 1) * pageSize);
    await writeFile(
      path.join(PAGES_DIR, `page-${p + 1}.json`),
      JSON.stringify(chunk),
    );
  }

  try {
    for (const name of await readdir(PAGES_DIR)) {
      const match = /^page-(\d+)\.json$/.exec(name);
      if (match && Number(match[1]) > pageCount) {
        await unlink(path.join(PAGES_DIR, name));
      }
    }
  } catch {
    /* ignore cleanup errors */
  }

  const manifest = {
    version: 1 as const,
    total: sorted.length,
    pageSize,
    pageCount,
    generatedAt: new Date().toISOString(),
  };

  await writeFile(
    path.join(DATA_DIR, "manifest.json"),
    JSON.stringify(manifest),
  );
  await writeFile(
    path.join(DATA_DIR, "search-index.json"),
    JSON.stringify(searchIndex),
  );
  // Legacy single-file index — kept in sync for tools that still read it.
  await writeFile(
    path.join(DATA_DIR, "index.json"),
    JSON.stringify(searchIndex),
  );

  return { total: sorted.length, pageCount };
}
