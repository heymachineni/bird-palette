/** Origins allowed to call public HTTPS functions from a browser. */
const ALLOWED_ORIGINS = new Set([
  "https://birdpalette.web.app",
  "https://birdpalette.firebaseapp.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 120;
const rateBuckets = new Map();

function resolveAllowedOrigin(req) {
  const origin = req.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) return origin;

  const referer = req.get("Referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.has(refOrigin)) return refOrigin;
    } catch {
      // ignore bad referer
    }
  }

  return null;
}

/**
 * Browser-only gate: same-origin / hosting rewrites send Origin or Referer.
 * Direct curl to the Cloud Run URL gets 403 (CORS alone does not block that).
 * @returns {string|null} allowed Origin value for ACAO, or null if rejected
 */
function applyBrowserGate(req, res) {
  const allowedOrigin = resolveAllowedOrigin(req);

  if (req.method === "OPTIONS") {
    if (!allowedOrigin) {
      res.status(403).send("Forbidden");
      return null;
    }
    res.set("Access-Control-Allow-Origin", allowedOrigin);
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "86400");
    res.set("Vary", "Origin");
    res.status(204).send("");
    return null;
  }

  if (!allowedOrigin) {
    res.status(403).json({ error: "forbidden" });
    return null;
  }

  res.set("Access-Control-Allow-Origin", allowedOrigin);
  res.set("Vary", "Origin");
  return allowedOrigin;
}

function clientIp(req) {
  const forwarded = req.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || "unknown";
}

/** Per-instance soft cap; limits casual abuse without extra infra. */
function isRateLimited(req, res) {
  const ip = clientIp(req);
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > RATE_MAX_REQUESTS) {
    res.set("Retry-After", "60");
    res.status(429).json({ error: "rate limit exceeded" });
    return true;
  }
  return false;
}

const MAX_REDIRECTS = 3;

/** Fetch with manual redirect handling; re-check allowlist each hop. */
async function fetchImageWithAllowlist(url, isHostAllowed) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const upstream = await fetch(current, {
      redirect: "manual",
      headers: { Accept: "image/*" },
    });

    if (upstream.status >= 300 && upstream.status < 400) {
      const location = upstream.headers.get("location");
      if (!location) return null;
      let next;
      try {
        next = new URL(location, current);
      } catch {
        return null;
      }
      if (next.protocol !== "https:" || !isHostAllowed(next.hostname)) return null;
      current = next.toString();
      continue;
    }

    if (!upstream.ok) return { status: upstream.status, body: null, contentType: null };

    const contentType = upstream.headers.get("content-type") ?? "";
    if (contentType && !contentType.startsWith("image/")) {
      return { status: 415, body: null, contentType: null };
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    return {
      status: 200,
      body,
      contentType: contentType || "image/jpeg",
    };
  }
  return null;
}

module.exports = {
  applyBrowserGate,
  fetchImageWithAllowlist,
  isRateLimited,
};
