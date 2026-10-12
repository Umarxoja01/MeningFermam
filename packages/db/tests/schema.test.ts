import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { schema } from "../src";
import { createTestDb } from "../src/testing";

const { adminUser, userRole, contentItem, contentVersion, publication, review, clinicalAttestation, mediaAsset, auditEvent, session } = schema;

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

const sha = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");

/** Xato sabab matni (Drizzle PostgreSQL xatosini `cause` ichida beradi). */
async function rejects(p: PromiseLike<unknown>, re: RegExp) {
  let msg = "";
  try { await p; } catch (e) { const err = e as Error & { cause?: Error }; msg = `${err.message} ${err.cause?.message ?? ""}`; }
  expect(msg, "xato kutilgan edi").toMatch(re);
}

let n = 0;
async function user(role?: "admin" | "editor" | "clinical") {
  n++;
  const [u] = await t.db.insert(adminUser).values({ login: `+99890000${String(n).padStart(4, "0")}`, name: `Foydalanuvchi ${n}`, passwordHash: "argon2id$test" }).returning();
  if (role) await t.db.insert(userRole).values({ userId: u!.id, role });
  return u!;
}
async function item(type: "contacts" | "page" | "clinical-animals" = "contacts", key = `k${++n}`) {
  const [i] = await t.db.insert(contentItem).values({ type, key, clinical: type === "clinical-animals" }).returning();
  return i!;
}
async function version(itemId: number, authorId: number, number = 1, data: unknown = { n: number }) {
  const [v] = await t.db.insert(contentVersion).values({ itemId, number, data, hash: sha(data), authorId }).returning();
  return v!;
}

describe("migratsiyalar", () => {
  it("12 jadval yaratiladi", async () => {
    const r = await t.pg.query<{ c: number }>("select count(*)::int as c from information_schema.tables where table_schema = 'public'");
    expect(r.rows[0]!.c).toBe(12);
  });
});

describe("admin_user", () => {
  it("login faqat +998XXXXXXXXX", async () => {
    await rejects(t.db.insert(adminUser).values({ login: "admin", name: "X", passwordHash: "h" }), /admin_user_login_phone/);
  });
  it("login takrorlanmaydi", async () => {
    const u = await user();
    await rejects(t.db.insert(adminUser).values({ login: u.login, name: "Y", passwordHash: "h" }), /unique|duplicate/i);
  });
});

describe("content_item", () => {
  it("(tur, kalit) takrorlanmaydi", async () => {
    await item("page", "/yem-rejasi");
    await rejects(t.db.insert(contentItem).values({ type: "page", key: "/yem-rejasi" }), /content_item_type_key|duplicate/i);
  });
  it("klinik tur klinik deb belgilanmasa rad etiladi (va aksincha)", async () => {
    await rejects(t.db.insert(contentItem).values({ type: "clinical-animals", key: "x1", clinical: false }), /content_item_clinical_type/);
    await rejects(t.db.insert(contentItem).values({ type: "contacts", key: "x2", clinical: true }), /content_item_clinical_type/);
  });
});

