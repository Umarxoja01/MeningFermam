import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);

export const heroSchema = z.object({
  seal: text(120),
  h1: text(80),
  h1em: text(80),
  sub: text(240),
  cta: z.object({ label: text(40), href: z.string().regex(/^#[a-z]+$/) }),
  floats: z.array(z.object({ icon: text(8), title: text(40), text: text(60) })).max(3),
  trust: z.object({ title: text(200), text: text(240), tags: z.array(text(40)).max(4) }),
});

// --- Ichki sahifalar ---
export const widgetNames = ["feed", "sick", "store", "urgentVet", "pedigree", "farmStats", "animalCard", "compare", "soonList", "contacts"] as const;
const stepSchema = z.object({ title: text(80).optional(), text: text(800) });
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("h2"), text: text(120) }),
  z.object({ type: z.literal("p"), text: text(2000) }),
  z.object({ type: z.literal("steps"), items: z.array(stepSchema).min(1).max(20) }),
  z.object({ type: z.literal("list"), items: z.array(stepSchema).min(1).max(30) }),
  z.object({ type: z.literal("note"), tone: z.enum(["warn", "info"]), title: text(60).optional(), text: text(800) }),
  z.object({ type: z.literal("widget"), name: z.enum(widgetNames) }),
  z.object({ type: z.literal("image"), src: z.string().max(500).refine((s) => /^\/(?!\/)[A-Za-z0-9_./-]+$/.test(s) || /^https:\/\/[^\s<>]+$/.test(s), "rasm manzili noto'g'ri"), alt: text(200) }),
  z.object({ type: z.literal("button"), label: text(60), href: z.string().max(500).refine((s) => /^\/(?!\/)[A-Za-z0-9_./#?-]*$/.test(s) || /^#[a-z0-9-]+$/.test(s) || /^https:\/\/[^\s<>]+$/.test(s), "havola manzili noto'g'ri") }),
  z.object({ type: z.literal("calculator"), toolId: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/) }),
]);
/** "vet:tel" va "telegram:" — aloqadan olinadigan maxsus manzillar. */
const ctaHref = z.string().regex(/^(\/[a-z0-9-]*|vet:tel|telegram:)$/);
export const innerPageSchema = z.object({
  h1: text(90),
  intro: text(400),
  blocks: z.array(blockSchema).max(60),
  cta: z.object({ label: text(60), href: ctaHref }),
});


export type Block = z.infer<typeof blockSchema>;
export type WidgetName = (typeof widgetNames)[number];
