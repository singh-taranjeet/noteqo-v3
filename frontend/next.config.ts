import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is enabled by default in Next.js 16.
  // Web Workers (ai.worker.ts) work natively under Turbopack with no extra config.
  turbopack: {},
};

export default nextConfig;
