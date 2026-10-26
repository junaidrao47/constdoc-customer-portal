import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the production Docker image
  // ships only the traced runtime deps instead of the full node_modules. See Dockerfile.
  output: "standalone",
};

export default nextConfig;
