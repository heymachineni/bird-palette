import type { BirdSummary } from "@/types/bird";
import { colorDistance } from "@/lib/color/extract";
import { nameColor } from "@/lib/color/naming";
import { normalizeHex } from "@/lib/search";

export type HexColorStat = {
  hex: string;
  family: string;
  birdCount: number;
};

export type FamilyColorStat = {
  family: string;
  birdCount: number;
  sampleHex: string;
};

export type ColorIndex = {
  hexStats: HexColorStat[];
  familyStats: FamilyColorStat[];
};

/** Ten primary families shown in empty-state suggestions (fixed display order). */
export const MAIN_FAMILIES = [
  "orange",
  "blue",
  "pink",
  "purple",
  "black",
  "white",
  "brown",
  "red",
  "green",
  "yellow",
] as const;

export const MAIN_FAMILY_INITIAL_COUNT = 4;

export type MainFamily = (typeof MAIN_FAMILIES)[number];

/** Canonical swatch for each primary family — always used in family pills. */
export const MAIN_FAMILY_COLORS: Record<MainFamily, string> = {
  blue: "#2563EB",
  green: "#16A34A",
  black: "#171717",
  white: "#F5F5F5",
  brown: "#92400E",
  red: "#DC2626",
  pink: "#EC4899",
  yellow: "#EAB308",
  orange: "#EA580C",
  purple: "#9333EA",
};

export function formatFamilyLabel(family: string): string {
  return family.charAt(0).toUpperCase() + family.slice(1);
}

export function formatBirdCount(count: number): string {
  return count.toLocaleString();
}

/** Count birds per plumage hex and color family across the full index. */
export function buildColorIndex(birds: BirdSummary[]): ColorIndex {
  const hexBirds = new Map<string, Set<string>>();
  const familyBirds = new Map<string, Set<string>>();

  for (const bird of birds) {
    for (const family of bird.colorFamilies) {
      const set = familyBirds.get(family) ?? new Set<string>();
      set.add(bird.slug);
      familyBirds.set(family, set);
    }

    const hexes = new Set<string>();
    for (const swatch of bird.palette) {
      hexes.add(normalizeHex(swatch.hex));
    }
    for (const color of bird.colors ?? []) {
      hexes.add(normalizeHex(color.hex));
    }

    for (const hex of hexes) {
      const set = hexBirds.get(hex) ?? new Set<string>();
      set.add(bird.slug);
      hexBirds.set(hex, set);
    }
  }

  const hexStats: HexColorStat[] = [...hexBirds.entries()].map(([hex, slugs]) => ({
    hex: `#${hex}`.toUpperCase(),
    family: nameColor(`#${hex}`),
    birdCount: slugs.size,
  }));

  const familyStats: FamilyColorStat[] = [...familyBirds.entries()]
    .map(([family, slugs]) => ({
      family,
      birdCount: slugs.size,
      sampleHex:
        MAIN_FAMILY_COLORS[family as MainFamily] ??
        `#${[...hexBirds.keys()][0] ?? "888888"}`,
    }))
    .sort((a, b) => b.birdCount - a.birdCount);

  return { hexStats, familyStats };
}

/** Closest plumage hexes that actually appear on birds (same family first). */
export function suggestNearbyHexes(
  targetHex: string,
  hexStats: HexColorStat[],
  limit = 5,
): HexColorStat[] {
  const target = normalizeHex(targetHex);
  const targetFamily = nameColor(targetHex);

  const sameFamily = hexStats.filter(
    (stat) => stat.family === targetFamily && normalizeHex(stat.hex) !== target,
  );
  const pool =
    sameFamily.length >= limit
      ? sameFamily
      : hexStats.filter((stat) => normalizeHex(stat.hex) !== target);

  return pool
    .map((stat) => ({
      stat,
      distance: colorDistance(targetHex, stat.hex),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ stat }) => stat);
}

/** The ten primary families with canonical swatches and live bird counts. */
export function getMainFamilySuggestions(
  familyStats: FamilyColorStat[],
): FamilyColorStat[] {
  const countByFamily = new Map(
    familyStats.map((stat) => [stat.family, stat.birdCount]),
  );

  return MAIN_FAMILIES.map((family) => ({
    family,
    birdCount: countByFamily.get(family) ?? 0,
    sampleHex: MAIN_FAMILY_COLORS[family],
  }));
}
