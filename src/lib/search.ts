import type { BirdSummary } from "@/types/bird";
import { COLOR_FAMILIES, nameColor, normalizeColorQuery } from "@/lib/color/naming";

const FAMILY_SET = new Set<string>(COLOR_FAMILIES);

function isColorFamilyToken(token: string): boolean {
  return FAMILY_SET.has(normalizeColorQuery(token));
}

function queryTokens(query: string): string[] {
  return query.trim().toLowerCase().split(/[\s,+]+/).filter(Boolean);
}

/** Normalize hex for comparison (# optional, 3- or 6-digit). */
export function normalizeHex(hex: string): string {
  let clean = hex.trim().replace(/^#/, "").toLowerCase();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return clean.slice(0, 6).padEnd(6, "0");
}

/** True when the query is a hex color (#RGB, #RRGGBB, or RRGGBB). */
export function isHexQuery(query: string): boolean {
  const q = query.trim();
  return (
    /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(q) ||
    /^[0-9a-fA-F]{6}$/.test(q)
  );
}

export function birdHasExactHex(bird: BirdSummary, hex: string): boolean {
  const target = normalizeHex(hex);
  const hexes = [
    ...bird.palette.map((c) => c.hex),
    ...(bird.colors?.map((c) => c.hex) ?? []),
  ];
  return hexes.some((h) => normalizeHex(h) === target);
}

/** Filter birds whose plumage includes the exact picked hex. */
export function filterBirdsByHex(
  birds: BirdSummary[],
  hex: string | null,
): BirdSummary[] {
  if (!hex) return birds;
  return birds.filter((bird) => birdHasExactHex(bird, hex));
}

/** Total plumage share for a color family (e.g. "red", "orange"). */
export function birdColorFamilyShare(bird: BirdSummary, family: string): number {
  const target = normalizeColorQuery(family);
  let share = 0;
  for (const c of bird.colors ?? []) {
    if (normalizeColorQuery(c.family) === target) share += c.share;
  }
  if (share > 0) return share;
  for (const p of bird.palette) {
    if (normalizeColorQuery(nameColor(p.hex)) === target) share += p.share;
  }
  return share;
}

/** Total plumage share for an exact hex swatch. */
export function birdHexShare(bird: BirdSummary, hex: string): number {
  const target = normalizeHex(hex);
  let share = 0;
  for (const c of bird.colors ?? []) {
    if (normalizeHex(c.hex) === target) share += c.share;
  }
  for (const p of bird.palette) {
    if (normalizeHex(p.hex) === target) share += p.share;
  }
  return share;
}

/**
 * When filtering by color, rank birds by how much of that color they wear —
 * highest share first, least last. Name-only queries keep their input order.
 */
export function sortBirdsByColorRelevance(
  birds: BirdSummary[],
  query: string,
  pickedColor: string | null,
): BirdSummary[] {
  const scoreOf = (bird: BirdSummary): number | null => {
    if (pickedColor) return birdHexShare(bird, pickedColor);

    const tokens = queryTokens(query);
    const hexTokens = tokens.filter(isHexQuery);
    if (hexTokens.length > 0) {
      return hexTokens.reduce((sum, t) => sum + birdHexShare(bird, t), 0);
    }

    const colorTokens = tokens.filter(isColorFamilyToken).map(normalizeColorQuery);
    if (colorTokens.length > 0) {
      return colorTokens.reduce((sum, t) => sum + birdColorFamilyShare(bird, t), 0);
    }

    return null;
  };

  const scored = birds.map((bird, index) => ({
    bird,
    index,
    score: scoreOf(bird),
  }));

  if (scored.every((entry) => entry.score === null)) return birds;

  return scored
    .sort((a, b) => {
      const diff = (b.score ?? 0) - (a.score ?? 0);
      return diff !== 0 ? diff : a.index - b.index;
    })
    .map((entry) => entry.bird);
}

function matchesToken(bird: BirdSummary, token: string): boolean {
  if (isHexQuery(token)) {
    return birdHasExactHex(bird, token);
  }

  const color = normalizeColorQuery(token);
  if (bird.name.toLowerCase().includes(token)) return true;
  if (bird.scientificName.toLowerCase().includes(token)) return true;
  return bird.colorFamilies.some(
    (family) =>
      family === color ||
      family.includes(color) ||
      color.includes(family) ||
      family.includes(token),
  );
}

/**
 * Filter birds by name, scientific name, or plumage color family.
 *
 * Multiple words combine (AND), so "green red yellow" finds birds wearing all
 * three, and "blue jay" finds blue birds named jay.
 */
export function filterBirds(
  birds: BirdSummary[],
  query: string,
): BirdSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return birds;

  const tokens = q.split(/[\s,+]+/).filter(Boolean);
  if (tokens.length === 0) return birds;

  return birds.filter((bird) =>
    tokens.every((token) => matchesToken(bird, token)),
  );
}
