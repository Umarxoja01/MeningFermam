import type { MetadataRoute } from "next";
import { SITE_URL, pagePaths } from "@/content/seo";

// statik eksport: build vaqtida bir marta yaratiladi
export const dynamic = "force-static";

// 11 ommaviy URL (TZ v3.1 §3). Bazasiz, statik.
export default function sitemap(): MetadataRoute.Sitemap {
  return pagePaths.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.6 }));
}
