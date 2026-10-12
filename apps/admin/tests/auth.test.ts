import { schema } from "@meningfermam/db";
import { createTestDb } from "@meningfermam/db/testing";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AUTH } from "@/lib/auth/config";
import { decrypt, encrypt, keysFrom } from "@/lib/auth/crypto";
import { isPwned, passwordProblems } from "@/lib/auth/password";
import * as auth from "@/lib/auth/service";
import { totpAt } from "@/lib/auth/totp";

const keys = keysFrom(randomBytes(32).toString("base64"));
let t: Awaited<ReturnType<typeof createTestDb>>;
let clock = Date.parse("2026-10-12T10:00:00Z");
const now = () => new Date(clock);
const tick = (ms: number) => { clock += ms; };
const ctx = () => ({ db: t.db, keys, now });

beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t.close(); });

const PW = "Qoramol-yaylov-2026!";
let seq = 0;
async function newAdmin(role: auth.Role = "admin") {
  seq++;
  const login = `+99890111${String(seq).padStart(4, "0")}`;
  const r = await auth.createAdmin(ctx(), { login, name: `Sinov ${seq}`, password: PW, role });
  if (!r.ok) throw new Error(r.errors.join(", "));
  return { id: r.id, login };
}

/** To'liq kirish: parol → sozlash (birinchi marta) → to'liq sessiya. Sirni qaytaradi. */
async function fullLogin(login: string, ip = "10.0.0.1") {
  const l = await auth.login(ctx(), { login, password: PW, ip });
  if (!l.ok) throw new Error(l.error);
  if (l.stage === "setup") {
    const s = await auth.beginSetup(ctx(), l.token);
    const r = await auth.confirmSetup(ctx(), { token: l.token, code: totpAt(s!.secret, clock) });
    if (!r.ok) throw new Error(r.error);
    return { token: r.token, secret: s!.secret, recovery: r.recoveryCodes };
  }
  throw new Error("setup kutilgan edi");
}

describe("yordamchilar", () => {
  it("telefonni normallashtirish", () => {
    expect(auth.normalizePhone("+998 99 618 03 00")).toBe("+998996180300");
    expect(auth.normalizePhone("996180300")).toBe("+998996180300");
    expect(auth.normalizePhone("admin")).toBeNull();
  });
  it("IP qisqartiriladi", () => {
    expect(auth.ipPrefix("192.168.10.45")).toBe("192.168.10.0/24");
    expect(auth.ipPrefix("::ffff:10.1.2.3")).toBe("10.1.2.0/24");
    expect(auth.ipPrefix("2001:db8:abcd:12::1")).toBe("2001:db8:abcd::/48");
  });
  it("AES-GCM shifr: tiklanadi, buzilsa rad etiladi", () => {
    const s = encrypt(keys, "SIR");
    expect(decrypt(keys, s)).toBe("SIR");
    expect(() => decrypt(keys, s.slice(0, -2) + "AA")).toThrow();
    expect(() => keysFrom("qisqa")).toThrow(/32 baytli/);
  });
  it("parol siyosati", () => {
    expect(passwordProblems("qisqa")).toContain("Parol kamida 12 belgi bo‘lsin");
    expect(passwordProblems("aaaaaaaaaaaaaa").length).toBeGreaterThan(0);
    expect(passwordProblems("x+998996180300y", { login: "+998996180300" })).toContain("Parolda telefon raqamingiz bo‘lmasin");
    expect(passwordProblems(PW, { login: "+998996180300", name: "Egasi" })).toEqual([]);
  });
  it("sizib chiqqan parol: k-anonimlik, internet yo'q bo'lsa null", async () => {
    const calls: string[] = [];
    // "password" SHA-1: 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    const fake = (async (url: string) => { calls.push(url); return new Response("1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493\r\n0000000000000000000000000000000000:0"); }) as unknown as typeof fetch;
    expect(await isPwned("password", fake)).toBe(true);
    expect(calls[0]).toBe("https://api.pwnedpasswords.com/range/5BAA6"); // to'liq xesh yuborilmaydi
    expect(await isPwned("boshqa-parol-xyz", fake)).toBe(false);
    expect(await isPwned("x", (async () => { throw new Error("offline"); }) as unknown as typeof fetch)).toBeNull();
  });
});

