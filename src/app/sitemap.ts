import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

type SearchIndexEntry = { slug: string };

/** Keep each sitemap shard small so Search Console can fetch reliably. */
const URLS_PER_SITEMAP = 2500;

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

function loadBirdSlugs(): string[] {
  const indexPath = path.join(process.cwd(), "public/data/search-index.json");
  if (!existsSync(indexPath)) return [];

  const entries = JSON.parse(readFileSync(indexPath, "utf8")) as SearchIndexEntry[];
  return entries.map((entry) => entry.slug).filter(Boolean);
}

function staticRoutes(now: Date): MetadataRoute.Sitemap {
  return [
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
}

function allRoutes(now: Date): MetadataRoute.Sitemap {
  const birdSlugs = loadBirdSlugs();
  const birdRoutes: MetadataRoute.Sitemap = birdSlugs.map((slug) => ({
    url: `${SITE_URL}/birds/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: FEATURED_SLUGS.has(slug) ? 0.85 : 0.64,
  }));
  return [...staticRoutes(now), ...birdRoutes];
}

export async function generateSitemaps() {
  const total = allRoutes(new Date()).length;
  const count = Math.max(1, Math.ceil(total / URLS_PER_SITEMAP));
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string> | string;
}): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id;
  const id = Number(rawId);
  const now = new Date();
  const routes = allRoutes(now);
  const start = id * URLS_PER_SITEMAP;
  return routes.slice(start, start + URLS_PER_SITEMAP);
}
