import type { NextConfig } from "next";
import path from "node:path";

// CMS_MODE=dynamic: admin nashrlari har yangi so'rovda umumiy bazadan olinadi.
// Env belgilanmasa eski bazasiz statik eksport saqlanadi.
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  ...(process.env.CMS_MODE === "dynamic" ? {} : { output: "export" as const }),
  poweredByHeader: false,
  // umumiy kontent turlari (packages/content) TypeScript manbasi sifatida
  transpilePackages: ["@meningfermam/content", "@meningfermam/db"],
};

export default nextConfig;
