/**
 * Recompute HBW plumage colors only (fast — keeps photos + similar birds).
 * Run: npm run refresh-colors:hbw
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureHbwExtracted } from "./hbw/paths";
import {
  loadHbwColorGroups,
  loadHbwIllustrations,
  pickSpeciesIllustrations,
  dedupeByCommonName,
} from "./hbw/parse";
import { plumageFromHbwProportions } from "../src/lib/color/hbw-plumage";
import {
  buildThemeFromPlumage,
  colorFamiliesFrom,
  passesWcagAA,
} from "../src/lib/color/plumage";
import { writePublicBirdData } from "./lib/write-public-data";
import type { BirdRecord } from "./bird-record";

const DATASET = path.join(process.cwd(), "prisma", "seed", "dataset.json");

async function main() {
  const { proportionsPath, colorGroupsPath } = await ensureHbwExtracted();
  const groups = await loadHbwColorGroups(colorGroupsPath);
  const illustrations = dedupeByCommonName(
    pickSpeciesIllustrations(await loadHbwIllustrations(proportionsPath)),
  ).list;

  const byScience = new Map(
    illustrations.map((ill) => [ill.scientificName.toLowerCase(), ill]),
  );

  const { birds } = JSON.parse(await readFile(DATASET, "utf-8")) as {
    birds: BirdRecord[];
  };

  console.log(`\nRefreshing HBW colors for ${birds.length} birds…\n`);

  let updated = 0;
  let missing = 0;

  for (const bird of birds) {
    const ill = byScience.get(bird.scientificName.toLowerCase());
    if (!ill) {
      missing++;
      continue;
    }

    const colors = plumageFromHbwProportions(ill.proportions, groups);
    if (colors.length === 0) continue;

    bird.colors = colors;
    bird.colorFamilies = colorFamiliesFrom(colors);
    bird.theme = buildThemeFromPlumage(colors);
    bird.wcagAA = passesWcagAA(bird.theme);
    bird.updatedAt = new Date().toISOString();
    updated++;
  }

  await writeFile(
    DATASET,
    JSON.stringify(
      {
        version: 2,
        source: "hbw-dryad",
        generatedAt: new Date().toISOString(),
        birds,
      },
      null,
      2,
    ),
  );
  await writePublicBirdData(birds);

  console.log(`✓ Updated colors for ${updated} birds (${missing} not in HBW index)\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
