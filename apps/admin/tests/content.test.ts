import { schema } from "@meningfermam/db";
import { createTestDb } from "@meningfermam/db/testing";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as content from "@/lib/content/service";

let t: Awaited<ReturnType<typeof createTestDb>>;
let admin: content.Actor, editor: content.Actor, clinical: content.Actor;
const ctx = () => ({ db: t.db });

const contacts = {
  hours: "Har kuni 8:00–21:00", phone: "+998996180300", telegram: "MeningFermamUzb", instagram: "meningfermam", email: null, address: null,
  vets: [{ title: "Veterinar", name: null, phone: "+998994446544", telegram: "Sardorxoja_Vet" }],
};

async function user(login: string, role: "admin" | "editor" | "clinical"): Promise<content.Actor> {
  const [u] = await t.db.insert(schema.adminUser).values({ login, name: role, passwordHash: "h" }).returning();
  await t.db.insert(schema.userRole).values({ userId: u!.id, role });
  return { id: u!.id, roles: [role] };
}

beforeAll(async () => {
  t = await createTestDb();
  admin = await user("+998900000101", "admin");
  editor = await user("+998900000102", "editor");
  clinical = await user("+998900000103", "clinical");
});
afterAll(async () => { await t.close(); });

describe("yordamchilar", () => {
  it("kalit tartibi xeshga ta'sir qilmaydi", () => {
    expect(content.contentHash({ a: 1, b: [1, { y: 2, x: 1 }] })).toBe(content.contentHash({ b: [1, { x: 1, y: 2 }], a: 1 }));
    expect(content.contentHash({ a: 1 })).not.toBe(content.contentHash({ a: 2 }));
  });
  it("farq: faqat o'zgargan maydonlar", () => {
    const after = { ...contacts, hours: "Har kuni 9:00–20:00", vets: [{ ...contacts.vets[0]!, name: "Sardor" }] };
    expect(content.diff(contacts, after)).toEqual([
      { path: "hours", before: "Har kuni 8:00–21:00", after: "Har kuni 9:00–20:00" },
      { path: "vets.0.name", before: null, after: "Sardor" },
    ]);
  });
});

