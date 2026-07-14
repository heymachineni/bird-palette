const SITE_URL = "https://birdpalette.web.app";
const SITE_NAME = "Bird Palette";
const DEFAULT_OG = `${SITE_URL}/og.png`;

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegram|discord|slack|preview|embed/i;

let shareIndexPromise = null;
let spaShellPromise = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteImageUrl(imageUrl) {
  if (!imageUrl) return DEFAULT_OG;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${SITE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

function parseSlug(pathname) {
  const match = /^\/birds\/([^/?#]+)\/?$/.exec(pathname || "");
  return match?.[1]?.trim() || "";
}

function isBot(userAgent) {
  return BOT_UA.test(userAgent || "");
}

async function loadShareIndex() {
  if (!shareIndexPromise) {
    shareIndexPromise = fetch(`${SITE_URL}/data/share-index.json`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`share-index ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        shareIndexPromise = null;
        throw err;
      });
  }
  return shareIndexPromise;
}

async function loadSpaShell() {
  if (!spaShellPromise) {
    spaShellPromise = fetch(`${SITE_URL}/index.html`, {
      headers: { Accept: "text/html" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`index.html ${res.status}`);
        return res.text();
      })
      .catch((err) => {
        spaShellPromise = null;
        throw err;
      });
  }
  return spaShellPromise;
}

function normalizeHexList(bird) {
  const raw = Array.isArray(bird.colors)
    ? bird.colors
    : Array.isArray(bird.preview)
      ? bird.preview
      : [];
  return raw
    .map((entry) => (typeof entry === "string" ? entry : entry?.hex))
    .filter((hex) => typeof hex === "string" && hex.length > 0)
    .slice(0, 12);
}

function birdTitle(bird) {
  return `${bird.name} Colors & Plumage Palette`;
}

function birdDescription(bird) {
  const hexes = normalizeHexList(bird);
  const hexPart = hexes.length ? ` Hex colors: ${hexes.join(", ")}.` : "";
  const regionPart = bird.region ? ` Family/group: ${bird.region}.` : "";
  return `${bird.name} (${bird.scientificName}) plumage colors and color combinations — real bird color palette with hex codes on ${SITE_NAME}.${regionPart}${hexPart}`;
}

function birdKeywords(bird) {
  const parts = [
    bird.name,
    `${bird.name} colors`,
    `${bird.name} plumage`,
    `${bird.name} plumage colors`,
    `${bird.name} color palette`,
    bird.scientificName,
    "bird plumage colors",
    "bird color palette",
    "colors of birds",
  ];
  if (Array.isArray(bird.colorFamilies)) {
    for (const family of bird.colorFamilies.slice(0, 6)) {
      parts.push(`${bird.name} ${family}`);
    }
  }
  return parts.filter(Boolean).join(", ");
}

function jsonLd(bird, canonicalUrl, image, hexes) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: birdTitle(bird),
    alternateName: bird.scientificName,
    description: birdDescription(bird),
    url: canonicalUrl,
    image,
    about: {
      "@type": "Thing",
      name: bird.name,
      alternateName: bird.scientificName,
    },
    keywords: birdKeywords(bird),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
  if (hexes.length) {
    data.color = hexes;
  }
  return JSON.stringify(data);
}

function botHtml(bird, canonicalUrl) {
  const title = `${birdTitle(bird)} — ${SITE_NAME}`;
  const description = birdDescription(bird);
  const image = absoluteImageUrl(bird.imageUrl);
  const hexes = normalizeHexList(bird);
  const families = Array.isArray(bird.colorFamilies)
    ? bird.colorFamilies.slice(0, 8)
    : [];
  const hexList =
    hexes.length > 0
      ? `<ul>${hexes.map((hex) => `<li>${escapeHtml(hex)}</li>`).join("")}</ul>`
      : "";
  const familyText = families.length
    ? `<p>Dominant color families: ${escapeHtml(families.join(", "))}.</p>`
    : "";
  const regionText = bird.region
    ? `<p>${escapeHtml(bird.region)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(birdKeywords(bird))}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <script type="application/ld+json">${jsonLd(bird, canonicalUrl, image, hexes)}</script>
</head>
<body>
  <main>
    <article>
      <h1>${escapeHtml(bird.name)} colors and plumage palette</h1>
      <p><em>${escapeHtml(bird.scientificName)}</em></p>
      ${regionText}
      <p>${escapeHtml(bird.name)} plumage color combinations and hex color codes from real bird feathers, shown on ${SITE_NAME}.</p>
      ${familyText}
      <h2>Plumage hex colors</h2>
      ${hexList || "<p>Palette colors are available on Bird Palette.</p>"}
      <p><a href="${escapeHtml(canonicalUrl)}">Open ${escapeHtml(bird.name)} on ${SITE_NAME}</a></p>
      <p><a href="${SITE_URL}">Browse all bird color palettes</a></p>
    </article>
  </main>
</body>
</html>`;
}

/** Serves SPA for humans and bird-specific SEO HTML for crawlers. */
async function handleBirdShare(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).send("Method not allowed");
    return;
  }

  const slug = parseSlug(req.path);
  if (!slug) {
    res.status(404).send("Not found");
    return;
  }

  const canonicalUrl = `${SITE_URL}/birds/${slug}`;
  const userAgent = req.get("user-agent") || "";

  if (isBot(userAgent)) {
    try {
      const index = await loadShareIndex();
      const bird = index[slug];
      if (!bird) {
        res.status(404).send("Bird not found");
        return;
      }

      res.set("Content-Type", "text/html; charset=utf-8");
      res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      if (req.method === "HEAD") {
        res.status(200).end();
        return;
      }
      res.status(200).send(botHtml(bird, canonicalUrl));
      return;
    } catch {
      res.status(502).send("Share metadata unavailable");
      return;
    }
  }

  try {
    const shell = await loadSpaShell();
    res.set("Content-Type", "text/html; charset=utf-8");
    res.set("Cache-Control", "public, max-age=0, must-revalidate");
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }
    res.status(200).send(shell);
  } catch {
    res.redirect(302, SITE_URL);
  }
}

module.exports = {
  handleBirdShare,
  parseSlug,
  isBot,
  absoluteImageUrl,
  birdTitle,
  birdDescription,
  botHtml,
};
