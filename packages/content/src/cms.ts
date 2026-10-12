import { z } from "zod";
import { heroSchema, innerPageSchema } from "./page";
import { evaluateFormula } from "./calculator";

const text = (max = 2000) => z.string().max(max);
const required = (max = 200) => text(max).trim().min(1);
const strings = <const K extends readonly string[]>(keys: K) => z.object(Object.fromEntries(keys.map((key) => [key, text()])) as Record<K[number], z.ZodString>);
const href = text(500).refine((s) => /^\/(?!\/)[A-Za-z0-9_./#?=&%-]*$/.test(s) || /^#[a-z0-9-]+$/.test(s) || /^https:\/\/[^\s<>]+$/.test(s), "Havola / yoki https:// bilan boshlansin");
const asset = text(500).refine((s) => s === "" || /^\/(?!\/)[A-Za-z0-9_./-]+$/.test(s) || /^https:\/\/[^\s<>]+$/.test(s), "Rasm/video manzili noto'g'ri");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Rang #RRGGBB ko'rinishida bo'lsin");
const slug = z.string().regex(/^\/[a-z0-9][a-z0-9-]{1,59}$/).refine((s) => !/^\/(api|media|kirish|kontent|admin|_next)(\/|$)/.test(s), "Bu manzil tizim uchun band");
const button = z.object({ label: required(60), href });

export const cmsToolSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/), title: required(100), description: text(500),
  inputs: z.array(z.object({
    key: z.string().regex(/^[a-z][a-z0-9_]{0,19}$/), label: required(80), unit: text(30),
    min: z.number().finite(), max: z.number().finite(), step: z.number().finite().positive(), defaultValue: z.number().finite(),
  }).refine((i) => i.min < i.max && i.defaultValue >= i.min && i.defaultValue <= i.max, "Maydon chegaralari va boshlang'ich son mos emas")).min(1).max(12),
  formula: required(200).regex(/^[a-z0-9_+*/().\s-]+$/, "Formula faqat maydon nomlari va + − × ÷ qavslardan iborat bo'lsin"),
  resultLabel: required(80), resultUnit: text(30),
}).refine((tool) => new Set(tool.inputs.map((input) => input.key)).size === tool.inputs.length, "Maydon nomlari takrorlanmasin")
  .superRefine((tool, ctx) => {
    try { evaluateFormula(tool.formula, Object.fromEntries(tool.inputs.map((input) => [input.key, input.defaultValue]))); }
    catch (error) { ctx.addIssue({ code: "custom", path: ["formula"], message: error instanceof Error ? error.message : "Formula noto'g'ri" }); }
  });
export type CmsTool = z.infer<typeof cmsToolSchema>;

