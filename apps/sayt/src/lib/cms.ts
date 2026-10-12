import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { cmsWebsiteSchema, contactsSchema, faqGroupsSchema, featuresSchema } from "@meningfermam/content";
import { openDb, schema, type DbHandle } from "@meningfermam/db";
import { eq } from "drizzle-orm";
import { defaultWebsite } from "@/content/cms-defaults";
import { contacts } from "@/content/aloqa";
import { features } from "@/content/holat";
import { faqGroups } from "@/content/savollar";
import type { SiteContent } from "@/components/sayt/v2/CmsProvider";

const cmsEnabled = () => process.env.CMS_MODE === "dynamic";
const connections = globalThis as typeof globalThis & { meningFermamPublicDb?: Promise<DbHandle> };

/** Ulanish umumiy, ammo kontent faqat bitta HTTP so'rovi doirasida memo qilinadi. */
function database() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("CMS_MODE=dynamic uchun DATABASE_URL kerak");
  return connections.meningFermamPublicDb ??= openDb(url, { max: 3 }).catch((error) => {
    connections.meningFermamPublicDb = undefined;
    throw error;
  });
}

/** Qoralamalar olinmaydi. Bazada noto'g'ri yoki mavjud bo'lmagan nashr bo'lsa xavfsiz lokal kontent ishlaydi. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const fallback: SiteContent = { website: defaultWebsite, contacts, features, faqGroups };
  if (!cmsEnabled()) return fallback;
  await connection();
  try {
    const apiUrl = process.env.CMS_API_URL?.trim();
    if (apiUrl) {
      const response = await fetch(apiUrl, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error("Nashr API ochilmadi");
      const data = await response.json() as Record<string, unknown>;
      const website = cmsWebsiteSchema.safeParse(data.website);
      const contact = contactsSchema.safeParse(data.contacts);
      const feature = featuresSchema.safeParse(data.features);
      const faq = faqGroupsSchema.safeParse(data.faqGroups);
      return {
        website: website.success ? website.data : fallback.website,
        contacts: contact.success ? contact.data : fallback.contacts,
        features: feature.success ? feature.data : fallback.features,
        faqGroups: faq.success ? faq.data : fallback.faqGroups,
      };
    }
    const { db } = await database();
    const { publication, contentItem, contentVersion } = schema;
    const published = await db.select({ type: contentItem.type, key: contentItem.key, data: contentVersion.data })
      .from(publication)
      .innerJoin(contentItem, eq(contentItem.id, publication.itemId))
      .innerJoin(contentVersion, eq(contentVersion.id, publication.versionId));
    const value = (type: string) => published.find((row) => row.type === type && row.key === "asosiy")?.data;
    const website = cmsWebsiteSchema.safeParse(value("website"));
    const contact = contactsSchema.safeParse(value("contacts"));
    const feature = featuresSchema.safeParse(value("features"));
    const faq = faqGroupsSchema.safeParse(value("faq"));
    return {
      website: website.success ? website.data : fallback.website,
      contacts: contact.success ? contact.data : fallback.contacts,
      features: feature.success ? feature.data : fallback.features,
      faqGroups: faq.success ? faq.data : fallback.faqGroups,
    };
  } catch {
    // Maxfiy baza manzili yoki xato tafsilotlari sahifaga chiqarilmaydi.
    console.error("MeningFermam: nashr kontenti olinmadi, lokal kontent ko'rsatilmoqda.");
    return fallback;
  }
});
