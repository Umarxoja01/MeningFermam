// Kontent xizmati (ADMIN_TZ §3): qoralama → (ko'rib chiqish) → nashr; har saqlash — yangi o'zgarmas versiya;
// tiklash — eski versiyadan yangi qoralama. Next.js'ga bog'liq emas (testlanadi). Vakolat bu yerda ham tekshiriladi.
import { contentTypes, findContentIssues, type ContentIssue, type ContentType } from "@meningfermam/content";
import { schema, type Db } from "@meningfermam/db";
import { and, desc, eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { Role } from "../auth/service";

const { contentItem, contentVersion, publication, adminUser, auditEvent } = schema;

export type ContentCtx = { db: Db; now?: () => Date };
export type Actor = { id: number; roles: Role[] };
const nowOf = (c: ContentCtx) => (c.now ? c.now() : new Date());

const canEdit = (a: Actor) => a.roles.includes("admin") || a.roles.includes("editor");
const canPublish = (a: Actor) => a.roles.includes("admin");

/** Kalitlari tartiblangan JSON — bir xil ma'lumot bir xil xesh beradi. */
export function canonicalJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v).sort().filter((k) => (v as Record<string, unknown>)[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonicalJson((v as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}
export const contentHash = (v: unknown) => createHash("sha256").update(canonicalJson(v)).digest("hex");

async function audit(c: ContentCtx, userId: number, action: string, objectId: string, versionId: number | null, result: "ok" | "denied") {
  await c.db.insert(auditEvent).values({ at: nowOf(c), userId, action, objectType: "content", objectId, versionId, result });
}

async function itemOf(c: ContentCtx, type: ContentType, key: string) {
  const [i] = await c.db.select().from(contentItem).where(and(eq(contentItem.type, type), eq(contentItem.key, key)));
  return i ?? null;
}

async function ensureItem(c: ContentCtx, type: ContentType, key: string) {
  const found = await itemOf(c, type, key);
  if (found) return found;
  const [i] = await c.db.insert(contentItem).values({ type, key, clinical: contentTypes[type].clinical, createdAt: nowOf(c) })
    .onConflictDoNothing().returning();
  return i ?? (await itemOf(c, type, key))!;
}

export type VersionInfo = { id: number; number: number; status: string; authorName: string; createdAt: Date; published: boolean; hash: string };
export type ItemState = {
  itemId: number | null;
  latest: (VersionInfo & { data: unknown }) | null;
  published: (VersionInfo & { data: unknown; publishedAt: Date; publishedBy: string }) | null;
  versions: VersionInfo[];
};

/** Kontent birligi holati: oxirgi versiya, nashr qilingani, tarix (yangisi yuqorida). */
export async function getState(c: ContentCtx, type: ContentType, key: string): Promise<ItemState> {
  const item = await itemOf(c, type, key);
  if (!item) return { itemId: null, latest: null, published: null, versions: [] };
  const [pub] = await c.db.select({ versionId: publication.versionId, at: publication.publishedAt, by: adminUser.name }).from(publication)
    .innerJoin(adminUser, eq(publication.publishedBy, adminUser.id)).where(eq(publication.itemId, item.id));
  const rows = await c.db.select({ v: contentVersion, author: adminUser.name }).from(contentVersion)
    .innerJoin(adminUser, eq(contentVersion.authorId, adminUser.id)).where(eq(contentVersion.itemId, item.id)).orderBy(desc(contentVersion.number));
  const info = (r: (typeof rows)[number]): VersionInfo => ({
    id: r.v.id, number: r.v.number, status: r.v.status, authorName: r.author, createdAt: r.v.createdAt, published: r.v.id === pub?.versionId, hash: r.v.hash,
  });
  const latest = rows[0] ? { ...info(rows[0]), data: rows[0].v.data } : null;
  const p = rows.find((r) => r.v.id === pub?.versionId);
  return {
    itemId: item.id,
    latest,
    published: p && pub ? { ...info(p), data: p.v.data, publishedAt: pub.at, publishedBy: pub.by } : null,
    versions: rows.map(info),
  };
}

/** Sayt uchun (C6): faqat nashr qilingan ma'lumot. */
export async function getPublished(c: ContentCtx, type: ContentType, key: string): Promise<unknown | null> {
  return (await getState(c, type, key)).published?.data ?? null;
}

export type SaveResult =
  | { ok: true; number: number; unchanged?: boolean }
  | { ok: false; error: "forbidden" | "conflict" | "invalid"; errors?: string[]; latestNumber?: number };

/** Zod xatolarini o'qiladigan matnga. */
function zodErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.slice(0, 20).map((i) => (i.path.length ? `${i.path.join(" → ")}: ${i.message}` : i.message));
}

/**
 * Qoralama saqlash. baseNumber — tahrir boshlangan versiya (yo'q bo'lsa 0). Orada boshqa saqlash bo'lsa — "conflict"
 * (hech kimning o'zgarishi yo'qolmaydi). Ma'lumot o'zgarmagan bo'lsa yangi versiya yaratilmaydi.
 */
export async function saveDraft(c: ContentCtx, actor: Actor, input: { type: ContentType; key: string; data: unknown; baseNumber: number }): Promise<SaveResult> {
  const objectId = `${input.type}:${input.key}`;
  if (!canEdit(actor)) { await audit(c, actor.id, "content_save", objectId, null, "denied"); return { ok: false, error: "forbidden" }; }
  const parsed = contentTypes[input.type].schema.safeParse(input.data);
  if (!parsed.success) return { ok: false, error: "invalid", errors: zodErrors(parsed.error.issues) };
  const item = await ensureItem(c, input.type, input.key);
  try {
    return await c.db.transaction(async (tx) => {
      const [last] = await tx.select().from(contentVersion).where(eq(contentVersion.itemId, item.id)).orderBy(desc(contentVersion.number)).limit(1);
      const lastNumber = last?.number ?? 0;
      if (lastNumber !== input.baseNumber) return { ok: false as const, error: "conflict" as const, latestNumber: lastNumber };
      const hash = contentHash(parsed.data);
      if (last && last.hash === hash) return { ok: true as const, number: lastNumber, unchanged: true };
      const [v] = await tx.insert(contentVersion).values({ itemId: item.id, number: lastNumber + 1, data: parsed.data, hash, authorId: actor.id, createdAt: nowOf(c) }).returning();
      await tx.insert(auditEvent).values({ at: nowOf(c), userId: actor.id, action: "content_save", objectType: "content", objectId, versionId: v!.id, result: "ok" });
      return { ok: true as const, number: v!.number };
    });
  } catch (e) {
    // bir vaqtdagi ikki saqlash: (item, number) unique — ikkinchisi "conflict"
    if (/content_version_item_number|duplicate/i.test(`${(e as Error).message} ${(e as { cause?: Error }).cause?.message ?? ""}`)) {
      return { ok: false, error: "conflict" };
    }
    throw e;
  }
}

/** Muharrir: qoralamani administratorga ko'rib chiqishga yuborish. */
export async function submitForReview(c: ContentCtx, actor: Actor, input: { type: ContentType; key: string; number: number }) {
  if (!canEdit(actor)) return { ok: false as const, error: "forbidden" as const };
  const item = await itemOf(c, input.type, input.key);
  if (!item) return { ok: false as const, error: "notfound" as const };
  const upd = await c.db.update(contentVersion).set({ status: "review" })
    .where(and(eq(contentVersion.itemId, item.id), eq(contentVersion.number, input.number), eq(contentVersion.status, "draft"))).returning({ id: contentVersion.id });
  if (!upd[0]) return { ok: false as const, error: "notfound" as const };
  await audit(c, actor.id, "content_submit", `${input.type}:${input.key}`, upd[0].id, "ok");
  return { ok: true as const };
}

export type PublishResult =
  | { ok: true; number: number }
  | { ok: false; error: "forbidden" | "notfound" | "invalid" | "clinical"; errors?: string[] }
  | { ok: false; error: "confirm"; issues: ContentIssue[] };

/**
 * Nashr (faqat administrator). Nashrdan oldin sxema qayta tekshiriladi va kontent qoidalari (soxta kontakt, narx da'vosi,
 * prognoz…) bo'yicha ogohlantirish beriladi: davom etish uchun aniq tasdiq kerak va bu jurnalga yoziladi (ADMIN_TZ §4.4).
 */
export async function publish(c: ContentCtx, actor: Actor, input: { type: ContentType; key: string; number: number; confirmIssues?: boolean }): Promise<PublishResult> {
  const objectId = `${input.type}:${input.key}`;
  if (!canPublish(actor)) { await audit(c, actor.id, "content_publish", objectId, null, "denied"); return { ok: false, error: "forbidden" }; }
  const item = await itemOf(c, input.type, input.key);
  if (!item) return { ok: false, error: "notfound" };
  // klinik kontent (C4) alohida qoidalar bilan; bu yerda ruxsat yo'q
  if (item.clinical) return { ok: false, error: "clinical" };
  const [v] = await c.db.select().from(contentVersion).where(and(eq(contentVersion.itemId, item.id), eq(contentVersion.number, input.number)));
  if (!v) return { ok: false, error: "notfound" };
  const parsed = contentTypes[input.type].schema.safeParse(v.data);
  if (!parsed.success) return { ok: false, error: "invalid", errors: zodErrors(parsed.error.issues) };
  const issues = findContentIssues(v.data);
  if (issues.length && !input.confirmIssues) return { ok: false, error: "confirm", issues };
  await c.db.transaction(async (tx) => {
    await tx.insert(publication).values({ itemId: item.id, versionId: v.id, publishedBy: actor.id, publishedAt: nowOf(c) })
      .onConflictDoUpdate({ target: publication.itemId, set: { versionId: v.id, publishedBy: actor.id, publishedAt: nowOf(c), clinicalUnverified: false } });
    if (v.status !== "approved") await tx.update(contentVersion).set({ status: "approved" }).where(eq(contentVersion.id, v.id));
    await tx.insert(auditEvent).values({ at: nowOf(c), userId: actor.id, action: issues.length ? "content_publish_with_warnings" : "content_publish", objectType: "content", objectId, versionId: v.id, result: "ok" });
  });
  return { ok: true, number: v.number };
}

/** Tiklash: tanlangan eski versiya ma'lumotidan yangi qoralama (tarix o'chmaydi; nashr alohida). */
export async function restoreAsDraft(c: ContentCtx, actor: Actor, input: { type: ContentType; key: string; fromNumber: number; baseNumber: number }): Promise<SaveResult> {
  const item = await itemOf(c, input.type, input.key);
  if (!item) return { ok: false, error: "invalid", errors: ["Kontent topilmadi"] };
  const [old] = await c.db.select().from(contentVersion).where(and(eq(contentVersion.itemId, item.id), eq(contentVersion.number, input.fromNumber)));
  if (!old) return { ok: false, error: "invalid", errors: ["Versiya topilmadi"] };
  const r = await saveDraft(c, actor, { type: input.type, key: input.key, data: old.data, baseNumber: input.baseNumber });
  if (r.ok && !r.unchanged) await audit(c, actor.id, "content_restore", `${input.type}:${input.key}`, null, "ok");
  return r;
}

export type Change = { path: string; before: unknown; after: unknown };

/** Ikki versiya farqi: o'zgargan maydonlar ro'yxati (oddiy qiymatlar darajasida). */
export function diff(before: unknown, after: unknown, path = ""): Change[] {
  const isObj = (v: unknown) => v !== null && typeof v === "object";
  if (!isObj(before) || !isObj(after) || Array.isArray(before) !== Array.isArray(after)) {
    return canonicalJson(before) === canonicalJson(after) ? [] : [{ path: path || "(hammasi)", before, after }];
  }
  const keys = new Set([...Object.keys(before as object), ...Object.keys(after as object)]);
  const out: Change[] = [];
  for (const k of keys) {
    const p = path ? `${path}.${k}` : k;
    out.push(...diff((before as Record<string, unknown>)[k], (after as Record<string, unknown>)[k], p));
  }
  return out;
}

/** Bitta versiya ma'lumoti (farqni ko'rish uchun). */
export async function getVersion(c: ContentCtx, type: ContentType, key: string, number: number) {
  const item = await itemOf(c, type, key);
  if (!item) return null;
  const [v] = await c.db.select().from(contentVersion).where(and(eq(contentVersion.itemId, item.id), eq(contentVersion.number, number)));
  return v ?? null;
}
