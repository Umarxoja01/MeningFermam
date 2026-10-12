import { schema, type Db } from "@meningfermam/db";
import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import type { Actor } from "../content/service";

/** Vercel'da ham saqlanadi: rasm baytlari umumiy PostgreSQL bazasida. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type ImageMime = (typeof MIME_TYPES)[number];
export type MediaCtx = { db: Db };
export type MediaInfo = { id: number; path: string; mime: string; bytes: number; checksum: string; createdAt: Date };
export type UploadResult = { ok: true; asset: MediaInfo; reused: boolean } | { ok: false; error: "invalid" | "forbidden"; message: string };
export type ImageData = { bytes: Uint8Array<ArrayBuffer>; mime: string; checksum: string };

const canEdit = (actor: Actor) => actor.roles.includes("admin") || actor.roles.includes("editor");
const info = { id: schema.mediaAsset.id, path: schema.mediaAsset.path, mime: schema.mediaAsset.mime, bytes: schema.mediaAsset.bytes,
  checksum: schema.mediaAsset.checksum, createdAt: schema.mediaAsset.createdAt };

/** Kengaytma yoki brauzer MIME'siga yolg'iz ishonilmaydi: fayl imzosi ham tekshiriladi. SVG ruxsat etilmaydi. */
export function validateImage(bytes: Uint8Array, declaredMime: string): { ok: true; mime: ImageMime } | { ok: false; message: string } {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return { ok: false, message: "Rasm hajmi 0 dan katta va 2 MB dan oshmasligi kerak." };
  if (!(MIME_TYPES as readonly string[]).includes(declaredMime)) return { ok: false, message: "Faqat PNG, JPEG yoki WebP rasm yuklang. SVG qabul qilinmaydi." };
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let detected: ImageMime | null = null;
  if (data.length >= 45 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && data.readUInt32BE(8) === 13 && data.toString("ascii", 12, 16) === "IHDR"
    && data.readUInt32BE(16) > 0 && data.readUInt32BE(20) > 0
    && data.toString("ascii", data.length - 8, data.length - 4) === "IEND") detected = "image/png";
  else if (data.length >= 4 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
    && data[data.length - 2] === 0xff && data[data.length - 1] === 0xd9) detected = "image/jpeg";
  else if (data.length >= 20 && data.toString("ascii", 0, 4) === "RIFF" && data.readUInt32LE(4) === data.length - 8
    && data.toString("ascii", 8, 12) === "WEBP" && ["VP8 ", "VP8L", "VP8X"].includes(data.toString("ascii", 12, 16))
    && data.readUInt32LE(16) <= data.length - 20) detected = "image/webp";
  if (detected !== declaredMime) return { ok: false, message: "Fayl mazmuni rasm turiga mos kelmadi. Boshqa PNG, JPEG yoki WebP tanlang." };
  return { ok: true, mime: detected };
}

export async function listMedia(c: MediaCtx, actor: Actor): Promise<MediaInfo[]> {
  if (!canEdit(actor)) return [];
  return c.db.select(info).from(schema.mediaAsset)
    .where(and(isNull(schema.mediaAsset.deletedAt), isNotNull(schema.mediaAsset.contentBytes), eq(schema.mediaAsset.kind, "image"))).orderBy(desc(schema.mediaAsset.createdAt)).limit(100);
}

async function imageOf(c: MediaCtx, checksum: string): Promise<ImageData | null> {
  if (!/^[a-f0-9]{64}$/.test(checksum)) return null;
  const [asset] = await c.db.select({ content: schema.mediaAsset.contentBytes, mime: schema.mediaAsset.mime, bytes: schema.mediaAsset.bytes })
    .from(schema.mediaAsset).where(and(eq(schema.mediaAsset.checksum, checksum), isNull(schema.mediaAsset.deletedAt), eq(schema.mediaAsset.kind, "image"))).limit(1);
  if (!asset?.content || asset.bytes > MAX_IMAGE_BYTES || !(MIME_TYPES as readonly string[]).includes(asset.mime)) return null;
  const bytes = Buffer.from(asset.content, "base64");
  if (bytes.length !== asset.bytes || createHash("sha256").update(bytes).digest("hex") !== checksum) return null;
  return { bytes: new Uint8Array(bytes), mime: asset.mime, checksum };
}

