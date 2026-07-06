/**
 * Merge scripts/custom-birds.ts into dataset.json (extract palettes, write public/data).
 * Skips entries whose image file is missing.
 */
import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  buildThemeFromPlumage,
  colorFamiliesFrom,
  passesWcagAA,
} from "../src/lib/color/plumage";
import { rankSimilarBirds } from "../src/lib/color/similarity";
import { filterBirdsWithPhotos } from "../src/lib/photos/placeholder";
import { extractColorsFromPhoto } from "./lib/photo-cutout";
import { writePublicBirdData } from "./lib/write-public-data";
import { CUSTOM_BIRDS } from "./custom-birds";
import type { BirdRecord } from "./bird-record";

const DATASET = path.join(process.cwd(), "prisma", "seed", "dataset.json");

/** Shown first in Related palettes for curated research birds. */
const PINNED_SIMILAR: Record<string, string[]> = {
  "ardea-cinerea-juvenile": [
    "ardea-cinerea",
    "ardea-purpurea-juvenile",
    "ardea-purpurea",
  ],
  "ardea-purpurea-juvenile": [
    "ardea-purpurea",
    "ardea-cinerea-juvenile",
    "ardea-cinerea",
  ],
  "ardea-cinerea-purpurea-hybrid": [
    "ardea-cinerea-juvenile",
    "ardea-purpurea-juvenile",
    "ardea-cinerea",
    "ardea-purpurea",
  ],
};

async function imageExists(publicPath: string): Promise<boolean> {
  const file = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function similarForBird(target: BirdRecord, all: BirdRecord[]) {
  const palette = target.colors.map((c) => c.hex);
  const pool = all
    .filter((b) => b.slug !== target.slug)
    .map((b) => ({ id: b.slug, palette: b.colors.map((c) => c.hex) }));

  const ranked = rankSimilarBirds({ id: target.slug, palette }, pool, 8).map(
    (r) => r.birdId,
  );

  const pinned = PINNED_SIMILAR[target.slug] ?? [];
  const slugs = [...pinned, ...ranked.filter((s) => !pinned.includes(s))]
    .filter((slug) => slug !== target.slug)
    .slice(0, 4);

  return slugs.map((slug, i) => ({ slug, rank: i + 1 }));
}

async function main() {
  const pending = [];
  for (const entry of CUSTOM_BIRDS) {
    if (await imageExists(entry.imageUrl)) {
      pending.push(entry);
    } else {
      console.log(`  ⊘ skip ${entry.slug} — missing ${entry.imageUrl}`);
    }
  }

  if (pending.length === 0) {
    console.log("No custom bird images found.");
    return;
  }

  const dataset = JSON.parse(await readFile(DATASET, "utf-8")) as {
    version: number;
    source: string;
    generatedAt: string;
    birds: BirdRecord[];
  };

  const bySlug = new Map(dataset.birds.map((b) => [b.slug, b]));
  const added: BirdRecord[] = [];

  for (const entry of pending) {
    console.log(`\n→ ${entry.name} (${entry.slug})`);
    const colors = await extractColorsFromPhoto(entry.slug, entry.imageUrl);
    if (colors.length === 0) {
      console.log(`  ✗ no colors extracted`);
      continue;
    }

    const theme = buildThemeFromPlumage(colors);
    const record: BirdRecord = {
      slug: entry.slug,
      name: entry.name,
      scientificName: entry.scientificName,
      region: entry.region,
      imageUrl: entry.imageUrl,
      colors,
      colorFamilies: colorFamiliesFrom(colors),
      theme,
      wcagAA: passesWcagAA(theme),
      updatedAt: new Date().toISOString(),
    };
    bySlug.set(entry.slug, record);
    added.push(record);
    console.log(`  ✓ ${colors.length} colors`);
  }

  if (added.length === 0) {
    console.log("\nNothing to merge.");
    return;
  }

  let birds = filterBirdsWithPhotos([...bySlug.values()]);
  const slugs = new Set(birds.map((b) => b.slug));

  for (const record of added) {
    record.similar = similarForBird(record, birds).filter((s) =>
      slugs.has(s.slug),
    );
  }

  birds = birds.map((b) => (bySlug.get(b.slug) ?? b) as BirdRecord);
  birds.sort((a, b) => a.name.localeCompare(b.name));

  dataset.birds = birds;
  dataset.generatedAt = new Date().toISOString();

  await mkdir(path.dirname(DATASET), { recursive: true });
  await writeFile(DATASET, JSON.stringify(dataset, null, 2));

  const { total, pageCount } = await writePublicBirdData(birds);

  console.log(
    `\n✓ Merged ${added.length} custom bird(s) — ${total} total, ${pageCount} pages`,
  );
  for (const b of added) {
    console.log(`  • ${b.name} → /birds/${b.slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
