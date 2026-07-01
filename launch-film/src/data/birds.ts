import { HERO_BIRDS, type BirdPalette } from "../theme/colors";

export { HERO_BIRDS };
export type { BirdPalette };

/**
 * Filenames for the reveal grid and ending mosaic. Drop matching files into
 * public/grid/ (grid-01.png ... grid-24.png). Missing files render a tasteful
 * colored placeholder so the film previews end-to-end before assets arrive.
 */
export const GRID_IMAGES: string[] = Array.from(
  { length: 24 },
  (_, i) => `grid/grid-${String(i + 1).padStart(2, "0")}.png`,
);

/** Deterministic placeholder tints (used when a grid image is absent). */
export const GRID_TINTS: string[] = [
  "#1CA9C9",
  "#F45D31",
  "#FEDD07",
  "#F46BA0",
  "#0439C2",
  "#90A60B",
  "#FD9557",
  "#0E7C9B",
  "#E03A6D",
  "#778A86",
  "#AA8602",
  "#2C3C31",
];
