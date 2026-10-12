"use client";

import { createContext, useContext, useEffect } from "react";
import type { CmsWebsite, Contacts, Feature } from "@meningfermam/content";

export type SiteContent = {
  website: CmsWebsite;
  contacts: Contacts;
  features: Feature[];
  faqGroups: { title: string; items: { q: string; a: string }[] }[];
};

const SiteContentContext = createContext<SiteContent | null>(null);

/** Faqat nashr qilingan, tekshirilgan kontent serverdan beriladi. Baza manzili klientga chiqmaydi. */
export function CmsProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  const design = value.website.design;
  useEffect(() => {
    // Root layout client o'tishda saqlanadi; eng yangi nashr rang/shriftlarini HTML'ga qo'llaymiz.
    const root = document.documentElement.style;
    const variables = {
      "--bg": design.background, "--card": design.surface, "--ink": design.text,
      "--green": design.primary, "--green-text": design.primaryDark,
      "--r": `${design.radius}px`, "--cms-font-size": `${design.fontSize}px`,
      "--cms-max-width": `${design.maxWidth}px`, "--cms-section-spacing": `${design.sectionSpacing}px`,
      "--cms-hero-height": `${design.heroHeight}px`,
    };
    for (const [key, variable] of Object.entries(variables)) root.setProperty(key, variable);
    for (const key of ["--sans", "--display"]) {
      if (design.font === "serif") root.setProperty(key, 'Georgia, "Times New Roman", serif');
      else root.removeProperty(key);
    }
  }, [design]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  const content = useContext(SiteContentContext);
  if (!content) throw new Error("Sayt kontenti berilmagan");
  return content;
}

/** Yashirilgan bo'limning havolasi ham yashiriladi; saqlangan menyu o'zgarmaydi. */
export function filterHomeLinks<T extends { href: string }>(links: T[], layout: CmsWebsite["layout"]): T[] {
  const enabledIds = new Set(layout.filter((section) => section.enabled).map((section) => section.id));
  return links.filter((link) => {
    const target = /^\/?#([a-z0-9-]+)$/i.exec(link.href)?.[1];
    return !target || target === "aloqa" || enabledIds.has(target);
  });
}

/** Faqat saytning mavjud sahifasi yoki ko'rinadigan bo'limiga ichki havola chiziladi. */
export function isSiteLinkAvailable(href: string, website: CmsWebsite): boolean {
  if (href.startsWith("#")) return filterHomeLinks([{ href }], website.layout).length > 0;
  if (!href.startsWith("/") || href.startsWith("//")) return true;
  const [path = "/", hash] = href.split("#", 2);
  const cleanPath = path.split("?", 1)[0] || "/";
  if (cleanPath === "/") return !hash || filterHomeLinks([{ href: `#${hash}` }], website.layout).length > 0;
  return !!website.pages[cleanPath];
}

/** Mavjud matn tuzilmasi saqlanadi; admin faqat satr qiymatlarini almashtiradi. */
export function applyLabels<T extends object>(scope: string, defaults: T, labels: Record<string, string>): T {
  const replace = (value: unknown, path: string): unknown => {
    if (typeof value === "string") return labels[path] ?? value;
    if (Array.isArray(value)) return value.map((item, i) => replace(item, `${path}.${i}`));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item, `${path}.${key}`)]));
    return value;
  };
  return replace(defaults, scope) as T;
}
