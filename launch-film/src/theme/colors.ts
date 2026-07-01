/**
 * Color system for the Bird Palette launch film.
 * Stage colors are intentionally near-black and warm-neutral so vibrant
 * bird palettes (sourced from real product data) carry the contrast.
 */

export const stage = {
  base: "#060607",
  panel: "#0B0B0D",
  panelSoft: "#101013",
  hairline: "rgba(244, 241, 236, 0.08)",
  foreground: "#F4F1EC",
  muted: "#8A8780",
  faint: "rgba(244, 241, 236, 0.45)",
} as const;

/** Per-brief hero accent for the HEX moment. */
export const HEX_ACCENT = "#FF6A00";

/**
 * Light "museum / editorial" theme matching the product chrome
 * (globals.css: --background 40 33% 98%, --foreground 24 14% 12%).
 */
export const paper = {
  base: "#FBFAF7",
  panel: "#F3F1EC",
  ink: "#1C1A17",
  inkSoft: "#4A453E",
  inkFaint: "#8A8378",
  hairline: "rgba(28, 26, 23, 0.10)",
} as const;

export type BirdPalette = {
  slug: string;
  name: string;
  /** Image filename expected in public/birds/. */
  image: string;
  /** Hero, supporting, accent, deep. Real data where available. */
  palette: [string, string, string, string];
};

/**
 * Hero birds. Palettes for Peafowl, Macaw, Goldfinch are taken verbatim from
 * the product dataset (public/data/v2/birds.json). Kingfisher and Flamingo are
 * not in the dataset; tasteful palettes are provided and can be swapped once
 * the cutouts are supplied.
 */
export const HERO_BIRDS: BirdPalette[] = [
  {
    slug: "peacock",
    name: "Indian Peafowl",
    image: "birds/peacock.png",
    palette: ["#0439C2", "#021965", "#2C3C31", "#778A86"],
  },
  {
    slug: "macaw",
    name: "Scarlet Macaw",
    image: "birds/macaw.png",
    palette: ["#F45D31", "#FD9557", "#423A29", "#4D190F"],
  },
  {
    slug: "kingfisher",
    name: "Common Kingfisher",
    image: "birds/kingfisher.png",
    palette: ["#1CA9C9", "#0E7C9B", "#E8852A", "#10343F"],
  },
  {
    slug: "goldfinch",
    name: "American Goldfinch",
    image: "birds/goldfinch.png",
    palette: ["#FEDD07", "#AA8602", "#7A6746", "#070401"],
  },
  {
    slug: "flamingo",
    name: "American Flamingo",
    image: "birds/flamingo.png",
    palette: ["#F46BA0", "#FB9DC0", "#E03A6D", "#5A1730"],
  },
];

export const bySlug = (slug: string): BirdPalette =>
  HERO_BIRDS.find((b) => b.slug === slug) ?? HERO_BIRDS[0];

/** Convert #RRGGBB to an rgba() string with the given alpha. */
export const withAlpha = (hex: string, alpha: number): string => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
