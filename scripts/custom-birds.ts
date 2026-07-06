/** Hand-curated birds merged into dataset.json (not overwritten by BirdNET rebuilds). */
export type CustomBirdInput = {
  slug: string;
  name: string;
  scientificName: string;
  region: string;
  /** Path under public/, e.g. /birds/ardea-cinerea-juvenile.webp */
  imageUrl: string;
};

export const CUSTOM_BIRDS: CustomBirdInput[] = [
  {
    slug: "ardea-cinerea-juvenile",
    name: "Gray Heron (juvenile)",
    scientificName: "Ardea cinerea",
    region: "Herons, Egrets, and Bitterns",
    imageUrl: "/birds/ardea-cinerea-juvenile.webp",
  },
  {
    slug: "ardea-purpurea-juvenile",
    name: "Purple Heron (juvenile)",
    scientificName: "Ardea purpurea",
    region: "Herons, Egrets, and Bitterns",
    imageUrl: "/birds/ardea-purpurea-juvenile.webp",
  },
  {
    slug: "ardea-cinerea-purpurea-hybrid",
    name: "Gray × Purple Heron (hybrid)",
    scientificName: "Ardea cinerea × purpurea",
    region: "Herons, Egrets, and Bitterns",
    imageUrl: "/birds/ardea-cinerea-purpurea-hybrid.webp",
  },
];
