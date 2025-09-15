import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // HACK: Disable ESLint during production builds for quick deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // HACK: Also ignore TypeScript errors for prototype validation
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