export const cmsHomeSchema = z.object({
  site: strings(["name", "tagline", "legal"]),
  start: strings(["label", "title", "text", "close"]),
  problems: z.array(z.object({ emoji: text(8), topic: required(30), question: required(90), href: z.string().regex(/^#[a-z]+$/) })).min(1).max(30),
  nav: z.object({
    links: z.array(z.object({ href, label: required(80), vet: z.boolean().optional() })).max(12),
    tabbar: z.array(z.object({ id: required(40), href, icon: text(8), label: required(40), sos: z.boolean().optional() })).max(6),
    footerSections: z.array(button).max(20), footerGuides: z.array(button).max(30),
  }),
  hero: heroSchema,
  yem: strings(["ask", "title", "sub", "animal", "weight", "perDay", "perMonth", "salt", "saltUnit", "pricesSummary", "pricesHint", "pricesReset", "priceUnit", "priceError", "priceNotSaved", "fine"]),
  eslatma: strings(["ask", "title", "sub", "time", "date", "app", "noti", "notiText", "later", "laterDone", "gave", "gaveDone", "doneMsg", "replay"]),
  statistika: z.object({
    chip: text(), title: text(), milkTitle: text(), milk: z.array(z.object({ id: text(40), w: z.number().min(0).max(100), v: text(40), low: z.boolean().optional() })).max(30),
    milkNote: text(), pedigreeTitle: text(), grand: z.array(z.tuple([text(40), text(40)])).max(8), parents: z.array(z.tuple([text(40), text(40)])).max(4), self: text(40), no: text(), yes: text(),
  }),
  yakun: strings(["title", "sub"]), loopText: strings(["pause", "play"]),
});

export const cmsDesignSchema = z.object({
  primary: hex, primaryDark: hex, background: hex, surface: hex, text: hex,
  font: z.enum(["system", "serif"]), fontSize: z.number().int().min(15).max(20), radius: z.number().int().min(10).max(32),
  maxWidth: z.number().int().min(960).max(1440), sectionSpacing: z.number().int().min(24).max(100), heroHeight: z.number().int().min(320).max(680),
  logoUrl: asset, heroImageUrl: asset, heroVideoUrl: asset,
});
export const cmsSectionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{1,59}$/),
  type: z.enum(["hero", "problems", "feed", "sick", "store", "reminder", "stats", "features", "final", "custom", "calculator"]),
  enabled: z.boolean(), title: text(200).optional(), text: text(2000).optional(), image: asset.optional(), button: button.optional(), toolId: text(40).optional(),
});
const widgets = z.object({
  farmStats: z.object({ title: text(), items: z.array(strings(["label", "value"])).max(30) }),
  animalCard: z.object({ title: text(), rows: z.array(strings(["label", "value"])).max(30) }),
  compareHead: strings(["job", "paper", "app", "status"]),
  compareRows: z.array(strings(["job", "paper", "app", "feature"])).max(40),
  soonExtra: strings(["emoji", "title", "note"]), urgentVetText: text(), notFoundText: strings(["h1", "text", "cta"]),
});
export const cmsWebsiteSchema = z.object({
  home: cmsHomeSchema, design: cmsDesignSchema,
  layout: z.array(cmsSectionSchema).min(1).max(40),
  pages: z.record(slug, innerPageSchema),
  seo: z.record(z.string().regex(/^\/$|^\/[a-z0-9][a-z0-9-]{1,59}$/), z.object({ title: required(70), description: required(170) })),
  labels: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9_.-]{0,119}$/), text()), widgets,
  tools: z.array(cmsToolSchema).max(30),
}).superRefine((site, ctx) => {
  if (!site.seo["/"]) ctx.addIssue({ code: "custom", path: ["seo"], message: "Bosh sahifa uchun SEO kerak" });
  if (!site.layout.some((section) => section.enabled)) ctx.addIssue({ code: "custom", path: ["layout"], message: "Kamida bitta bo'lim ko'rinsin" });
  if (new Set(site.layout.map((s) => s.id)).size !== site.layout.length) ctx.addIssue({ code: "custom", path: ["layout"], message: "Bo'lim ID takrorlanmasin" });
  const toolIds = new Set(site.tools.map((t) => t.id));
  if (toolIds.size !== site.tools.length) ctx.addIssue({ code: "custom", path: ["tools"], message: "Hisoblagich ID takrorlanmasin" });
  const builtins = site.layout.filter((s) => s.type !== "custom" && s.type !== "calculator").map((s) => s.type);
  if (new Set(builtins).size !== builtins.length) ctx.addIssue({ code: "custom", path: ["layout"], message: "Asosiy bo'lim ikki marta qo'shilmasin" });
  for (const [i, section] of site.layout.entries()) if (section.type === "calculator" && !toolIds.has(section.toolId ?? "")) ctx.addIssue({ code: "custom", path: ["layout", i], message: "Hisoblagich topilmadi" });
  for (const [path, page] of Object.entries(site.pages)) {
    if (!site.seo[path]) ctx.addIssue({ code: "custom", path: ["seo"], message: `${path} uchun SEO kerak` });
    for (const block of page.blocks) if (block.type === "calculator" && !toolIds.has(block.toolId)) ctx.addIssue({ code: "custom", path: ["pages", path], message: "Hisoblagich topilmadi" });
  }
});
export type CmsWebsite = z.infer<typeof cmsWebsiteSchema>;
