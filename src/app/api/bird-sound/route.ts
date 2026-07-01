import { NextRequest, NextResponse } from "next/server";
import { resolveBirdSound } from "../../../../shared/bird-sound-resolve.js";
import type { BirdSoundPayload } from "@/lib/bird-sound/types";

export const dynamic = "force-dynamic";

const cache = new Map<string, BirdSoundPayload>();

export async function GET(req: NextRequest) {
  const scientificName = req.nextUrl.searchParams.get("scientificName")?.trim();
  if (!scientificName) {
    return NextResponse.json({ error: "missing scientificName" }, { status: 400 });
  }

  const apiKey = process.env.XENO_CANTO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "sound service unavailable" },
      { status: 503 },
    );
  }

  const cacheKey = scientificName.toLowerCase();
  const hit = cache.get(cacheKey);
  if (hit) {
    return NextResponse.json(hit, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  try {
    const result = await resolveBirdSound(scientificName, apiKey);
    cache.set(cacheKey, result);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "upstream failed" }, { status: 502 });
  }
}
