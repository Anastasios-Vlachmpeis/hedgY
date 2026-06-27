import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to /web so Next doesn't infer the home-dir
  // lockfile as root (this app is standalone, not a monorepo member).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
