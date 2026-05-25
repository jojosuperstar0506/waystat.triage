import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this folder so Next doesn't pick a parent
    // lockfile (~/package-lock.json) as the root.
    root: path.resolve("."),
  },
};

export default nextConfig;