/** Admin oldindan ko‘rishi uchun. Faqat saqlangan va xeshi mos rasm. */
export async function getImage(c: MediaCtx, actor: Actor, checksum: string): Promise<ImageData | null> {
  return canEdit(actor) ? imageOf(c, checksum) : null;
}

function referencesMedia(value: unknown, path: string): boolean {
  if (typeof value === "string") {
    if (value === path) return true;
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && url.pathname === path; }
    catch { return false; }
  }
  if (Array.isArray(value)) return value.some((item) => referencesMedia(item, path));
  if (value && typeof value === "object") return Object.values(value).some((item) => referencesMedia(item, path));
  return false;
}

/** Ochiq saytga faqat nashrga kiritilgan rasm chiqadi. Qoralamadagi rasmlar admin ichida qoladi. */
export async function getPublishedImage(c: MediaCtx, checksum: string): Promise<ImageData | null> {
  if (!/^[a-f0-9]{64}$/.test(checksum)) return null;
  const { contentVersion, publication } = schema;
  const versions = await c.db.select({ data: contentVersion.data }).from(publication)
    .innerJoin(contentVersion, eq(contentVersion.id, publication.versionId))
    .where(sql`${contentVersion.data}::text like ${`%${checksum}%`}`);
  if (!versions.some((version) => referencesMedia(version.data, `/media/${checksum}`))) return null;
  return imageOf(c, checksum);
}

export function imageResponse(image: ImageData, publicCache = false): Response {
  return new Response(image.bytes, { headers: {
    "Content-Type": image.mime,
    "Content-Length": String(image.bytes.length),
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Cache-Control": publicCache ? "public, max-age=31536000, immutable" : "private, no-store",
    ...(publicCache ? { "ETag": `"${image.checksum}"` } : {}),
  } });
}

/** Yuklash va jurnal bitta tranzaksiyada; bir xil rasm yangi nusxa yaratmaydi. */
export async function uploadImage(c: MediaCtx, actor: Actor, input: { bytes: Uint8Array; mime: string }): Promise<UploadResult> {
  if (!canEdit(actor)) {
    await c.db.insert(schema.auditEvent).values({ userId: actor.id, action: "media_upload", objectType: "media", result: "denied" });
    return { ok: false, error: "forbidden", message: "Rasm yuklash uchun ruxsat yo‘q." };
  }
  const validation = validateImage(input.bytes, input.mime);
  if (!validation.ok) return { ok: false, error: "invalid", message: validation.message };
  const data = Buffer.from(input.bytes);
  const checksum = createHash("sha256").update(data).digest("hex");
  const path = `/media/${checksum}`;
  return c.db.transaction(async (tx) => {
    const [inserted] = await tx.insert(schema.mediaAsset).values({ path, kind: "image", mime: validation.mime,
      bytes: data.length, checksum, contentBytes: data.toString("base64"), uploadedBy: actor.id }).onConflictDoNothing().returning(info);
    const [existing] = inserted ? [] : await tx.select(info).from(schema.mediaAsset)
      .where(and(eq(schema.mediaAsset.checksum, checksum), isNull(schema.mediaAsset.deletedAt)));
    const asset = inserted ?? existing;
    if (!asset) return { ok: false as const, error: "invalid" as const, message: "Bu rasm arxivlangan. Boshqa rasm tanlang." };
    await tx.insert(schema.auditEvent).values({ userId: actor.id, action: inserted ? "media_upload" : "media_reuse",
      objectType: "media", objectId: String(asset.id), result: "ok" });
    return { ok: true as const, asset, reused: !inserted };
  });
}
