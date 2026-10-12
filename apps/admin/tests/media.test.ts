import { schema } from "@meningfermam/db";
import { createTestDb } from "@meningfermam/db/testing";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Actor } from "@/lib/content/service";
import { getImage, getPublishedImage, imageResponse, listMedia, MAX_IMAGE_BYTES, uploadImage, validateImage } from "@/lib/media/service";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6VcwAAAAASUVORK5CYII=", "base64");
let db: Awaited<ReturnType<typeof createTestDb>>;
let admin: Actor;
let editor: Actor;
let clinical: Actor;
const ctx = () => ({ db: db.db });

async function user(login: string, role: "admin" | "editor" | "clinical"): Promise<Actor> {
  const [created] = await db.db.insert(schema.adminUser).values({ login, name: role, passwordHash: "test-hash" }).returning();
  await db.db.insert(schema.userRole).values({ userId: created!.id, role });
  return { id: created!.id, roles: [role] };
}

beforeAll(async () => {
  db = await createTestDb();
  admin = await user("+998900000301", "admin");
  editor = await user("+998900000302", "editor");
  clinical = await user("+998900000303", "clinical");
});
afterAll(async () => { await db.close(); });

describe("rasmning mazmunini tekshirish", () => {
  it("haqiqiy PNG qabul qilinadi; noto‘g‘ri MIME rad etiladi", () => {
    expect(validateImage(png, "image/png")).toEqual({ ok: true, mime: "image/png" });
    expect(validateImage(png, "image/jpeg").ok).toBe(false);
    expect(validateImage(Buffer.from("<svg onload='alert(1)'></svg>"), "image/png").ok).toBe(false);
    expect(validateImage(Buffer.from("<svg></svg>"), "image/svg+xml").ok).toBe(false);
    expect(validateImage(png, "text/html").ok).toBe(false);
  });
  it("bo‘sh, kesilgan va 2 MB dan katta fayl rad etiladi", () => {
    expect(validateImage(new Uint8Array(), "image/png").ok).toBe(false);
    expect(validateImage(png.subarray(0, 24), "image/png").ok).toBe(false);
    expect(validateImage(new Uint8Array(MAX_IMAGE_BYTES + 1), "image/png").ok).toBe(false);
  });
  it("WebP RIFF uzunligi tekshiriladi", () => {
    const wrong = Buffer.from("RIFF0000WEBPVP8L0000test");
    expect(validateImage(wrong, "image/webp").ok).toBe(false);
  });
});

describe("rasmni bazada saqlash", () => {
  it("klinik tekshiruvchi yuklay olmaydi; rad etish jurnalga yoziladi", async () => {
    expect(await uploadImage(ctx(), clinical, { bytes: png, mime: "image/png" })).toMatchObject({ ok: false, error: "forbidden" });
    expect(await listMedia(ctx(), clinical)).toEqual([]);
    expect(await db.db.select().from(schema.mediaAsset)).toHaveLength(0);
    const [event] = await db.db.select().from(schema.auditEvent).where(eq(schema.auditEvent.action, "media_upload"));
    expect(event).toMatchObject({ userId: clinical.id, result: "denied" });
  });
  it("rasm baytlari bazada saqlanadi va qayta o‘qilganda aynan bir xil", async () => {
    const uploaded = await uploadImage(ctx(), editor, { bytes: png, mime: "image/png" });
    expect(uploaded.ok).toBe(true);
    if (!uploaded.ok) return;
    expect(uploaded.reused).toBe(false);
    expect(uploaded.asset.path).toMatch(/^\/media\/[a-f0-9]{64}$/);
    const [stored] = await db.db.select().from(schema.mediaAsset).where(eq(schema.mediaAsset.id, uploaded.asset.id));
    expect(stored!.contentBytes).toBe(png.toString("base64"));
    const read = await getImage(ctx(), admin, uploaded.asset.checksum);
    expect(read!.mime).toBe("image/png");
    expect(Buffer.from(read!.bytes).equals(png)).toBe(true);
    expect(await getImage(ctx(), clinical, uploaded.asset.checksum)).toBeNull();
    expect(await getImage(ctx(), admin, "../bad")).toBeNull();
  });
  it("bir xil rasm ikki marta yuklansa yangi nusxa yaratilmaydi", async () => {
    const uploaded = await uploadImage(ctx(), admin, { bytes: png, mime: "image/png" });
    expect(uploaded).toMatchObject({ ok: true, reused: true });
    expect(await listMedia(ctx(), admin)).toHaveLength(1);
    const events = await db.db.select().from(schema.auditEvent).where(eq(schema.auditEvent.action, "media_reuse"));
    expect(events).toHaveLength(1);
  });
  it("qoralamadagi rasm ochiq emas; nashrga kiritilgandan keyin ochiladi", async () => {
    const [asset] = await listMedia(ctx(), admin);
    const [item] = await db.db.insert(schema.contentItem).values({ type: "website", key: "media-qa" }).returning();
    const [version] = await db.db.insert(schema.contentVersion).values({ itemId: item!.id, number: 1,
      data: { design: { heroImageUrl: asset!.path } }, hash: "a".repeat(64), authorId: admin.id }).returning();
    expect(await getPublishedImage(ctx(), asset!.checksum)).toBeNull();
    await db.db.insert(schema.publication).values({ itemId: item!.id, versionId: version!.id, publishedBy: admin.id });
    const publicImage = await getPublishedImage(ctx(), asset!.checksum);
    expect(Buffer.from(publicImage!.bytes).equals(png)).toBe(true);
    const response = imageResponse(publicImage!, true);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    expect(await getPublishedImage(ctx(), "b".repeat(64))).toBeNull();
    await db.db.delete(schema.publication).where(eq(schema.publication.itemId, item!.id));
    expect(await getPublishedImage(ctx(), asset!.checksum)).toBeNull();
  });
  it("buzilgan ma’lumot va arxivlangan rasm ko‘rsatilmaydi", async () => {
    const [asset] = await listMedia(ctx(), admin);
    await db.db.update(schema.mediaAsset).set({ contentBytes: "YnJva2Vu" }).where(eq(schema.mediaAsset.id, asset!.id));
    expect(await getImage(ctx(), admin, asset!.checksum)).toBeNull();
    await db.db.update(schema.mediaAsset).set({ contentBytes: png.toString("base64"), deletedAt: new Date() }).where(eq(schema.mediaAsset.id, asset!.id));
    expect(await getImage(ctx(), admin, asset!.checksum)).toBeNull();
    expect(await listMedia(ctx(), admin)).toHaveLength(0);
    expect(await uploadImage(ctx(), admin, { bytes: png, mime: "image/png" })).toMatchObject({ ok: false, error: "invalid" });
  });
});
