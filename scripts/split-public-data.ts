/**
 * Regenerate manifest, paginated pages, and search index from dataset.json.
 * Run: tsx scripts/split-public-data.ts
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { writePublicBirdData } from "./lib/write-public-data";
import type { BirdRecord } from "./bird-record";

const DATASET = path.join(process.cwd(), "prisma", "seed", "dataset.json");

async function main() {
  const { birds } = JSON.parse(await readFile(DATASET, "utf-8")) as {
    birds: BirdRecord[];
  };
  const { total, pageCount } = await writePublicBirdData(birds);
  console.log(`\n✓ Wrote ${total} birds across ${pageCount} pages.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
