const { onRequest } = require("firebase-functions/v2/https");
const { resolveBirdSound } = require("./bird-sound-resolve.js");
const {
  applyBrowserGate,
  fetchImageWithAllowlist,
  isRateLimited,
} = require("./http-utils.js");

const soundCache = new Map();

const ALLOWED_HOSTS = new Set([
  "birdnet.cornell.edu",
  "cdn.download.ams.birds.cornell.edu",
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
]);

function guardRequest(req, res) {
  if (isRateLimited(req, res)) return false;
  return applyBrowserGate(req, res) !== null;
}

/** Proxies remote bird photos so the client canvas can sample pixels in production. */
exports.photoSample = onRequest(
  {
    region: "us-central1",
    cors: false,
    invoker: "public",
    maxInstances: 10,
    memory: "256MiB",
  },
  async (req, res) => {
    if (!guardRequest(req, res)) return;

    if (req.method !== "GET") {
      res.status(405).send("Method not allowed");
      return;
    }

    const raw = req.query.url;
    const url = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
    if (!url) {
      res.status(400).json({ error: "missing url" });
      return;
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      res.status(400).json({ error: "invalid url" });
      return;
    }

    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
      res.status(403).json({ error: "host not allowed" });
      return;
    }

    try {
      const upstream = await fetchImageWithAllowlist(
        parsed.toString(),
        (host) => ALLOWED_HOSTS.has(host),
      );
      if (!upstream) {
        res.status(502).send("");
        return;
      }
      if (!upstream.body) {
        res.status(upstream.status).send("");
        return;
      }

      res.set("Content-Type", upstream.contentType);
      res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.status(200).send(upstream.body);
    } catch {
      res.status(502).send("");
    }
  },
);

/** Resolves one Xeno-canto recording (song preferred, else call) per species. */
exports.birdSound = onRequest(
  {
    region: "us-central1",
    cors: false,
    invoker: "public",
    maxInstances: 10,
    memory: "256MiB",
  },
  async (req, res) => {
    if (!guardRequest(req, res)) return;

    if (req.method !== "GET") {
      res.status(405).send("Method not allowed");
      return;
    }

    const raw = req.query.scientificName;
    const scientificName =
      typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? raw[0]?.trim() : "";

    if (!scientificName) {
      res.status(400).json({ error: "missing scientificName" });
      return;
    }

    const apiKey = process.env.XENO_CANTO_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "sound service unavailable" });
      return;
    }

    const cacheKey = scientificName.toLowerCase();
    if (soundCache.has(cacheKey)) {
      res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.status(200).json(soundCache.get(cacheKey));
      return;
    }

    try {
      const result = await resolveBirdSound(scientificName, apiKey);
      soundCache.set(cacheKey, result);
      res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.status(200).json(result);
    } catch {
      res.status(502).json({ error: "upstream failed" });
    }
  },
);
