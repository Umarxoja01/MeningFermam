import type { Metadata } from "next";
import { getSiteContent } from "./cms";

/** Har sahifa: o'z title/description, canonical va to'liq OpenGraph (TZ v3.1 §9.4, Q22). */
export async function pageMetadata(path: string): Promise<Metadata> {
  const { website } = await getSiteContent();
  const { site } = website.home;
  const page = website.pages[path];
  const m = website.seo[path] ?? { title: page?.h1 ?? "Sahifa topilmadi", description: page?.intro ?? "Bu manzilda sahifa yo‘q." };
  const ogImage = { url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` };
  return {
    title: path === "/" ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: { canonical: path },
    openGraph: { title: m.title, description: m.description, url: path, siteName: site.name, locale: "uz_UZ", type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [ogImage.url] },
  };
}