describe("qoralama", () => {
  it("birinchi saqlash — 1-versiya; noto'g'ri ma'lumot rad etiladi va versiya yaratilmaydi", async () => {
    const bad = await content.saveDraft(ctx(), admin, { type: "contacts", key: "asosiy", data: { ...contacts, phone: "+998 __ ___" }, baseNumber: 0 });
    expect(bad).toMatchObject({ ok: false, error: "invalid" });
    expect((bad as { errors: string[] }).errors.join()).toMatch(/phone/);
    const r = await content.saveDraft(ctx(), admin, { type: "contacts", key: "asosiy", data: contacts, baseNumber: 0 });
    expect(r).toEqual({ ok: true, number: 1 });
  });
  it("o'zgarmagan ma'lumot yangi versiya yaratmaydi", async () => {
    expect(await content.saveDraft(ctx(), admin, { type: "contacts", key: "asosiy", data: { ...contacts }, baseNumber: 1 })).toEqual({ ok: true, number: 1, unchanged: true });
  });
  it("orada boshqa saqlash bo'lsa — conflict (o'zgarish yo'qolmaydi)", async () => {
    await content.saveDraft(ctx(), editor, { type: "contacts", key: "asosiy", data: { ...contacts, hours: "A" }, baseNumber: 1 });
    const late = await content.saveDraft(ctx(), admin, { type: "contacts", key: "asosiy", data: { ...contacts, hours: "B" }, baseNumber: 1 });
    expect(late).toEqual({ ok: false, error: "conflict", latestNumber: 2 });
  });
  it("klinik tekshiruvchi oddiy kontentni tahrirlay olmaydi", async () => {
    expect(await content.saveDraft(ctx(), clinical, { type: "faq", key: "asosiy", data: [], baseNumber: 0 })).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("nashr", () => {
  it("faqat administrator nashr qiladi (muharrir — yo'q)", async () => {
    expect(await content.publish(ctx(), editor, { type: "contacts", key: "asosiy", number: 2 })).toEqual({ ok: false, error: "forbidden" });
    expect(await content.publish(ctx(), admin, { type: "contacts", key: "asosiy", number: 1 })).toEqual({ ok: true, number: 1 });
    expect(await content.getPublished(ctx(), "contacts", "asosiy")).toEqual(contacts);
  });
  it("qoralama nashr qilinmaguncha sayt uchun eski versiya qoladi; nashrdan keyin yangisi", async () => {
    const s = await content.getState(ctx(), "contacts", "asosiy");
    expect(s.latest!.number).toBe(2);
    expect(s.published!.number).toBe(1);
    await content.publish(ctx(), admin, { type: "contacts", key: "asosiy", number: 2 });
    expect(((await content.getPublished(ctx(), "contacts", "asosiy")) as typeof contacts).hours).toBe("A");
    const pubs = await t.db.select().from(schema.publication);
    expect(pubs.filter((p) => p.itemId === s.itemId)).toHaveLength(1);
  });
  it("muharrir ko'rib chiqishga yuboradi; administrator nashr qiladi", async () => {
    await content.saveDraft(ctx(), editor, { type: "contacts", key: "asosiy", data: { ...contacts, hours: "Har kuni 8:00–20:00" }, baseNumber: 2 });
    expect(await content.submitForReview(ctx(), editor, { type: "contacts", key: "asosiy", number: 3 })).toEqual({ ok: true });
    expect((await content.getState(ctx(), "contacts", "asosiy")).latest!.status).toBe("review");
    expect(await content.publish(ctx(), admin, { type: "contacts", key: "asosiy", number: 3 })).toEqual({ ok: true, number: 3 });
    expect((await content.getState(ctx(), "contacts", "asosiy")).latest!.status).toBe("approved");
  });
  it("kontent qoidasi buzilsa — ogohlantirish; aniq tasdiq bilan nashr va jurnalga yoziladi", async () => {
    const faq = [{ title: "Narx", items: [{ q: "Pullikmi?", a: "Xizmat bepul." }] }];
    await content.saveDraft(ctx(), admin, { type: "faq", key: "asosiy", data: faq, baseNumber: 0 });
    const r = await content.publish(ctx(), admin, { type: "faq", key: "asosiy", number: 1 });
    expect(r).toMatchObject({ ok: false, error: "confirm" });
    expect((r as { issues: { rule: string }[] }).issues.map((i) => i.rule)).toEqual(["narx"]);
    expect(await content.getPublished(ctx(), "faq", "asosiy")).toBeNull();
    expect(await content.publish(ctx(), admin, { type: "faq", key: "asosiy", number: 1, confirmIssues: true })).toEqual({ ok: true, number: 1 });
    const acts = (await t.db.select({ a: schema.auditEvent.action }).from(schema.auditEvent)).map((x) => x.a);
    expect(acts).toContain("content_publish_with_warnings");
  });
  it("klinik kontent bu bosqichda nashr qilinmaydi", async () => {
    await t.db.insert(schema.contentItem).values({ type: "clinical-drugs", key: "asosiy", clinical: true });
    const [it] = await t.db.select().from(schema.contentItem).where(eq(schema.contentItem.type, "clinical-drugs"));
    await t.db.insert(schema.contentVersion).values({ itemId: it!.id, number: 1, data: {}, hash: content.contentHash({}), authorId: admin.id });
    expect(await content.publish(ctx(), admin, { type: "clinical-drugs", key: "asosiy", number: 1 })).toEqual({ ok: false, error: "clinical" });
  });
});

describe("tiklash (AQ10)", () => {
  it("eski versiyadan yangi qoralama; nashr qilinsa sayt eski ma'lumotni oladi; tarix saqlanadi", async () => {
    const before = await content.getState(ctx(), "contacts", "asosiy");
    const r = await content.restoreAsDraft(ctx(), admin, { type: "contacts", key: "asosiy", fromNumber: 1, baseNumber: before.latest!.number });
    expect(r).toEqual({ ok: true, number: before.latest!.number + 1 });
    await content.publish(ctx(), admin, { type: "contacts", key: "asosiy", number: before.latest!.number + 1 });
    expect(await content.getPublished(ctx(), "contacts", "asosiy")).toEqual(contacts);
    const after = await content.getState(ctx(), "contacts", "asosiy");
    expect(after.versions.map((v) => v.number)).toEqual([4, 3, 2, 1]);
  });
});
