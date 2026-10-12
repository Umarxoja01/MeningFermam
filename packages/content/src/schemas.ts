// Kontent sxemalari: sayt kontenti (apps/sayt/src/content) shu sxemalar bilan testlanadi — soxta telefon, 9 dan boshqa
// kartochka, shoshilinch alomatda davolash namunasi kabi xatolar build'gacha ushlanadi.
import { z } from "zod";
import { heroSchema, innerPageSchema } from "./page";
import { cmsWebsiteSchema } from "./cms";
export * from "./page";

const text = (max: number) => z.string().trim().min(1).max(max);

/** +998XXXXXXXXX */
export const PHONE_RE = /^\+998\d{9}$/;
/** Telegram/Instagram nik, @ siz */
export const HANDLE_RE = /^[A-Za-z0-9_.]{5,32}$/;

// --- Aloqa ---
export const vetSchema = z.object({
  title: text(60),
  name: text(80).nullable(),
  phone: z.string().regex(PHONE_RE),
  telegram: z.string().regex(HANDLE_RE).nullable(),
});
export const contactsSchema = z.object({
  hours: text(80),
  phone: z.string().regex(PHONE_RE),
  telegram: z.string().regex(HANDLE_RE).nullable(),
  instagram: z.string().regex(HANDLE_RE).nullable(),
  email: z.email().nullable(),
  address: text(200).nullable(),
  vets: z.array(vetSchema).min(1).max(20),
});

// --- Funksiyalar holati ---
export const statusKindSchema = z.enum(["on", "pr", "soon"]);
export const featureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  kind: statusKindSchema,
  emoji: text(8),
  title: text(60),
  note: text(200).optional(),
});
export const featuresSchema = z
  .array(featureSchema)
  .min(1)
  .max(40)
  .refine((fs) => new Set(fs.map((f) => f.id)).size === fs.length, "id takrorlanmasin")
  .refine((fs) => statusKindSchema.options.every((k) => fs.some((f) => f.kind === k)), "har tabda kamida bitta funksiya");

// --- Savol-javob ---
export const faqSchema = z.object({ q: text(200), a: text(1200) });
export const faqGroupsSchema = z.array(z.object({ title: text(60), items: z.array(faqSchema).min(1).max(50) })).min(1).max(10);

// --- Bosh sahifa ---
export const problemSchema = z.object({
  emoji: text(8),
  topic: text(30),
  question: text(90),
  href: z.string().regex(/^#[a-z]+$/),
});
/** TZ v3.1 §4.1: aynan 9 ta kartochka. */
export const problemsSchema = z.array(problemSchema).length(9);

// --- SEO ---
export const pagePaths = ["/", "/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/daftardan-farqi", "/tez-orada", "/savollar", "/aloqa", "/maxfiylik", "/shartlar"] as const;
export const pagePathSchema = z.enum(pagePaths);
export const seoEntrySchema = z.object({ title: text(70), description: text(170) });
export const seoSchema = z.record(pagePathSchema, seoEntrySchema);

// --- Yem narxlari ---
export const feedKeys = ["beda", "silos", "somon", "arpa", "kepak", "kunjara"] as const;
const price = z.number().int().min(0).max(100_000);
export const pricesSchema = z.object(Object.fromEntries(feedKeys.map((k) => [k, price])) as Record<(typeof feedKeys)[number], typeof price>);

// --- Klinik namunalar (TZ v3.1 §4.4) ---
export const rxSchema = z.object({ drug: z.string().regex(/^[a-z]{2,20}$/), amount: z.number().positive().max(1000), perKg: z.number().min(0).max(1000), note: text(80) });
export const symptomSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{3,40}$/),
    sign: text(60),
    name: text(60),
    easy: text(300),
    urgent: z.boolean(),
    plan: z.array(z.tuple([text(30), text(120)])).min(1).max(10),
    drugs: z.array(text(80)).max(10),
    rx: z.array(rxSchema).max(10),
    days: z.number().int().min(0).max(60),
    treatmentDays: z.array(z.number().int().min(1).max(60)).min(1).max(60).optional(),
  })
  .refine((s) => !s.urgent || s.rx.length === 0, "shoshilinch alomatda mustaqil davolash namunasi bo'lmaydi (TZ §4.4)")
  .refine((s) => s.rx.length === 0 || s.days >= 1, "davolash namunasi kamida 1 kun")
  .refine((s) => !s.treatmentDays || (s.rx.length > 0 && s.treatmentDays.at(-1) === s.days && s.treatmentDays.every((day, i, days) => i === 0 || day > days[i - 1]!)), "namuna kunlari o'sish tartibida, takrorsiz va oxirgi kunga mos bo'lsin");
export const sickAnimalSchema = z.object({
  label: text(30),
  icon: text(8),
  patient: text(40),
  weights: z.array(z.number().int().positive().max(2000)).min(1).max(8),
  symptoms: z.array(symptomSchema).min(1).max(20),
});
export const drugDefSchema = z.object({ key: z.string().regex(/^[a-z]{2,20}$/), name: text(80), unit: z.enum(["ml", "dona", "namuna birligi"]), vial: z.number().int().positive().max(10_000) });
export const stockEntrySchema = z.object({ closed: z.number().int().min(0).max(1000), open: z.number().min(0) });

// --- Kontent turlari ro'yxati (tur → sxema; klinikmi) ---
export const contentTypes = {
  website: { schema: cmsWebsiteSchema, clinical: false },
  contacts: { schema: contactsSchema, clinical: false },
  features: { schema: featuresSchema, clinical: false },
  faq: { schema: faqGroupsSchema, clinical: false },
  problems: { schema: problemsSchema, clinical: false },
  hero: { schema: heroSchema, clinical: false },
  page: { schema: innerPageSchema, clinical: false },
  seo: { schema: seoSchema, clinical: false },
  prices: { schema: pricesSchema, clinical: false },
  "clinical-animals": { schema: z.record(z.string(), sickAnimalSchema), clinical: true },
  "clinical-drugs": { schema: z.record(z.string(), drugDefSchema), clinical: true },
} as const;
export type ContentType = keyof typeof contentTypes;
export const contentTypeNames = Object.keys(contentTypes) as ContentType[];

export type Vet = z.infer<typeof vetSchema>;
export type Contacts = z.infer<typeof contactsSchema>;
export type StatusKind = z.infer<typeof statusKindSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type Problem = z.infer<typeof problemSchema>;
export type Hero = z.infer<typeof heroSchema>;


export type InnerPage = z.infer<typeof innerPageSchema>;
export type PagePath = (typeof pagePaths)[number];
export type SeoEntry = z.infer<typeof seoEntrySchema>;
export type FeedKey = (typeof feedKeys)[number];
export type Prices = z.infer<typeof pricesSchema>;
export type Rx = z.infer<typeof rxSchema>;
export type Symptom = z.infer<typeof symptomSchema>;
export type SickAnimal = z.infer<typeof sickAnimalSchema>;
export type DrugDef = z.infer<typeof drugDefSchema>;