describe("administrator yaratish", () => {
  it("noto'g'ri telefon, zaif parol, takroriy login rad etiladi", async () => {
    expect((await auth.createAdmin(ctx(), { login: "123", name: "X", password: PW })).ok).toBe(false);
    expect((await auth.createAdmin(ctx(), { login: "+998901119999", name: "X", password: "qisqa" })).ok).toBe(false);
    const a = await newAdmin();
    expect((await auth.createAdmin(ctx(), { login: a.login, name: "Y", password: PW })).ok).toBe(false);
  });
  it("sizib chiqqan parol rad etiladi (PWNED_CHECK yoqilgan bo'lsa)", async () => {
    const r = await auth.createAdmin({ ...ctx(), pwnedCheck: async () => true }, { login: "+998901118888", name: "Z", password: PW });
    expect(r.ok).toBe(false);
  });
});

describe("kirish oqimi", () => {
  it("birinchi kirish: parol → sozlash → 10 zaxira kod → to'liq sessiya", async () => {
    const a = await newAdmin();
    const l = await auth.login(ctx(), { login: a.login, password: PW, ip: "10.0.0.1" });
    expect(l).toMatchObject({ ok: true, stage: "setup" });
    // oraliq sessiya bilan admin sahifalariga kirib bo'lmaydi
    expect(await auth.getSessionUser(ctx(), (l as { token: string }).token)).toBeNull();
    const f = await fullLogin(a.login);
    expect(f.recovery).toHaveLength(10);
    const u = await auth.getSessionUser(ctx(), f.token);
    expect(u).toMatchObject({ id: a.id, roles: ["admin"] });
  });

  it("keyingi kirish: parol → kod; bitta kod ikki marta ishlamaydi (replay)", async () => {
    const a = await newAdmin();
    const { secret } = await fullLogin(a.login);
    tick(31_000);
    const l = await auth.login(ctx(), { login: a.login, password: PW });
    expect(l).toMatchObject({ ok: true, stage: "mfa" });
    const code = totpAt(secret, clock);
    const ok = await auth.verifyMfa(ctx(), { token: (l as { token: string }).token, code });
    expect(ok.ok).toBe(true);
    const l2 = await auth.login(ctx(), { login: a.login, password: PW });
    const again = await auth.verifyMfa(ctx(), { token: (l2 as { token: string }).token, code });
    expect(again).toEqual({ ok: false, error: "invalid" });
  });

  it("zaxira kod bir marta ishlaydi", async () => {
    const a = await newAdmin();
    const { recovery } = await fullLogin(a.login);
    const l1 = await auth.login(ctx(), { login: a.login, password: PW });
    expect((await auth.verifyMfa(ctx(), { token: (l1 as { token: string }).token, code: recovery[0]!.toUpperCase() })).ok).toBe(true);
    const l2 = await auth.login(ctx(), { login: a.login, password: PW });
    expect(await auth.verifyMfa(ctx(), { token: (l2 as { token: string }).token, code: recovery[0]! })).toEqual({ ok: false, error: "invalid" });
  });

  it("kod bosqichida 5 xato — oraliq sessiya yopiladi", async () => {
    const a = await newAdmin();
    await fullLogin(a.login);
    const l = await auth.login(ctx(), { login: a.login, password: PW });
    const token = (l as { token: string }).token;
    let last;
    for (let i = 0; i < AUTH.mfaMaxAttempts; i++) last = await auth.verifyMfa(ctx(), { token, code: "000000" });
    expect(last).toEqual({ ok: false, error: "expired" });
    expect(await auth.verifyMfa(ctx(), { token, code: "000000" })).toEqual({ ok: false, error: "expired" });
  });

  it("oraliq sessiya 10 daqiqada eskiradi", async () => {
    const a = await newAdmin();
    const { secret } = await fullLogin(a.login);
    const l = await auth.login(ctx(), { login: a.login, password: PW });
    tick(AUTH.pendingMs + 1000);
    expect(await auth.verifyMfa(ctx(), { token: (l as { token: string }).token, code: totpAt(secret, clock) })).toEqual({ ok: false, error: "expired" });
  });
});

