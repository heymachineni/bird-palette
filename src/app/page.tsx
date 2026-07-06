import type { Metadata } from "next";
import { getHomeInitialData } from "@/lib/data/birds";
import { pageMetadata } from "@/lib/seo";
import { HomeClient } from "@/components/home/home-client";

export const metadata: Metadata = pageMetadata({
  pathname: "/",
  description:
    "Explore 10,000+ bird plumage color palettes on Bird Palette. Search colors of birds by name, species, or hex — real color combinations from nature for designers, artists, and birders.",
});

export default async function HomePage() {
  const { manifest, initialBirds } = await getHomeInitialData();
  return <HomeClient manifest={manifest} initialBirds={initialBirds} />;
}
