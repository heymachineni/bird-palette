import { DEFAULT_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

export type BirdShareMeta = {
  name: string;
  scientificName: string;
  slug: string;
  imageUrl: string;
};

function absoluteImageUrl(imageUrl: string): string {
  if (!imageUrl?.trim()) return `${SITE_URL}/og.png`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${SITE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export function birdShareDescription(bird: BirdShareMeta): string {
  return `Plumage color palette for ${bird.name} (${bird.scientificName}) — real bird colors and hex swatches on Bird Palette.`;
}

export function birdShareTitle(bird: BirdShareMeta): string {
  return `${bird.name} — ${SITE_NAME}`;
}

export function birdShareUrl(slug: string): string {
  return `${SITE_URL}/birds/${slug}`;
}

export function birdShareOgImage(bird: BirdShareMeta): string {
  return absoluteImageUrl(bird.imageUrl);
}

type StoredHead = {
  title: string;
};

let stored: StoredHead | null = null;

function upsertMeta(
  key: string,
  content: string,
  attribute: "name" | "property",
) {
  let el = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null;

  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }

  el.setAttribute("content", content);
}

export function applyBirdDocumentMeta(bird: BirdShareMeta) {
  if (!stored) {
    stored = { title: document.title };
  }

  const title = birdShareTitle(bird);
  const description = birdShareDescription(bird);
  const url = birdShareUrl(bird.slug);
  const image = birdShareOgImage(bird);

  document.title = title;
  upsertMeta("description", description, "name");
  upsertMeta("og:type", "website", "property");
  upsertMeta("og:site_name", SITE_NAME, "property");
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:url", url, "property");
  upsertMeta("og:image", image, "property");
  upsertMeta("twitter:card", "summary_large_image", "name");
  upsertMeta("twitter:title", title, "name");
  upsertMeta("twitter:description", description, "name");
  upsertMeta("twitter:image", image, "name");
}

export function restoreDocumentMeta() {
  if (!stored) return;

  document.title = stored.title || HOME_TITLE;
  upsertMeta("description", DEFAULT_DESCRIPTION, "name");
  upsertMeta("og:title", HOME_TITLE, "property");
  upsertMeta("og:description", DEFAULT_DESCRIPTION, "property");
  upsertMeta("og:url", SITE_URL, "property");
  upsertMeta("og:image", `${SITE_URL}/og.png`, "property");
  upsertMeta("twitter:title", HOME_TITLE, "name");
  upsertMeta("twitter:description", DEFAULT_DESCRIPTION, "name");
  upsertMeta("twitter:image", `${SITE_URL}/og.png`, "name");

  stored = null;
}
