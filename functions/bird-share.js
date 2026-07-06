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

function birdDescription(bird) {
  return `Plumage color palette for ${bird.name} (${bird.scientificName}) — real bird colors and hex swatches on Bird Palette.`;
}

function botHtml(bird, canonicalUrl) {
  const title = `${bird.name} — ${SITE_NAME}`;
  const description = birdDescription(bird);
  const image = absoluteImageUrl(bird.imageUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
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
</head>
<body>
  <p><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></p>
</body>
</html>`;
}

/** Serves SPA for humans and bird-specific Open Graph HTML for crawlers. */
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
};
