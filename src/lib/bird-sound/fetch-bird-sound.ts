import type { BirdSoundPayload } from "./types";

const cache = new Map<string, BirdSoundPayload>();

export async function fetchBirdSound(
  scientificName: string,
): Promise<BirdSoundPayload> {
  const key = scientificName.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ scientificName: scientificName.trim() });
  const resp = await fetch(`/api/bird-sound?${params.toString()}`);
  if (!resp.ok) {
    throw new Error(`bird-sound ${resp.status}`);
  }

  const data = (await resp.json()) as BirdSoundPayload;
  cache.set(key, data);
  return data;
}