describe("cheklovlar (AQ03)", () => {
  it("5 noto'g'ri paroldan keyin blok; to'g'ri parol ham rad; blok o'tgach kiradi; keyingi blok 2 baravar uzun", async () => {
    const a = await newAdmin();
    for (let i = 0; i < AUTH.maxFails - 1; i++) expect(await auth.login(ctx(), { login: a.login, password: "noto'g'ri-parol-123" })).toEqual({ ok: false, error: "invalid" });
    await auth.login(ctx(), { login: a.login, password: "noto'g'ri-parol-123" });
    expect(await auth.login(ctx(), { login: a.login, password: PW })).toEqual({ ok: false, error: "limited" });
    tick(AUTH.lockBaseMs + 1000);
    expect((await auth.login(ctx(), { login: a.login, password: PW })).ok).toBe(true);
    // ikkinchi blok (to'liq kirish bo'lmagani uchun lockCount kamaymagan): 30 daqiqa
    for (let i = 0; i < AUTH.maxFails; i++) await auth.login(ctx(), { login: a.login, password: "noto'g'ri-parol-123" });
    tick(AUTH.lockBaseMs + 1000);
    expect(await auth.login(ctx(), { login: a.login, password: PW })).toEqual({ ok: false, error: "limited" });
    tick(AUTH.lockBaseMs);
    expect((await auth.login(ctx(), { login: a.login, password: PW })).ok).toBe(true);
  });

  it("mavjud bo'lmagan login ham 5 xatodan keyin “cheklangan” (hisob borligi bilinmaydi)", async () => {
    for (let i = 0; i < AUTH.maxFails; i++) await auth.login(ctx(), { login: "+998907777777", password: "xxxxxxxxxxxxxx" });
    expect(await auth.login(ctx(), { login: "+998907777777", password: "xxxxxxxxxxxxxx" })).toEqual({ ok: false, error: "limited" });
  });

  it("bir IP'dan ko'p xato — vaqtincha rad (boshqa IP ishlaydi)", async () => {
    const a = await newAdmin();
    for (let i = 0; i < AUTH.ipMaxFails; i++) await auth.login(ctx(), { login: `+9989055${String(i).padStart(5, "0")}`, password: "xxxxxxxxxxxxxx", ip: "203.0.113.7" });
    expect(await auth.login(ctx(), { login: a.login, password: PW, ip: "203.0.113.99" })).toEqual({ ok: false, error: "limited" });
    expect((await auth.login(ctx(), { login: a.login, password: PW, ip: "198.51.100.1" })).ok).toBe(true);
    tick(AUTH.ipWindowMs + 1000);
  });
});

describe("sessiya muddati", () => {
  it("30 daqiqa harakatsizlikda yopiladi; faollik muddatni uzaytiradi; 12 soatdan keyin baribir yopiladi", async () => {
    const a = await newAdmin();
    const { token } = await fullLogin(a.login);
    tick(AUTH.idleMs - 60_000);
    expect(await auth.getSessionUser(ctx(), token)).not.toBeNull(); // faollik
    tick(AUTH.idleMs - 60_000);
    expect(await auth.getSessionUser(ctx(), token)).not.toBeNull();
    // 12 soatgacha har 20 daqiqada faol
    for (let elapsed = 2 * (AUTH.idleMs - 60_000); elapsed < AUTH.absoluteMs - 20 * 60_000; elapsed += 20 * 60_000) {
      tick(20 * 60_000);
      expect(await auth.getSessionUser(ctx(), token)).not.toBeNull();
    }
    tick(25 * 60_000);
    expect(await auth.getSessionUser(ctx(), token)).toBeNull();
  });
  it("harakatsizlik", async () => {
    const a = await newAdmin();
    const { token } = await fullLogin(a.login);
    tick(AUTH.idleMs + 1000);
    expect(await auth.getSessionUser(ctx(), token)).toBeNull();
  });
  it("faolsizlantirilgan foydalanuvchi sessiyasi ishlamaydi", async () => {
    await newAdmin(); // yagona administrator qolmasin
    const a = await newAdmin("editor");
    const { token } = await fullLogin(a.login);
    await t.db.update(schema.adminUser).set({ active: false }).where(eq(schema.adminUser.id, a.id));
    expect(await auth.getSessionUser(ctx(), token)).toBeNull();
  });
});

