import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL === "1"
    ? {
        typescript: {
          tsconfigPath: "tsconfig.vercel.json",
        },
        turbopack: {
          resolveAlias: {
            "cloudflare:workers": "./lib/vercel-cloudflare-stub.ts",
          },
        },
      }
    : {}),
};

export default nextConfig;
