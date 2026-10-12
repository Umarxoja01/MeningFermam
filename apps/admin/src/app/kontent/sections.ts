import type { ContentType } from "@meningfermam/content";

// Bo'limning yo'li, versiyalanuvchi kontent turi va kaliti.
export const sections = [
  { slug: "sayt", type: "website", key: "asosiy", title: "Sayt boshqaruvi", hint: "Dizayn, bosh sahifa, bo‘limlar, yangi sahifalar, hisoblagichlar va SEO" },
  { slug: "aloqa", type: "contacts", key: "asosiy", title: "Aloqa", hint: "Telefon, ish vaqti, Telegram, Instagram, email, manzil va veterinarlar" },
  { slug: "funksiyalar", type: "features", key: "asosiy", title: "Funksiyalar holati", hint: "Namuna / Jarayonda / Rejada ro‘yxati" },
  { slug: "savollar", type: "faq", key: "asosiy", title: "Savol-javob", hint: "Guruhlar, savollar va javoblar" },
] as const satisfies readonly { slug: string; type: ContentType; key: string; title: string; hint: string }[];

export type Section = (typeof sections)[number];
export const sectionOf = (slug: string): Section | undefined => sections.find((s) => s.slug === slug);