describe("chiqish va parol (AQ13)", () => {
  it("chiqish; hamma qurilmalardan chiqish", async () => {
    const a = await newAdmin();
    const s1 = await fullLogin(a.login);
    tick(31_000);
    const l = await auth.login(ctx(), { login: a.login, password: PW });
    const s2 = await auth.verifyMfa(ctx(), { token: (l as { token: string }).token, code: totpAt(s1.secret, clock) });
    expect((await auth.listSessions(ctx(), a.id)).length).toBe(2);
    await auth.logout(ctx(), s1.token);
    expect(await auth.getSessionUser(ctx(), s1.token)).toBeNull();
    expect(await auth.getSessionUser(ctx(), (s2 as { token: string }).token)).not.toBeNull();
    await auth.logoutAll(ctx(), a.id);
    expect(await auth.getSessionUser(ctx(), (s2 as { token: string }).token)).toBeNull();
  });

  it("parol o'zgarsa barcha sessiyalar yopiladi; joriy parol/kod noto'g'ri bo'lsa rad", async () => {
    const a = await newAdmin();
    const s = await fullLogin(a.login);
    tick(31_000);
    const bad = await auth.changePassword(ctx(), { userId: a.id, current: "noto'g'ri", next: "Yangi-parol-yaylov-77", code: totpAt(s.secret, clock) });
    expect(bad.ok).toBe(false);
    tick(31_000);
    const weak = await auth.changePassword(ctx(), { userId: a.id, current: PW, next: "qisqa", code: totpAt(s.secret, clock) });
    expect(weak.ok).toBe(false);
    tick(31_000);
    const ok = await auth.changePassword(ctx(), { userId: a.id, current: PW, next: "Yangi-parol-yaylov-77", code: totpAt(s.secret, clock) });
    expect(ok).toEqual({ ok: true });
    expect(await auth.getSessionUser(ctx(), s.token)).toBeNull();
    expect(await auth.login(ctx(), { login: a.login, password: PW })).toEqual({ ok: false, error: "invalid" });
    expect((await auth.login(ctx(), { login: a.login, password: "Yangi-parol-yaylov-77" })).ok).toBe(true);
  });
});

describe("jurnal va sirlar (AQ12)", () => {
  it("bazada parol, token, TOTP siri yoki zaxira kod ochiq holda yo'q", async () => {
    const a = await newAdmin();
    const f = await fullLogin(a.login);
    const dump = JSON.stringify([
      await t.db.select().from(schema.auditEvent),
      await t.db.select().from(schema.session),
      await t.db.select().from(schema.adminUser),
      await t.db.select().from(schema.recoveryCode),
      await t.db.select().from(schema.loginAttempt),
    ]);
    expect(dump).not.toContain(PW);
    expect(dump).not.toContain(f.token);
    expect(dump).not.toContain(f.secret);
    for (const r of f.recovery) expect(dump).not.toContain(r);
    const actions = (await t.db.select({ a: schema.auditEvent.action }).from(schema.auditEvent)).map((x) => x.a);
    for (const a of ["user_created", "login_password", "mfa_setup", "account_locked", "logout", "password_change"]) expect(actions).toContain(a);
  });
});
