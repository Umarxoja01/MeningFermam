import { openDb, schema, type DbHandle } from "@meningfermam/db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { createHash } from "node:crypto";

let database: Promise<DbHandle> | null = null;
const imageMimes = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

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

function serve(bytes: Uint8Array<ArrayBuffer>, mime: string, id: string) {
  return new Response(bytes, { headers: {
    "Content-Type": mime,
    "Content-Length": String(bytes.length),
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Cache-Control": "public, max-age=31536000, immutable",
    "ETag": `"${id}"`,
  } });
}

/** Statik eksportda bitta zararsiz yo‘l. Dinamik rejimda generator yo‘q: GET har so‘rovda bajariladi. */
export const generateStaticParams = process.env.CMS_MODE === "dynamic" ? undefined : () => [{ id: "unavailable" }];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.DATABASE_URL?.trim();
  const apiUrl = process.env.CMS_API_URL?.trim();
  if (process.env.CMS_MODE !== "dynamic" || !(url || apiUrl) || !/^[a-f0-9]{64}$/.test(id)) return new Response("Rasm topilmadi", { status: 404 });
  try {
    if (apiUrl) {
      const endpoint = new URL(`/api/public-media/${id}`, apiUrl);
      if (!["http:", "https:"].includes(endpoint.protocol)) return new Response("Rasm vaqtincha ochilmadi", { status: 503 });
      const remote = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (remote.status === 404) return new Response("Rasm topilmadi", { status: 404 });
      const mime = remote.headers.get("content-type") ?? "";
      if (!remote.ok || !imageMimes.includes(mime) || Number(remote.headers.get("content-length")) > MAX_BYTES) return new Response("Rasm vaqtincha ochilmadi", { status: 503 });
      const bytes = new Uint8Array(await remote.arrayBuffer());
      if (!bytes.length || bytes.length > MAX_BYTES || createHash("sha256").update(bytes).digest("hex") !== id) return new Response("Rasm vaqtincha ochilmadi", { status: 503 });
      return serve(bytes, mime, id);
    }
  database ??= openDb(url!, { max: 1 }).catch((error) => { database = null; throw error; });
  const { db } = await database;
  const { contentVersion, publication } = schema;
  const versions = await db.select({ data: contentVersion.data }).from(publication)
    .innerJoin(contentVersion, eq(contentVersion.id, publication.versionId))
    .where(sql`${contentVersion.data}::text like ${`%${id}%`}`);
  if (!versions.some((version) => referencesMedia(version.data, `/media/${id}`))) return new Response("Rasm topilmadi", { status: 404 });
  const [asset] = await db.select({ content: schema.mediaAsset.contentBytes, mime: schema.mediaAsset.mime, bytes: schema.mediaAsset.bytes })
    .from(schema.mediaAsset).where(and(eq(schema.mediaAsset.checksum, id), isNull(schema.mediaAsset.deletedAt), eq(schema.mediaAsset.kind, "image"))).limit(1);
  if (!asset?.content || !imageMimes.includes(asset.mime) || asset.bytes > MAX_BYTES) {
    return new Response("Rasm topilmadi", { status: 404 });
  }
  const bytes = Buffer.from(asset.content, "base64");
  if (bytes.length !== asset.bytes || createHash("sha256").update(bytes).digest("hex") !== id) return new Response("Rasm topilmadi", { status: 404 });
  return serve(new Uint8Array(bytes), asset.mime, id);
  } catch {
    return new Response("Rasm vaqtincha ochilmadi", { status: 503 });
  }
}
