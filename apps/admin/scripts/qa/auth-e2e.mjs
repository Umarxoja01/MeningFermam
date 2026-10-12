// Admin kirish E2E (ADMIN_TZ §9: AQ01–AQ03, AQ06, AQ13). Haqiqiy brauzer (Chromium), production build.
// Tayyorlash: qa:prepare (toza baza, 4 foydalanuvchi) → next start -p 3200 → npm run qa:auth -w apps/admin
import { chromium } from "@playwright/test";
import { Secret, TOTP } from "otpauth";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3200";
const PW = process.env.QA_PASSWORD || "Sinov-yaylov-parol-2026";
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const b = await chromium.launch();
const results = [];
const consoleErrors = [];

async function ctx() {
  const c = await b.newContext({ viewport: { width: 390, height: 900 } });
  const p = await c.newPage();
  p.on("console", (m) => { if (m.type() === "error") consoleErrors.push(`${p.url()} ${m.text()}`); });
  p.on("pageerror", (e) => consoleErrors.push(`${p.url()} ${e}`));
  return { c, p };
}
async function t(id, name, fn) {
  let pass = false, detail = "";
  try { const r = await fn(); pass = r !== false; } catch (e) { detail = String(e).split("\n")[0].slice(0, 300); }
  results.push({ id, name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${id} ${name}${detail ? " — " + detail : ""}`);
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const code = (secret, ts = Date.now()) => TOTP.generate({ secret: Secret.fromBase32(secret), digits: 6, period: 30, timestamp: ts });
/** Keyingi 30 soniyalik oyna boshlanguncha kutish (bitta kod qayta ishlatilmaydi). */
const nextWindow = async (p) => { const ms = TOTP.remaining({ period: 30 }) + 1200; await p.waitForTimeout(ms); };

async function passwordStep(p, login, password = PW) {
  await p.goto(BASE + "/kirish");
  await p.getByLabel("Telefon raqami").fill(login);
  await p.getByLabel("Parol").fill(password);
  // server action javobini kutamiz (xabar oldingi urinishdan qolib ketmasin)
  await Promise.all([p.waitForResponse((r) => r.request().method() === "POST"), p.getByRole("button", { name: "Davom etish" }).click()]);
}
async function setup(p, login) {
  await passwordStep(p, login);
  await p.waitForURL(BASE + "/kirish/sozlash");
  const secret = (await p.getByTestId("totp-secret").innerText()).replace(/\s/g, "");
  await p.getByLabel("Ilovadagi 6 xonali kod").fill(code(secret));
  await p.getByRole("button", { name: "Tasdiqlash" }).click();
  await p.getByRole("status").filter({ hasText: "yoqildi" }).waitFor();
  const recovery = await p.locator(".codes code").allInnerTexts();
  await p.getByRole("link", { name: "Yozib oldim, davom etish" }).click();
  await p.waitForURL(BASE + "/");
  return { secret, recovery };
}
async function mfaLogin(p, login, mfa) {
  await passwordStep(p, login);
  await p.waitForURL(BASE + "/kirish/kod");
  await p.getByLabel("Ilovadagi 6 xonali kod yoki zaxira kod").fill(mfa);
  await p.getByRole("button", { name: "Kirish" }).click();
  await p.waitForURL(BASE + "/");
}

// --- AQ01: kirmagan foydalanuvchi ---
await t("AQ01-a", "Himoyalangan sahifalar kirishga yo'naltiradi", async () => {
  for (const r of ["/", "/hisob", "/kirish/kod", "/kirish/sozlash"]) {
    const res = await fetch(BASE + r, { redirect: "manual" });
    assert([303, 307, 308].includes(res.status) && /\/kirish$/.test(res.headers.get("location") || ""), `${r}: ${res.status} ${res.headers.get("location")}`);
  }
});
await t("AQ01-b", "Xavfsizlik sarlavhalari: no-store, noindex, DENY, nonce'li CSP (unsafe-inline yo'q)", async () => {
  const res = await fetch(BASE + "/kirish");
  const csp = res.headers.get("content-security-policy") || "";
  assert(/private, no-store/.test(res.headers.get("cache-control") || ""), "cache-control");
  assert(/noindex/.test(res.headers.get("x-robots-tag") || ""), "x-robots-tag");
  assert(res.headers.get("x-frame-options") === "DENY", "x-frame-options");
  assert(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/.test(csp) && !/unsafe-inline|unsafe-eval/.test(csp) && /frame-ancestors 'none'/.test(csp), csp);
  const html = await res.text();
  assert(/<script[^>]+nonce="/.test(html), "skriptlarda nonce yo'q");
  const csp2 = (await fetch(BASE + "/kirish")).headers.get("content-security-policy");
  assert(csp2 !== csp, "nonce har so'rovda yangi bo'lishi kerak");
});

// --- birinchi kirish va cookie ---
let owner;
await t("AQ02-a", "Birinchi kirish: parol → QR bilan sozlash → 10 zaxira kod → bosh ekran", async () => {
  const { c, p } = await ctx();
  owner = await setup(p, "+998900000001");
  assert(owner.recovery.length === 10 && owner.recovery.every((x) => /^[a-z2-7]{4}-[a-z2-7]{4}$/.test(x)), owner.recovery.join(","));
  assert((await p.locator("h1").innerText()).includes("Xush kelibsiz, Sinov Egasi"), "bosh ekran");
  const ck = (await c.cookies()).find((x) => x.name === "__Host-mf_admin");
  assert(ck && ck.httpOnly && ck.secure && ck.sameSite === "Strict" && ck.path === "/" && !ck.domain.startsWith("."), JSON.stringify(ck));
  await c.close();
});
await t("AQ02-b", "Keyingi kirish: kodsiz kirib bo'lmaydi; noto'g'ri kod rad; to'g'ri kod bilan kiradi", async () => {
  const { c, p } = await ctx();
  await passwordStep(p, "+998900000001");
  await p.waitForURL(BASE + "/kirish/kod");
  await p.goto(BASE + "/");
  assert(p.url() === BASE + "/kirish", "kod bosqichida bosh ekran ochilmasligi kerak: " + p.url());
  await passwordStep(p, "+998900000001");
  await p.waitForURL(BASE + "/kirish/kod");
  await p.getByLabel("Ilovadagi 6 xonali kod yoki zaxira kod").fill("000000");
  await Promise.all([p.waitForResponse((r) => r.request().method() === "POST"), p.getByRole("button", { name: "Kirish" }).click()]);
  await p.locator(".alert").filter({ hasText: "Kod noto‘g‘ri" }).waitFor();
  await nextWindow(p);
  await p.getByLabel("Ilovadagi 6 xonali kod yoki zaxira kod").fill(code(owner.secret));
  await p.getByRole("button", { name: "Kirish" }).click();
  await p.waitForURL(BASE + "/");
  await c.close();
});
await t("AQ02-c", "Zaxira kod bir marta ishlaydi", async () => {
  const { c, p } = await ctx();
  await mfaLogin(p, "+998900000001", owner.recovery[0]);
  await p.locator("form").filter({ hasText: "Chiqish" }).getByRole("button").click();
  await p.waitForURL(BASE + "/kirish");
  await passwordStep(p, "+998900000001");
  await p.waitForURL(BASE + "/kirish/kod");
  await p.getByLabel("Ilovadagi 6 xonali kod yoki zaxira kod").fill(owner.recovery[0]);
  await p.getByRole("button", { name: "Kirish" }).click();
  await p.locator(".alert").filter({ hasText: "Kod noto‘g‘ri" }).waitFor();
  await c.close();
});

// --- AQ03: blok ---
await t("AQ03", "5 noto'g'ri paroldan keyin blok; to'g'ri parol ham rad; xabar umumiy", async () => {
  const { c, p } = await ctx();
  for (let i = 0; i < 5; i++) {
    await passwordStep(p, "+998900000002", "Notogri-parol-12345");
    await p.locator(".alert").waitFor();
  }
  const msg1 = await p.locator(".alert").innerText();
  await passwordStep(p, "+998900000002");
  const msg2 = await p.locator(".alert").innerText();
  // mavjud bo'lmagan login uchun ham xuddi shunday
  for (let i = 0; i < 6; i++) await passwordStep(p, "+998900009999", "Notogri-parol-12345");
  const msg3 = await p.locator(".alert").innerText();
  await c.close();
  assert(/Urinishlar juda ko‘p/.test(msg2) && msg3 === msg2 && p.url() !== BASE + "/", `${msg1} | ${msg2} | ${msg3}`);
});

// --- AQ06: server action'ni sessiyasiz yoki boshqa saytdan chaqirish ---
await t("AQ06", "Server action: sessiyasiz → kirishga; boshqa Origin → rad", async () => {
  const { c, p } = await ctx();
  const s = await setup(p, "+998900000004");
  await p.goto(BASE + "/hisob");
  // parol formasini noto'g'ri ma'lumot bilan yuborib, action so'rovini ushlaymiz
  const reqP = p.waitForRequest((r) => r.method() === "POST" && !!r.headers()["next-action"]);
  await p.getByLabel("Joriy parol").fill("noto'g'ri-joriy-parol");
  await p.getByLabel("Yangi parol (kamida 12 belgi)").fill("Yangi-sinov-parol-99");
  await p.getByLabel("Yangi parol yana bir marta").fill("Yangi-sinov-parol-99");
  await p.getByLabel("Ilovadagi 6 xonali kod").fill("123456");
  await p.getByRole("button", { name: "Parolni o‘zgartirish" }).click();
  const req = await reqP;
  const h = req.headers();
  const body = req.postDataBuffer();
  const base = { "next-action": h["next-action"], "content-type": h["content-type"], accept: h["accept"] || "text/x-component" };
  if (h["next-router-state-tree"]) base["next-router-state-tree"] = h["next-router-state-tree"];
  // 1) cookie'siz: requireUser → /kirish ga yo'naltirish, hech narsa o'zgarmaydi
  const noCookie = await fetch(BASE + "/hisob", { method: "POST", headers: { ...base, origin: BASE }, body, redirect: "manual" });
  const t1 = await noCookie.text();
  assert(/\/kirish/.test(noCookie.headers.get("x-action-redirect") || "") || /\/kirish/.test(noCookie.headers.get("location") || "") || /\/kirish/.test(t1), `cookie'siz: ${noCookie.status} ${noCookie.headers.get("x-action-redirect")}`);
  // 2) cookie bilan, lekin boshqa saytdan (Origin): Next.js rad etadi
  const cookie = (await c.cookies()).map((x) => `${x.name}=${x.value}`).join("; ");
  const foreign = await fetch(BASE + "/hisob", { method: "POST", headers: { ...base, origin: "https://yovuz.example", cookie }, body, redirect: "manual" });
  assert(foreign.status >= 400, `boshqa Origin: ${foreign.status}`);
  // sessiya hamon ishlaydi (hech narsa buzilmagan)
  await p.goto(BASE + "/");
  assert(p.url() === BASE + "/", "sessiya saqlanishi kerak");
  void s;
  await c.close();
});

// --- AQ13: parol o'zgarsa barcha sessiyalar yopiladi; hamma qurilmalardan chiqish ---
await t("AQ13-a", "Parol o'zgarganda boshqa qurilmadagi sessiya ham yopiladi", async () => {
  const A = await ctx();
  const s = await setup(A.p, "+998900000003");
  const B = await ctx();
  await mfaLogin(B.p, "+998900000003", s.recovery[0]);
  await nextWindow(A.p);
  await A.p.goto(BASE + "/hisob");
  await A.p.getByLabel("Joriy parol").fill(PW);
  await A.p.getByLabel("Yangi parol (kamida 12 belgi)").fill("Yangi-sinov-parol-2027");
  await A.p.getByLabel("Yangi parol yana bir marta").fill("Yangi-sinov-parol-2027");
  await A.p.getByLabel("Ilovadagi 6 xonali kod").fill(code(s.secret));
  await A.p.getByRole("button", { name: "Parolni o‘zgartirish" }).click();
  await A.p.waitForURL(BASE + "/kirish?parol=1");
  await B.p.goto(BASE + "/hisob");
  assert(B.p.url() === BASE + "/kirish", "B sessiyasi yopilmadi: " + B.p.url());
  await passwordStep(B.p, "+998900000003", PW);
  assert(/noto‘g‘ri/.test(await B.p.locator(".alert").innerText()), "eski parol ishlamasligi kerak");
  await passwordStep(B.p, "+998900000003", "Yangi-sinov-parol-2027");
  await B.p.waitForURL(BASE + "/kirish/kod");
  await A.c.close(); await B.c.close();
});
await t("AQ13-b", "“Hamma qurilmalardan chiqish”", async () => {
  const A = await ctx();
  await mfaLogin(A.p, "+998900000001", owner.recovery[1]);
  const B = await ctx();
  await mfaLogin(B.p, "+998900000001", owner.recovery[2]);
  await A.p.goto(BASE + "/hisob");
  const n = await A.p.locator(".sessions li").count();
  await A.p.getByRole("button", { name: "Hamma qurilmalardan chiqish" }).click();
  await A.p.waitForURL(BASE + "/kirish");
  await B.p.goto(BASE + "/");
  assert(n >= 2 && B.p.url() === BASE + "/kirish", `sessiyalar ${n}, B: ${B.p.url()}`);
  await A.c.close(); await B.c.close();
});

await t("CSP", "Brauzer konsolida CSP buzilishi va JS xatosi yo'q", async () => {
  const bad = consoleErrors.filter((e) => !/status of 4\d\d|Failed to load resource/.test(e));
  assert(bad.length === 0, bad.slice(0, 3).join(" | "));
});

await b.close();
const summary = { at: new Date().toISOString(), total: results.length, passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).map((r) => r.id) };
fs.mkdirSync(path.join(ROOT, "docs/qa"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/qa/admin-auth.json"), JSON.stringify({ ...summary, results, consoleErrors }, null, 2));
console.log(JSON.stringify(summary));
process.exit(summary.failed.length ? 1 : 0);
