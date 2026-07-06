import type { Metadata } from "next";

export const SITE_NAME = "Bird Palette";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://birdpalette.web.app";

/** Primary and long-tail phrases we want to rank for (metadata only). */
export const SITE_KEYWORDS = [
  "bird palette",
  "birdpalette",
  "bird plumage",
  "bird plumage colors",
  "colors of birds",
  "color combination of birds",
  "bird color combinations",
  "bird color palette",
  "plumage colors",
  "ornithology colors",
  "nature color palette",
  "bird colors hex",
  "bird color inspiration",
  "biodiversity colors",
  "color palette from nature",
] as const;

export const DEFAULT_DESCRIPTION =
  "Bird Palette — explore 10,000+ bird plumage color palettes. Search birds by name, species, or hex code. Real color combinations from nature for design, art, and ornithology.";

export const HOME_TITLE =
  "Bird Palette — Bird Plumage Colors & Color Combinations";

export const OG_IMAGE = {
  url: "/og.png",
  width: 1024,
  height: 682,
  alt: "Bird Palette — bird plumage colors and palettes from nature",
} as const;

export function canonicalPath(pathname = "/"): string {
  if (!pathname || pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = "/",
  keywords = [...SITE_KEYWORDS],
  noIndex = false,
}: {
  title?: string;
  description?: string;
  pathname?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const canonical = canonicalPath(pathname);
  const fullTitle = title ? `${title} — ${SITE_NAME}` : HOME_TITLE;

  return {
    title: title ? fullTitle : { absolute: HOME_TITLE },
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: title ? fullTitle : HOME_TITLE,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? fullTitle : HOME_TITLE,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
