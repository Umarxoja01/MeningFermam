import type { NextConfig } from "next";
import path from "node:path";

// Admin panel (ADMIN_TZ §4.5, §4.7): hech qachon keshlanmaydi va indekslanmaydi; boshqa saytga ichiga qo'yib bo'lmaydi.
// Content-Security-Policy har so'rovda nonce bilan src/proxy.ts da beriladi.
const headers = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  transpilePackages: ["@meningfermam/content", "@meningfermam/db"],
  // native (argon2) va WASM (PGlite) paketlar bundle qilinmaydi
  serverExternalPackages: ["@node-rs/argon2", "@electric-sql/pglite"],
  async headers() {
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
