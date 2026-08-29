import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — required for Cloudflare Pages / static hosts.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
