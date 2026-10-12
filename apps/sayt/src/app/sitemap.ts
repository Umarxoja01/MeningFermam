import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/seo";
import { getSiteContent } from "@/lib/cms";

// Statik eksportga mos; CMS so'rovlarida connection() keshni chetlab o'tadi.
export const revalidate = false;

// statik eksport: build vaqtida bir marta yaratiladi

// 11 ommaviy URL (TZ v3.1 §3). Bazasiz, statik.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { website } = await getSiteContent();
  return ["/", ...Object.keys(website.pages)].map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.6 }));
}
