import type { MetadataRoute } from "next";

// Qo'shimcha qatlam, himoya emas (ADMIN_TZ §4.7).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
