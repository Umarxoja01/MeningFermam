import type { NextConfig } from "next";

// Faqat frontend (egasi qarori, 2026-10-12): sayt to'liq statik eksport qilinadi — `out/` papkasida oddiy HTML/CSS/JS.
// Serverda Node.js yoki baza kerak emas; istalgan hostingga (Apache, nginx) yuklanadi.
// Statik eksportda `headers()` ishlamaydi: xavfsizlik sarlavhalari va toza URL'lar `public/.htaccess` da (Apache)
// yoki docs/VSCODE_TZ.md dagi nginx sozlamasida.
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  // umumiy kontent turlari (packages/content) TypeScript manbasi sifatida
  transpilePackages: ["@meningfermam/content"],
};

export default nextConfig;
