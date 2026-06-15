import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Static export for Firebase Hosting (Spark plan). */
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
};

export default nextConfig;
