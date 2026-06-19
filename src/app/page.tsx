import { getHomeInitialData } from "@/lib/data/birds";
import { HomeClient } from "@/components/home/home-client";

export default async function HomePage() {
  const { manifest, initialBirds } = await getHomeInitialData();
  return <HomeClient manifest={manifest} initialBirds={initialBirds} />;
}
