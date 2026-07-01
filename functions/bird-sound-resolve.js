/** @typedef {"song" | "call"} SoundKind */

/**
 * @typedef {object} XcRecording
 * @property {string} id
 * @property {string} type
 * @property {string} rec
 * @property {string} file
 * @property {string} lic
 * @property {string} url
 * @property {string} q
 * @property {string} length
 */

/**
 * @typedef {object} BirdSoundResult
 * @property {true} available
 * @property {SoundKind} soundType
 * @property {string} audioUrl
 * @property {string} xcId
 * @property {string} recordist
 * @property {string} licenseUrl
 * @property {string} sourceUrl
 * @property {string} length
 */

/**
 * @typedef {object} BirdSoundEmpty
 * @property {false} available
 */

/** @type {Record<string, number>} */
const QUALITY_RANK = { A: 0, B: 1, C: 2, D: 3, E: 4 };

/**
 * XC API v3: separate tags with spaces, not literal "+" in the query string.
 * @param {string} scientificName
 */
function buildSpeciesQuery(scientificName) {
  const parts = scientificName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    return `gen:${parts[0]} sp:${parts[1]} ssp:${parts.slice(2).join(" ")} grp:birds`;
  }
  if (parts.length === 2) {
    return `gen:${parts[0]} sp:${parts[1]} grp:birds`;
  }
  if (parts.length === 1) {
    return `sp:${parts[0]} grp:birds`;
  }
  return "grp:birds";
}

/**
 * @param {string | undefined} len
 */
function parseLengthSeconds(len) {
  if (!len) return 9999;
  const parts = String(len).split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 9999;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 9999;
}

/**
 * @param {string | undefined} file
 */
function isPlayableFile(file) {
  return (
    typeof file === "string" &&
    file.length > 0 &&
    file !== "restricted_species" &&
    !file.includes("restricted_species")
  );
}

/**
 * @param {string | undefined} url
 */
function normalizeUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

/**
 * @param {string | undefined} type
 * @param {SoundKind} kind
 */
function matchesSoundKind(type, kind) {
  const lower = (type || "").toLowerCase();
  if (kind === "song") return /\bsong\b/.test(lower);
  return /\bcall\b/.test(lower);
}

/**
 * @param {XcRecording} rec
 */
function recordingScore(rec) {
  const quality = QUALITY_RANK[rec.q] ?? 5;
  const seconds = parseLengthSeconds(rec.length);
  const lengthPenalty = seconds > 90 ? 500 : seconds;
  return quality * 1000 + lengthPenalty;
}

/**
 * @param {XcRecording[]} recordings
 * @param {SoundKind} kind
 */
function pickBestForKind(recordings, kind) {
  const candidates = recordings
    .filter(
      (rec) =>
        isPlayableFile(rec.file) && matchesSoundKind(rec.type, kind),
    )
    .sort((a, b) => recordingScore(a) - recordingScore(b));

  return candidates[0] ?? null;
}

/**
 * @param {XcRecording} rec
 * @param {SoundKind} soundType
 * @returns {BirdSoundResult}
 */
function toResult(rec, soundType) {
  return {
    available: true,
    soundType,
    audioUrl: normalizeUrl(rec.file),
    xcId: rec.id,
    recordist: rec.rec,
    licenseUrl: normalizeUrl(rec.lic),
    sourceUrl: normalizeUrl(rec.url),
    length: rec.length,
  };
}

/**
 * Prefer song; fall back to call. Never return both.
 * @param {XcRecording[]} recordings
 * @returns {BirdSoundResult | BirdSoundEmpty}
 */
function pickSingleRecording(recordings) {
  const song = pickBestForKind(recordings, "song");
  if (song) return toResult(song, "song");

  const call = pickBestForKind(recordings, "call");
  if (call) return toResult(call, "call");

  return { available: false };
}

/**
 * @param {string} scientificName
 * @param {string} apiKey
 * @returns {Promise<BirdSoundResult | BirdSoundEmpty>}
 */
async function resolveBirdSound(scientificName, apiKey) {
  const trimmed = scientificName.trim();
  if (!trimmed || !apiKey) {
    return { available: false };
  }

  const query = buildSpeciesQuery(trimmed);
  const url = new URL("https://xeno-canto.org/api/3/recordings");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("per_page", "100");

  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!resp.ok) {
    throw new Error(`xeno-canto ${resp.status}`);
  }

  const data = await resp.json();
  if (data.error) {
    throw new Error(data.error.message || data.error.code || "xeno-canto error");
  }

  /** @type {XcRecording[]} */
  const recordings = Array.isArray(data.recordings) ? data.recordings : [];
  return pickSingleRecording(recordings);
}

module.exports = {
  buildSpeciesQuery,
  pickSingleRecording,
  resolveBirdSound,
};
