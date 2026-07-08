import type { BirdSoundPayload } from "./types";

const cache = new Map<string, BirdSoundPayload>();
const inFlight = new Map<string, Promise<BirdSoundPayload>>();
const prefetchQueue: string[] = [];
const queued = new Set<string>();
let activePrefetches = 0;

const PREFETCH_CONCURRENCY = 2;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "bird-sound:v1:";

type StoredBirdSound = {
  expiresAt: number;
  payload: BirdSoundPayload;
};

function normalizeScientificName(scientificName: string): string {
  return scientificName.trim().toLowerCase();
}

function storageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function readLocalCache(key: string): BirdSoundPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBirdSound;
    if (!parsed || typeof parsed.expiresAt !== "number" || !parsed.payload) return null;
    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey(key));
      return null;
    }
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeLocalCache(key: string, payload: BirdSoundPayload): void {
  if (typeof window === "undefined") return;
  try {
    const stored: StoredBirdSound = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    };
    window.localStorage.setItem(storageKey(key), JSON.stringify(stored));
  } catch {
    // localStorage may be full or unavailable.
  }
}

async function fetchBirdSoundApi(scientificName: string): Promise<BirdSoundPayload> {
  const params = new URLSearchParams({ scientificName: scientificName.trim() });
  const resp = await fetch(`/api/bird-sound?${params.toString()}`);
  if (!resp.ok) {
    throw new Error(`bird-sound ${resp.status}`);
  }
  return (await resp.json()) as BirdSoundPayload;
}

async function fetchBirdSoundFresh(
  scientificName: string,
  key: string,
): Promise<BirdSoundPayload> {
  const current = inFlight.get(key);
  if (current) return current;

  const pending = fetchBirdSoundApi(scientificName)
    .then((payload) => {
      cache.set(key, payload);
      writeLocalCache(key, payload);
      return payload;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, pending);
  return pending;
}

function pumpPrefetchQueue(): void {
  while (activePrefetches < PREFETCH_CONCURRENCY && prefetchQueue.length > 0) {
    const next = prefetchQueue.shift();
    if (!next) continue;
    queued.delete(next);
    activePrefetches += 1;
    void fetchBirdSound(next)
      .catch(() => {
        // Ignore prefetch errors; normal click flow will still handle state.
      })
      .finally(() => {
        activePrefetches -= 1;
        pumpPrefetchQueue();
      });
  }
}

export async function fetchBirdSound(
  scientificName: string,
): Promise<BirdSoundPayload> {
  const key = normalizeScientificName(scientificName);
  const cached = cache.get(key);
  if (cached) return cached;

  const local = readLocalCache(key);
  if (local) {
    cache.set(key, local);
    return local;
  }

  return fetchBirdSoundFresh(scientificName, key);
}

export function prefetchBirdSound(scientificName: string): void {
  const key = normalizeScientificName(scientificName);
  if (!key) return;
  if (cache.has(key) || readLocalCache(key) || inFlight.has(key) || queued.has(key)) return;

  queued.add(key);
  prefetchQueue.push(scientificName.trim());
  pumpPrefetchQueue();
}

export function prefetchBirdSounds(scientificNames: string[], max = 16): void {
  const unique = new Set<string>();
  for (const name of scientificNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = normalizeScientificName(trimmed);
    if (unique.has(key)) continue;
    unique.add(key);
    prefetchBirdSound(trimmed);
    if (unique.size >= max) break;
  }
}
