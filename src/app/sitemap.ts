import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

type SearchIndexEntry = { slug: string };

function loadBirdSlugs(): string[] {
  const indexPath = path.join(process.cwd(), "public/data/search-index.json");
  if (!existsSync(indexPath)) return [];

  const entries = JSON.parse(readFileSync(indexPath, "utf8")) as SearchIndexEntry[];
  return entries.map((entry) => entry.slug).filter(Boolean);
}

/** Featured birds surfaced with slightly higher priority in the sitemap. */
const FEATURED_SLUGS = new Set([
  "ardea-cinerea",
  "ardea-purpurea",
  "ardea-cinerea-juvenile",
  "ardea-purpurea-juvenile",
  "ardea-cinerea-purpurea-hybrid",
  "cardinalis-cardinalis",
  "flamingo",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const birdSlugs = loadBirdSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/perch`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/casestudy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const birdRoutes: MetadataRoute.Sitemap = birdSlugs.map((slug) => ({
    url: `${SITE_URL}/birds/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: FEATURED_SLUGS.has(slug) ? 0.85 : 0.64,
  }));

  return [...staticRoutes, ...birdRoutes];
}
