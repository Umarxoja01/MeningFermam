// Admin kontent tahriri E2E (ADMIN_TZ §3, §9: AQ01, AQ04, AQ09–AQ10). Haqiqiy brauzer, production build.
// Tayyorlash: qa:prepare (toza baza, foydalanuvchilar, saytdagi kontent v1) → next start -p 3200 → npm run qa:content
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
/** Ataylab uzilgan so'rov paytidagi xatolar hisobga olinmaydi (AQ04: nashr so'rovini ushlash). */
let ignoreErrors = false;

async function ctx(width = 1280) {
  const c = await b.newContext({ viewport: { width, height: 900 } });
  const p = await c.newPage();
  p.on("console", (m) => { if (m.type() === "error" && !ignoreErrors) consoleErrors.push(`${p.url()} ${m.text()}`); });
  p.on("pageerror", (e) => { if (!ignoreErrors) consoleErrors.push(`${p.url()} ${e}`); });
  return { c, p };
}
async function t(id, name, fn) {
  let pass = false, detail = "";
  try { const r = await fn(); pass = r !== false; } catch (e) { detail = String(e).split("\n")[0].slice(0, 300); }
  results.push({ id, name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${id} ${name}${detail ? " — " + detail : ""}`);
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const code = (secret) => TOTP.generate({ secret: Secret.fromBase32(secret), digits: 6, period: 30 });
const post = (p, click) => Promise.all([p.waitForResponse((r) => r.request().method() === "POST"), click]);

async function loginFresh(p, login) {
  await p.goto(BASE + "/kirish");
  await p.getByLabel("Telefon raqami").fill(login);
  await p.getByLabel("Parol").fill(PW);
  await post(p, p.getByRole("button", { name: "Davom etish" }).click());
  await p.waitForURL(BASE + "/kirish/sozlash");
  const secret = (await p.getByTestId("totp-secret").innerText()).replace(/\s/g, "");
  await p.getByLabel("Ilovadagi 6 xonali kod").fill(code(secret));
  await p.getByRole("button", { name: "Tasdiqlash" }).click();
  await p.getByRole("link", { name: "Yozib oldim, davom etish" }).click();
  await p.waitForURL(BASE + "/");
}
const statusText = (p) => p.locator(".status").innerText();
const save = (p) => post(p, p.getByRole("button", { name: "Qoralama saqlash" }).click());

const owner = await ctx();
await loginFresh(owner.p, "+998900000001");

await t("AQ01", "Kontent sahifalari kirmagan foydalanuvchiga yopiq", async () => {
  for (const r of ["/kontent/aloqa", "/kontent/funksiyalar", "/kontent/savollar"]) {
    const res = await fetch(BASE + r, { redirect: "manual" });
    assert(/\/kirish$/.test(res.headers.get("location") || ""), `${r}: ${res.status}`);
  }
});

await t("C3-01", "Bosh ekran: 3 bo'lim, har biri saytda 1-versiya", async () => {
  await owner.p.goto(BASE + "/");
  const txt = await owner.p.locator(".sections").innerText();
  assert((txt.match(/Saytda: 1-versiya/g) || []).length === 3, txt);
});

await t("C3-02", "Aloqa: qoralama saqlanadi, sayt (nashr) o'zgarmaydi", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await p.getByLabel("Ish vaqti").fill("Har kuni 9:00–20:00");
  await save(p);
  await p.locator(".status").filter({ hasText: "Oxirgi: 2-versiya" }).waitFor();
  const s = await statusText(p);
  assert(/Saytda: 1-versiya/.test(s) && /Qoralama/.test(s), s);
  assert((await p.locator(".preview").innerText()).includes("Har kuni 9:00–20:00"), "ko'rinish yangilanmadi");
});

await t("C3-03", "Noto'g'ri telefon saqlanmaydi (xato ko'rsatiladi, versiya yaratilmaydi)", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await p.getByLabel("Asosiy telefon (+998XXXXXXXXX)").fill("+99899");
  await save(p);
  const err = await p.locator(".savebar .alert").innerText();
  assert(/phone/.test(err), err);
  await p.reload();
  assert(/Oxirgi: 2-versiya/.test(await statusText(p)), "yangi versiya yaratilmasligi kerak edi");
});

await t("C3-04", "Farq: 2-versiya ↔ saytdagi versiya", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa?farq=2");
  const d = await p.locator("#farq").innerText();
  assert(/1 ta o‘zgarish/.test(d) && /hours/.test(d) && /9:00–20:00/.test(d) && /8:00–21:00/.test(d), d);
});

await t("AQ09", "Nashr: saytdagi versiya yangilanadi", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await post(p, p.getByRole("button", { name: "2-versiyani nashr qilish" }).click());
  await p.locator(".status").filter({ hasText: "Saytda: 2-versiya" }).waitFor();
});

await t("AQ10", "Tiklash: 1-versiyadan qoralama (3) → nashr; tarix saqlanadi", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await post(p, p.locator(".versions li", { hasText: "1-versiya" }).getByRole("button", { name: "Shu versiyadan qoralama" }).click());
  await p.locator(".status").filter({ hasText: "Oxirgi: 3-versiya" }).waitFor();
  assert(await p.getByLabel("Ish vaqti").inputValue() === "Har kuni 8:00–21:00", "tahrirlovchi tiklangan ma'lumotni ko'rsatmadi");
  await post(p, p.getByRole("button", { name: "3-versiyani nashr qilish" }).click());
  await p.locator(".status").filter({ hasText: "Saytda: 3-versiya" }).waitFor();
  assert(await p.locator(".versions li").count() === 3, "tarix");
});

await t("C3-05", "Bir vaqtda tahrir: ikkinchi saqlash “conflict” — o'zgarish yo'qolmaydi", async () => {
  const A = owner.p;
  const B = await owner.c.newPage();
  await A.goto(BASE + "/kontent/funksiyalar");
  await B.goto(BASE + "/kontent/funksiyalar");
  await A.getByLabel("Nomi").first().fill("Dori eslatmasi (A)");
  await save(A);
  await A.locator(".status").filter({ hasText: "Oxirgi: 2-versiya" }).waitFor();
  await B.getByLabel("Nomi").first().fill("Dori eslatmasi (B)");
  await save(B);
  const err = await B.locator(".savebar .alert").innerText();
  const kept = await B.getByLabel("Nomi").first().inputValue();
  await B.close();
  assert(/boshqa o‘zgarish saqlangan/.test(err), err);
  assert(kept === "Dori eslatmasi (B)", "B tahriri yo'qolgan: " + kept);
});

await t("C3-06", "Funksiya qo'shish va o'chirish; har tabda kamida bitta bo'lmasa saqlanmaydi", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/funksiyalar");
  const before = await p.locator("fieldset.item").count();
  await p.getByRole("button", { name: "+ Funksiya qo‘shish" }).click();
  await p.locator("fieldset.item").last().getByLabel("Nomi").fill("Video darslar");
  await save(p);
  await p.locator(".status").filter({ hasText: "Oxirgi: 3-versiya" }).waitFor();
  assert(await p.locator("fieldset.item").count() === before + 1, "qo'shilmadi");
  // "Tez kunda"dagi hamma funksiyani "Ishlaydi"ga o'tkazamiz → tab bo'sh qoladi → rad
  for (const sel of await p.locator("fieldset.item select").all()) await sel.selectOption("on");
  await save(p);
  const err = await p.locator(".savebar .alert").innerText();
  assert(/har tabda kamida bitta/.test(err), err);
});

await t("C3-07", "Savol-javob: “bepul” — nashrda ogohlantirish; tasdiq bilan nashr", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/savollar");
  await p.getByLabel("Javob").first().fill("Hozircha xizmat bepul.");
  await save(p);
  await p.locator(".status").filter({ hasText: "Oxirgi: 2-versiya" }).waitFor();
  await post(p, p.getByRole("button", { name: "2-versiyani nashr qilish" }).click());
  const warn = await p.locator(".status .alert").innerText();
  assert(/Xizmat narxi/.test(warn) && /bepul/.test(warn), warn);
  assert(/Saytda: 1-versiya/.test(await statusText(p)), "ogohlantirishda nashr bo'lmasligi kerak");
  await p.getByLabel("Ko‘rdim, baribir nashr qilaman (jurnalga yoziladi)").check();
  await post(p, p.getByRole("button", { name: "Baribir nashr qilish" }).click());
  await p.locator(".status").filter({ hasText: "Saytda: 2-versiya" }).waitFor();
});

let capturedPublish = null;
await t("AQ04", "Muharrir: qoralama va ko'rib chiqishga yuborish mumkin; nashr tugmasi yo'q; to'g'ridan-to'g'ri so'rov ham rad", async () => {
  // administrator nashr so'rovini ushlab olamiz (keyin muharrir cookie'si bilan qayta yuboriladi)
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await p.getByLabel("Ish vaqti").fill("Har kuni 8:00–22:00");
  await save(p);
  await p.locator(".status").filter({ hasText: "Oxirgi: 4-versiya" }).waitFor();
  const reqP = p.waitForRequest((r) => r.method() === "POST" && !!r.headers()["next-action"]);
  ignoreErrors = true;
  await p.route("**/kontent/aloqa", (route) => (route.request().method() === "POST" ? route.abort() : route.continue()));
  await p.getByRole("button", { name: "4-versiyani nashr qilish" }).click();
  const req = await reqP;
  await p.unroute("**/kontent/aloqa");
  capturedPublish = { headers: req.headers(), body: req.postDataBuffer() };
  // tarmoq xatosida o'z xato sahifamiz chiqadi (inline uslubsiz)
  await p.getByRole("heading", { name: "Nimadir xato ketdi" }).waitFor();
  await p.waitForTimeout(300);
  ignoreErrors = false;

  const ed = await ctx(390);
  await loginFresh(ed.p, "+998900000005");
  await ed.p.goto(BASE + "/kontent/aloqa");
  assert(await ed.p.getByRole("button", { name: /nashr qilish/ }).count() === 0, "muharrirda nashr tugmasi bo'lmasligi kerak");
  await ed.p.getByLabel("Ish vaqti").fill("Har kuni 7:00–22:00");
  await save(ed.p);
  await ed.p.locator(".status").filter({ hasText: "Oxirgi: 5-versiya" }).waitFor();
  await post(ed.p, ed.p.getByRole("button", { name: "Administratorga ko‘rib chiqishga yuborish" }).click());
  await ed.p.locator(".status").filter({ hasText: "Ko‘rib chiqishda" }).waitFor();
  // ushlangan nashr so'rovi muharrir cookie'si bilan (4-versiya)
  const cookie = (await ed.c.cookies()).map((x) => `${x.name}=${x.value}`).join("; ");
  const h = capturedPublish.headers;
  const res = await fetch(BASE + "/kontent/aloqa", { method: "POST", headers: { "next-action": h["next-action"], "content-type": h["content-type"], accept: "text/x-component", origin: BASE, cookie }, body: capturedPublish.body, redirect: "manual" });
  const text = await res.text();
  await ed.c.close();
  await p.goto(BASE + "/kontent/aloqa");
  const s = await statusText(p);
  assert(!/nashr qilindi/.test(text) && /Saytda: 3-versiya/.test(s), `javob ${res.status}; holat: ${s}`);
});

await t("AQ09-b", "Administrator ko'rib chiqishdagi versiyani nashr qiladi", async () => {
  const p = owner.p;
  await p.goto(BASE + "/kontent/aloqa");
  await post(p, p.getByRole("button", { name: "5-versiyani nashr qilish" }).click());
  await p.locator(".status").filter({ hasText: "Saytda: 5-versiya" }).waitFor();
  assert((await p.locator(".versions li").first().innerText()).includes("Tasdiqlangan"), "holat");
});

await t("UI", "Bosish yuzasi ≥44 px (390 px, kontent sahifalari) va konsolda xato yo'q", async () => {
  const { c, p } = await ctx(390);
  await c.addCookies(await owner.c.cookies());
  const small = [];
  for (const r of ["/", "/kontent/aloqa", "/kontent/funksiyalar", "/kontent/savollar", "/hisob"]) {
    await p.goto(BASE + r);
    small.push(...(await p.$$eval("a[href], button, input, select, textarea, summary", (els) => els.filter((e) => e.checkVisibility() && e.type !== "hidden").map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute("name") || "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => (x.w < 44 || x.h < 44) && x.t !== ""))).map((x) => ({ r, ...x })));
  }
  await c.close();
  const bad = consoleErrors.filter((e) => !/status of 4\d\d|Failed to load resource|net::ERR_FAILED/.test(e));
  assert(!small.length, JSON.stringify(small.slice(0, 5)));
  assert(!bad.length, bad.slice(0, 3).join(" | "));
});

await owner.c.close();
await b.close();
const summary = { at: new Date().toISOString(), total: results.length, passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).map((r) => r.id) };
fs.mkdirSync(path.join(ROOT, "docs/qa"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/qa/admin-content.json"), JSON.stringify({ ...summary, results, consoleErrors }, null, 2));
console.log(JSON.stringify(summary));
process.exit(summary.failed.length ? 1 : 0);
