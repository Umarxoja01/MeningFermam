import type { Metadata } from "next";
import { site } from "@/content/bosh";
import { seo, type PagePath } from "@/content/seo";

const ogImage = { url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` };

/** Har sahifa: o'z title/description, canonical va to'liq OpenGraph (TZ v3.1 §9.4, Q22). */
export function pageMetadata(path: PagePath): Metadata {
  const m = seo[path];
  return {
    title: path === "/" ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: { canonical: path },
    openGraph: { title: m.title, description: m.description, url: path, siteName: site.name, locale: "uz_UZ", type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [ogImage.url] },
  };
}