describe("content_version", () => {
  it("raqam har birlikda takrorlanmaydi; noto'g'ri xesh rad etiladi", async () => {
    const u = await user(); const i = await item();
    await version(i.id, u.id, 1);
    await rejects(version(i.id, u.id, 1), /content_version_item_number|duplicate/i);
    await rejects(t.db.insert(contentVersion).values({ itemId: i.id, number: 2, data: {}, hash: "abc", authorId: u.id }), /content_version_hash_hex/);
  });
  it("o'zgarmas: ma'lumot o'zgarmaydi, o'chirilmaydi; faqat holat o'zgaradi", async () => {
    const u = await user(); const i = await item(); const v = await version(i.id, u.id);
    await rejects(t.db.update(contentVersion).set({ data: { buzildi: true } }).where(eq(contentVersion.id, v.id)), /o'zgarmas/);
    await rejects(t.db.delete(contentVersion).where(eq(contentVersion.id, v.id)), /o'chirilmaydi/);
    await t.db.update(contentVersion).set({ status: "review" }).where(eq(contentVersion.id, v.id));
    const [r] = await t.db.select().from(contentVersion).where(eq(contentVersion.id, v.id));
    expect(r!.status).toBe("review");
  });
});

describe("publication", () => {
  it("har birlikda bitta joriy nashr; boshqa birlikning versiyasi bilan nashr bo'lmaydi", async () => {
    const u = await user(); const a = await item(); const b = await item();
    const va = await version(a.id, u.id); const vb = await version(b.id, u.id);
    await t.db.insert(publication).values({ itemId: a.id, versionId: va.id, publishedBy: u.id });
    await rejects(t.db.insert(publication).values({ itemId: a.id, versionId: va.id, publishedBy: u.id }), /duplicate|publication_pkey/i);
    await rejects(t.db.insert(publication).values({ itemId: b.id, versionId: va.id, publishedBy: u.id }), /publication_version_of_item/);
    await t.db.insert(publication).values({ itemId: b.id, versionId: vb.id, publishedBy: u.id });
  });
});

describe("review va klinik tasdiq (ADMIN_TZ §5.2)", () => {
  it("muallif o'z versiyasini ko'rib chiqa olmaydi", async () => {
    const author = await user("editor"); const other = await user("admin"); const i = await item(); const v = await version(i.id, author.id);
    await rejects(t.db.insert(review).values({ versionId: v.id, reviewerId: author.id, decision: "approved" }), /muallif/);
    await t.db.insert(review).values({ versionId: v.id, reviewerId: other.id, decision: "returned", comment: "Matnni qisqartiring" });
  });
  it("klinik tasdiq faqat klinik kontentga va muallifdan boshqa kishidan", async () => {
    const author = await user("editor"); const vet = await user("clinical");
    const plain = await item("contacts"); const vp = await version(plain.id, author.id);
    const clin = await item("clinical-animals"); const vc = await version(clin.id, author.id);
    const att = { expertName: "Veterinar", expertRole: "veterinar vrach", source: "Yo'riqnoma", approvedOn: "2026-10-12" };
    await rejects(t.db.insert(clinicalAttestation).values({ ...att, versionId: vp.id, reviewerId: vet.id }), /faqat klinik/);
    await rejects(t.db.insert(clinicalAttestation).values({ ...att, versionId: vc.id, reviewerId: author.id }), /muallif/);
    await t.db.insert(clinicalAttestation).values({ ...att, versionId: vc.id, reviewerId: vet.id });
  });
});

describe("media_asset (ADMIN_TZ §4.6)", () => {
  const base = (uploadedBy: number, x: Partial<typeof mediaAsset.$inferInsert>) =>
    ({ path: `m/${++n}`, kind: "image" as const, mime: "image/webp", bytes: 1000, checksum: sha(n), uploadedBy, ...x });
  it("SVG, mos kelmaydigan tur va katta fayl rad etiladi", async () => {
    const u = await user();
    await rejects(t.db.insert(mediaAsset).values(base(u.id, { mime: "image/svg+xml" })), /media_mime_allowed/);
    await rejects(t.db.insert(mediaAsset).values(base(u.id, { kind: "video", mime: "image/png" })), /media_kind_matches_mime/);
    await rejects(t.db.insert(mediaAsset).values(base(u.id, { bytes: 5 * 1024 * 1024 + 1 })), /media_size_limit/);
    await t.db.insert(mediaAsset).values(base(u.id, { kind: "video", mime: "video/mp4", bytes: 30 * 1024 * 1024 }));
  });
});

describe("audit_event (ADMIN_TZ §4.8)", () => {
  it("faqat qo'shiladi: o'zgartirish, o'chirish, tozalash rad etiladi", async () => {
    const u = await user();
    const [e] = await t.db.insert(auditEvent).values({ userId: u.id, action: "login", result: "ok" }).returning();
    await rejects(t.db.update(auditEvent).set({ result: "denied" }).where(eq(auditEvent.id, e!.id)), /faqat qo'shiladi/);
    await rejects(t.db.delete(auditEvent).where(eq(auditEvent.id, e!.id)), /faqat qo'shiladi/);
    await rejects(t.db.execute(sql`truncate audit_event`), /faqat qo'shiladi/);
  });
});

describe("session", () => {
  it("muddati yaratilgan vaqtdan keyin bo'lishi shart", async () => {
    const u = await user();
    await rejects(t.db.insert(session).values({ userId: u.id, tokenHash: sha("t1"), expiresAt: new Date(Date.now() - 1000) }), /session_expiry_after_create/);
    await t.db.insert(session).values({ userId: u.id, tokenHash: sha("t2"), expiresAt: new Date(Date.now() + 3600_000) });
  });
});

describe("oxirgi administrator (ADMIN_TZ §2)", () => {
  it("yagona faol administratorni o'chirib yoki rolsiz qoldirib bo'lmaydi", async () => {
    // alohida baza: boshqa testlardagi administratorlar ta'sir qilmasin
    const own = await createTestDb();
    const [a] = await own.db.insert(adminUser).values({ login: "+998996180300", name: "Egasi", passwordHash: "h" }).returning();
    await own.db.insert(userRole).values({ userId: a!.id, role: "admin" });
    await rejects(own.db.update(adminUser).set({ active: false }).where(eq(adminUser.id, a!.id)), /kamida bitta faol administrator/);
    await rejects(own.db.delete(userRole).where(eq(userRole.userId, a!.id)), /kamida bitta faol administrator/);
    await rejects(own.db.delete(adminUser).where(eq(adminUser.id, a!.id)), /kamida bitta faol administrator/);
    // ikkinchi administrator qo'shilgach, birinchisini o'chirish mumkin
    const [b] = await own.db.insert(adminUser).values({ login: "+998994446544", name: "Ikkinchi", passwordHash: "h" }).returning();
    await own.db.insert(userRole).values({ userId: b!.id, role: "admin" });
    await own.db.update(adminUser).set({ active: false }).where(eq(adminUser.id, a!.id));
    await own.close();
  });
});
