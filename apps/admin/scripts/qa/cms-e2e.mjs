// Yangi CMS uchun haqiqiy brauzer E2E. Faqat cms-prepare yaratgan alohida test bazasi/account bilan ishlating.
// ADMIN_URL=:4320, SITE_URL=:4310, QA_CONFIG=apps/admin/.data/qa-cms-config.json.
// PLAYWRIGHT_CHANNEL=msedge va OUT_FILE bilan brauzer/hisobot tanlanadi; maxfiy qiymatlar chiqarilmaydi.
import { chromium, expect } from "@playwright/test";
import { Secret, TOTP } from "otpauth";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { deflateSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const ADMIN = (process.env.ADMIN_URL || "http://localhost:4320").replace(/\/$/, "");
const SITE = (process.env.SITE_URL || "http://localhost:4310").replace(/\/$/, "");
const CONFIG_FILE = process.env.QA_CONFIG ? path.resolve(process.env.QA_CONFIG) : path.resolve(import.meta.dirname, "../../.data/qa-cms-config.json");
const OUT = process.env.OUT_FILE ? path.resolve(process.env.OUT_FILE) : path.join(ROOT, "docs/qa/cms-e2e-2026-10-13.json");
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
if (!config.QA_LOGIN || !config.QA_PASSWORD || !/^pglite:.*qa-cms-\d+/.test(config.DATABASE_URL || "")) {
  throw new Error("Alohida cms-prepare test bazasi va generated test account kerak.");
}
// Hatto xato tafsiloti yoki Playwright call log ichiga tushsa ham test kaliti/paroli chiqarilmaydi.
const sensitive = Object.values(config).filter((value) => typeof value === "string" && value.length > 3);
function safe(value) {
  let result = String(value);
  for (const secret of sensitive) result = result.replaceAll(secret, "[yashirilgan]");
  return result;
}

async function launchBrowser() {
  if (process.env.PLAYWRIGHT_CHANNEL) return chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
  try { return await chromium.launch(); }
  catch (original) {
    if (!/Executable doesn't exist/.test(String(original))) throw original;
    for (const channel of ["msedge", "chrome"]) {
      try { return await chromium.launch({ channel }); } catch { /* keyingi o'rnatilgan brauzer */ }
    }
    throw original;
  }
}

// To'liq PNG: imzo, IHDR, siqilgan 1×1 RGBA piksel, CRC va IEND.
function fixturePng() {
  const crc = (data) => {
    let value = 0xffffffff;
    for (const byte of data) {
      value ^= byte;
      for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
    }
    return (value ^ 0xffffffff) >>> 0;
  };
  const chunk = (name, data) => {
    const kind = Buffer.from(name);
    const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc(Buffer.concat([kind, data])));
    return Buffer.concat([size, kind, data, checksum]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(1, 0); header.writeUInt32BE(1, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.from([0, 70, 120, 160, 255]))), chunk("IEND", Buffer.alloc(0))]);
}

const browser = await launchBrowser();
const owner = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
const visitor = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
const anonymous = await browser.newContext();
const admin = await owner.newPage();
const site = await visitor.newPage();
const errors = [];
for (const page of [admin, site]) page.on("pageerror", (error) => errors.push(safe(error)));
const publicNavigations = [];
site.on("response", (response) => {
  const request = response.request();
  if (request.resourceType() === "document" || request.headers().rsc === "1") {
    publicNavigations.push({ path: new URL(response.url()).pathname, type: request.resourceType() === "document" ? "document" : "rsc", status: response.status() });
  }
});
const results = [];
const screenshots = [];
const steps = [];
const step = (id, name, run) => steps.push({ id, name, run });
const cleanNumber = (text) => Number(text.replace(/[^\d.-]/g, ""));
let baseline;
let initialVersion;
let customId;
let mediaPath;
const png = fixturePng();
const heroText = "CMS sinov: fermangiz hisobini boshqaring.";
const primary = "#2456aa";
const sectionTitle = "CMS sinov bo‘limi";
const sectionText = "Bu qo‘shimcha bo‘lim boshqaruv panelidan yaratildi.";
const newPath = "/qa-cms-e2e";
const pageTitle = "CMS sinov qo‘llanmasi";
const paragraph = "Yangi sahifaning matni boshqaruv panelidan yozildi.";
const toolTitle = "CMS xarajat hisobi";

const post = (page, click) => Promise.all([page.waitForResponse((response) => response.request().method() === "POST", { timeout: 20000 }), click]);
const tab = (name) => admin.getByRole("tab", { name, exact: true }).click();
function accordion(title) {
  return admin.locator("details.editor-accordion").filter({ has: admin.locator("summary").filter({ hasText: new RegExp(`^${title}$`) }) });
}
function pageAccordion(pagePath = newPath) {
  return admin.locator("details.editor-accordion").filter({ has: admin.locator("summary .section-id").filter({ hasText: new RegExp(`^${pagePath}$`) }) });
}
const layoutItem = (title) => admin.locator("#website-panel fieldset.section-item").filter({ has: admin.locator("legend").filter({ hasText: new RegExp(`^\\d+\\. ${title}$`) }) });
async function save() {
  const number = Number(await admin.locator("form.savebar input[name=base]").inputValue()) + 1;
  await post(admin, admin.getByRole("button", { name: "Qoralama saqlash", exact: true }).click());
  await expect(admin.locator(".status")).toContainText(`Oxirgi: ${number}-versiya`, { timeout: 15000 });
  await expect(admin.locator("form.savebar input[name=base]")).toHaveValue(String(number));
  return number;
}
async function publish() {
  const number = Number(await admin.locator("form.savebar input[name=base]").inputValue());
  await post(admin, admin.getByRole("button", { name: `${number}-versiyani nashr qilish`, exact: true }).click());
  await expect(admin.locator(".status")).toContainText(`Saytda: ${number}-versiya`, { timeout: 15000 });
  await expect(admin.locator(".status")).not.toContainText(`Oxirgi: ${number}-versiya`);
  return number;
}
async function publicHome() {
  const response = await site.goto(SITE + "/", { waitUntil: "networkidle" });
  expect(response.status(), "Ommaviy bosh sahifa").toBe(200);
}
const themeColor = () => site.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--green").trim().toLowerCase());
async function published() {
  const response = await anonymous.request.get(ADMIN + "/api/site-content");
  expect(response.status(), "Nashr API javobi").toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const data = await response.json();
  expect(Object.keys(data).sort()).toEqual(["contacts", "faqGroups", "features", "website"]);
  const raw = JSON.stringify(data);
  for (const value of sensitive) expect(raw.includes(value), "Nashr API maxfiy test qiymatini qaytarmaydi").toBe(false);
  const inspect = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      expect(/password|secret|session|cookie|database|enc.?key|access.?token|recovery.?code/i.test(key), "Ochiq kontent ichida maxfiy maydon yo‘q").toBe(false);
      inspect(child);
    }
  };
  inspect(data);
  return data;
}

step("CMS01", "Kirmagan foydalanuvchi admin sahifalariga kira olmaydi; nashr API ommaviy kontentgina beradi", async () => {
  for (const route of ["/", "/kontent/sayt", "/media"]) {
    const response = await anonymous.request.get(ADMIN + route, { maxRedirects: 0 });
    expect([303, 307, 308].includes(response.status()), `${route} redirect`).toBe(true);
    expect(new URL(response.headers().location, ADMIN).pathname).toBe("/kirish");
  }
  baseline = (await published()).website;
  await publicHome();
  await expect(site.locator(".hero h1")).toContainText(baseline.home.hero.h1);
  expect(await themeColor()).toBe(baseline.design.primary.toLowerCase());
});

step("CMS02", "Noto‘g‘ri parol rad etiladi", async () => {
  await admin.goto(ADMIN + "/kirish");
  await admin.getByLabel("Telefon raqami").fill(config.QA_LOGIN);
  await admin.getByLabel("Parol", { exact: true }).fill(config.QA_PASSWORD + "-xato");
  await post(admin, admin.getByRole("button", { name: "Davom etish", exact: true }).click());
  await expect(admin.locator('.alert[role="alert"]')).toBeVisible();
  expect(new URL(admin.url()).pathname).toBe("/kirish");
  expect((await owner.request.get(ADMIN + "/kontent/sayt", { maxRedirects: 0 })).status()).toBe(307);
});

step("CMS03", "To‘g‘ri parol → TOTP sozlash → boshqaruv paneli", async () => {
  // Server action tugagach uncontrolled login maydoni tiklanadi; keyingi urinishga ikkala maydonni to'ldiramiz.
  await admin.getByLabel("Telefon raqami").fill(config.QA_LOGIN);
  await admin.getByLabel("Parol", { exact: true }).fill(config.QA_PASSWORD);
  await admin.getByRole("button", { name: "Davom etish", exact: true }).click();
  await admin.waitForURL(ADMIN + "/kirish/sozlash");
  const secret = (await admin.getByTestId("totp-secret").innerText()).replace(/\s/g, "");
  sensitive.push(secret);
  expect(/^[A-Z2-7]+$/.test(secret), "Sozlash kaliti Base32").toBe(true);
  const code = TOTP.generate({ secret: Secret.fromBase32(secret), digits: 6, period: 30 });
  sensitive.push(code);
  await admin.getByLabel("Ilovadagi 6 xonali kod", { exact: true }).fill(code);
  await admin.getByRole("button", { name: "Tasdiqlash", exact: true }).click();
  await expect(admin.getByRole("status")).toContainText("Ikki bosqichli kirish yoqildi");
  await expect(admin.locator(".codes code")).toHaveCount(10);
  sensitive.push(...await admin.locator(".codes code").allInnerTexts());
  await admin.getByRole("link", { name: "Yozib oldim, davom etish", exact: true }).click();
  await admin.waitForURL(ADMIN + "/");
  await expect(admin.locator("h1")).toContainText("CMS Sinov");
  await admin.goto(ADMIN + "/kontent/sayt");
  initialVersion = Number(await admin.locator("form.savebar input[name=base]").inputValue());
  await expect(admin.locator(".status")).toContainText(`Saytda: ${initialVersion}-versiya`);
});

step("CMS04", "Sarlavha/rang qoralamasi saqlanadi, ommaviy sayt eski holatda qoladi", async () => {
  await admin.getByLabel("Asosiy rang", { exact: true }).fill(primary);
  await tab("Bosh sahifa");
  const hero = accordion("Birinchi ekran");
  await hero.locator("summary").click();
  await hero.getByLabel("Asosiy sarlavha", { exact: false }).fill(heroText);
  await save();
  await publicHome();
  await expect(site.locator(".hero h1")).toContainText(baseline.home.hero.h1);
  await expect(site.locator(".hero h1")).not.toContainText(heroText);
  expect(await themeColor()).toBe(baseline.design.primary.toLowerCase());
  expect((await published()).website.home.hero.h1).toBe(baseline.home.hero.h1);
});

step("CMS05", "Nashrdan keyin sayt yangilangan sarlavha va rangni ko‘rsatadi", async () => {
  await publish();
  // CMS04 da ochilgan tabni yangilamasdan: ichki navigatsiya ham eng yangi nashrni olishi kerak.
  await site.locator('footer a[href="/savollar"]').click();
  await site.waitForURL(SITE + "/savollar");
  await site.locator("header .logo").click();
  await site.waitForURL(SITE + "/");
  await expect(site.locator(".hero h1")).toContainText(heroText);
  await expect.poll(themeColor, { message: "Oldin ochilgan tabda yangi nashr rangi" }).toBe(primary);
  await publicHome();
  await expect(site.locator(".hero h1")).toContainText(heroText);
  expect(await themeColor()).toBe(primary);
  const rgb = await site.locator(".hero .hbtns .btn").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(rgb).toBe("rgb(36, 86, 170)");
  const data = (await published()).website;
  expect(data.home.hero.h1).toBe(heroText);
  expect(data.design.primary).toBe(primary);
});

step("CMS06", "Qo‘shimcha bo‘lim yaratish/tartibini almashtirish va tayyor bo‘lim/menyuni yashirish", async () => {
  await tab("Bo‘limlar");
  await admin.getByRole("button", { name: "+ Bo‘lim qo‘shish", exact: true }).click();
  const custom = layoutItem("Qo‘shimcha bo‘lim");
  await custom.getByLabel("Bo‘lim sarlavhasi").fill(sectionTitle);
  await custom.getByLabel("Bo‘lim matni").fill(sectionText);
  customId = (await custom.locator("code").innerText()).replace(/^#/, "");
  const count = await admin.locator("#website-panel fieldset.section-item").count();
  for (let i = 0; i < count - 2; i++) await custom.getByRole("button", { name: "Qo‘shimcha bo‘lim: yuqoriga", exact: true }).click();
  await expect(custom.locator("legend")).toHaveText("2. Qo‘shimcha bo‘lim");
  await layoutItem("Yem hisoblagichi").getByLabel("Saytda ko‘rsatish", { exact: true }).uncheck();
  await save();
  await publish();
  await publicHome();
  await expect(site.locator(`#${customId}`)).toContainText(sectionTitle);
  await expect(site.locator(`#${customId}`)).toContainText(sectionText);
  const ids = await site.locator("main > section").evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(ids[1], "Nashrdagi ikkinchi bo‘lim").toBe(customId);
  await expect(site.locator("#yem")).toHaveCount(0);
  await expect(site.locator('a[href="#yem"], a[href="/#yem"]'), "Hero, kartochka va menyuda yashirilgan yemga havola yo‘q").toHaveCount(0);
});

step("CMS07", "Qo‘shimcha bo‘limni yashirish va qayta ko‘rsatish nashrda ishlaydi", async () => {
  await tab("Bo‘limlar");
  await layoutItem("Qo‘shimcha bo‘lim").getByLabel("Saytda ko‘rsatish", { exact: true }).uncheck();
  await save(); await publish(); await publicHome();
  await expect(site.locator(`#${customId}`)).toHaveCount(0);
  await tab("Bo‘limlar");
  await layoutItem("Qo‘shimcha bo‘lim").getByLabel("Saytda ko‘rsatish", { exact: true }).check();
  await save(); await publish(); await publicHome();
  await expect(site.locator(`#${customId}`)).toContainText(sectionTitle);
});

step("CMS08", "Yangi sahifa, matn/tugma, footer havolasi va o‘z hisoblagichini yaratish; qoralama hali 404", async () => {
  await tab("Hisoblagichlar");
  await admin.getByRole("button", { name: "+ Hisoblagich yaratish", exact: true }).click();
  const tool = admin.locator("#website-panel section.card").filter({ has: admin.getByLabel("Hisoblagich nomi") }).last();
  await tool.getByLabel("Hisoblagich nomi").fill(toolTitle);
  await expect(tool.getByLabel("Hisoblash formulasi")).toHaveValue("bosh * narx");
  expect(cleanNumber(await tool.locator(".preview-note strong").innerText())).toBe(1000);
  await tab("Sahifalar");
  await admin.getByLabel("Yangi sahifa manzili").fill(newPath);
  await admin.getByRole("button", { name: "+ Sahifa yaratish", exact: true }).click();
  const detail = pageAccordion();
  await detail.locator("summary").click();
  await detail.getByLabel("Sahifa sarlavhasi").fill(pageTitle);
  await detail.getByLabel("Kirish matni").fill("Boshqaruvdan yaratilgan sahifa va hisoblagichning sinovi.");
  const blocks = detail.locator(".accordion-body > .block-list");
  await blocks.locator(":scope > fieldset.item").first().getByLabel("Matn", { exact: false }).fill(paragraph);
  await blocks.getByRole("button", { name: "+ Tugma", exact: true }).click();
  const button = blocks.locator(":scope > fieldset.item").nth(1);
  await button.getByLabel("Tugma yozuvi").fill("CMS aloqa tugmasi");
  await button.getByLabel("Tugma havolasi").fill("/aloqa");
  await blocks.getByRole("button", { name: "+ O‘z hisoblagichim", exact: true }).click();
  await blocks.getByLabel("Hisoblagich", { exact: false }).selectOption({ label: toolTitle });
  await detail.getByLabel("Pastki menyuda havolasini ko‘rsatish", { exact: true }).check();
  await tab("Bosh sahifa");
  const nav = accordion("Menyu va pastki havolalar");
  await nav.locator("summary").click();
  const topLinks = nav.locator("fieldset.item").filter({ has: admin.locator("legend").filter({ hasText: /^Asosiy menyu$/ }) });
  await topLinks.getByRole("button", { name: "+ Band qo‘shish", exact: true }).click();
  const newLink = topLinks.locator(":scope > .section-item").last();
  await newLink.getByLabel("Yozuv").fill("CMS qo‘llanma");
  await newLink.getByLabel("Havola").fill(newPath);
  await save();
  const response = await site.goto(SITE + newPath, { waitUntil: "networkidle" });
  expect(response.status(), "Qoralamadagi sahifa ochilmaydi").toBe(404);
  expect((await published()).website.pages[newPath]).toBeUndefined();
});

step("CMS09", "Yangi sahifa/kalkulyator ishlaydi; sahifa o‘chirilganda menyu va footer havolalari ketadi", async () => {
  await publish();
  await publicHome();
  const link = site.locator(`footer a[href="${newPath}"]`);
  await expect(link).toHaveText(pageTitle);
  await expect(site.locator(`header a[href="${newPath}"]`)).toHaveText("CMS qo‘llanma");
  await link.click();
  await site.waitForURL(SITE + newPath);
  await expect(site.locator("main h1")).toHaveText(pageTitle);
  await expect(site.locator("main")).toContainText(paragraph);
  await expect(site.getByRole("link", { name: "CMS aloqa tugmasi", exact: true })).toHaveAttribute("href", "/aloqa");
  const calc = site.locator(".custom-calculator");
  await expect(calc.locator("h3")).toHaveText(toolTitle);
  expect(cleanNumber(await calc.locator(".out strong").innerText())).toBe(1000);
  await calc.getByLabel("Bosh soni").fill("3");
  await calc.getByLabel("Bir boshga xarajat").fill("2500");
  await expect.poll(async () => cleanNumber(await calc.locator(".out strong").innerText())).toBe(7500);
  await calc.getByLabel("Bosh soni").fill("0");
  await expect(calc.locator(".out .err")).toBeVisible();
  await expect(calc.locator(".out strong")).toHaveCount(0);
  await calc.getByLabel("Bosh soni").fill("2");
  await expect.poll(async () => cleanNumber(await calc.locator(".out strong").innerText())).toBe(5000);
  expect((await visitor.request.get(SITE + newPath)).status()).toBe(200);
  // Faqat cms-prepare yaratgan alohida test bazasidagi nusxalar o'chiriladi.
  await tab("Sahifalar");
  for (const pagePath of [newPath, "/maxfiylik"]) {
    const detail = pageAccordion(pagePath);
    await detail.locator("summary").click();
    await detail.getByRole("button", { name: "Sahifani o‘chirish", exact: true }).click();
    await expect(pageAccordion(pagePath)).toHaveCount(0);
  }
  await save();
  expect((await visitor.request.get(SITE + newPath)).status(), "O‘chirish qoralamasi nashrgacha sahifani saqlaydi").toBe(200);
  await publish(); await publicHome();
  await expect(site.locator(`a[href="${newPath}"]`)).toHaveCount(0);
  await expect(site.locator('footer a[href="/maxfiylik"]')).toHaveCount(0);
  await expect(site.locator('footer a[href="/shartlar"]')).toHaveCount(1);
  expect((await visitor.request.get(SITE + newPath)).status()).toBe(404);
  expect((await visitor.request.get(SITE + "/maxfiylik")).status()).toBe(404);
});

step("CMS10", "PNG media UI orqali yuklanadi; admin oldindan ko‘radi, qoralama rasmi ommaga ochilmaydi", async () => {
  await admin.goto(ADMIN + "/media");
  await admin.getByLabel("Rasm tanlang").setInputFiles({ name: "cms-e2e-1px.png", mimeType: "image/png", buffer: png });
  await post(admin, admin.getByRole("button", { name: "Rasm yuklash", exact: true }).click());
  await expect(admin.getByRole("status").filter({ hasText: /yuklandi|mavjud|saqlandi/i })).toBeVisible();
  mediaPath = await admin.getByLabel("Rasm havolasi").first().inputValue();
  expect(/^\/media\/[a-f0-9]{64}$/.test(mediaPath), "Rasmning xeshli manzili").toBe(true);
  const preview = await owner.request.get(ADMIN + mediaPath);
  expect(preview.status()).toBe(200);
  expect(preview.headers()["content-type"]).toBe("image/png");
  expect(preview.headers()["cache-control"]).toContain("private");
  expect((await preview.body()).equals(png), "Admin asl PNG baytlarini qaytaradi").toBe(true);
  expect((await visitor.request.get(SITE + mediaPath)).status(), "Nashrga kiritilmagan rasm ommaviy saytda 404").toBe(404);
  expect((await anonymous.request.get(ADMIN + "/api/public-media/" + mediaPath.split("/").at(-1))).status(), "Nashrga kiritilmagan rasm public API orqali ham yopiq").toBe(404);
  await admin.goto(ADMIN + "/kontent/sayt");
  await admin.getByLabel("Birinchi ekran rasmi (ixtiyoriy)", { exact: false }).fill(mediaPath);
  await save();
  expect((await visitor.request.get(SITE + mediaPath)).status(), "Hero qoralamasidagi rasm nashrgacha 404").toBe(404);
});

step("CMS11", "Hero rasmi nashrdan keyin ommaviy baytlar va brauzerdagi rasm sifatida ochiladi", async () => {
  await publish();
  await publicHome();
  const response = await visitor.request.get(SITE + mediaPath);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
  expect((await response.body()).equals(png), "Nashrdagi asl PNG baytlari").toBe(true);
  const image = site.locator(".hero img.cms-hero-image");
  await expect(image).toHaveAttribute("src", mediaPath);
  await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth)).toBe(1);
  const publicApi = await anonymous.request.get(ADMIN + "/api/public-media/" + mediaPath.split("/").at(-1));
  expect(publicApi.status()).toBe(200);
  expect((await publicApi.body()).equals(png)).toBe(true);
  await published();
});

step("CMS12", "Eski versiya yangi qoralama bo‘lib tiklanadi; nashrdan keyin barcha joriy qiymatlar qaytadi", async () => {
  const current = Number(await admin.locator("form.savebar input[name=base]").inputValue());
  const count = await admin.locator(".versions > li").count();
  const firstVersion = admin.locator(".versions > li").filter({ has: admin.locator("b").filter({ hasText: new RegExp(`^${initialVersion}-versiya$`) }) });
  await post(admin, firstVersion.getByRole("button", { name: "Shu versiyadan qoralama", exact: true }).click());
  await expect(admin.locator("form.savebar input[name=base]")).toHaveValue(String(current + 1));
  await expect(admin.locator(".versions > li")).toHaveCount(count + 1);
  await publicHome();
  await expect(site.locator(".hero h1")).toContainText(heroText); // tiklash o'zi nashr emas
  expect(await themeColor()).toBe(primary);
  await publish();
  await publicHome();
  await expect(site.locator(".hero h1")).toContainText(baseline.home.hero.h1);
  expect(await themeColor()).toBe(baseline.design.primary.toLowerCase());
  await expect(site.locator("#yem")).toHaveCount(1);
  await expect(site.locator('footer a[href="/maxfiylik"]')).toHaveCount(1);
  expect((await visitor.request.get(SITE + "/maxfiylik")).status()).toBe(200);
  await expect(site.locator(`#${customId}`)).toHaveCount(0);
  await expect(site.locator(`footer a[href="${newPath}"]`)).toHaveCount(0);
  await expect(site.locator(".hero img.cms-hero-image")).toHaveCount(0);
  expect((await visitor.request.get(SITE + newPath)).status()).toBe(404);
  expect((await visitor.request.get(SITE + mediaPath)).status()).toBe(404);
  expect(isDeepStrictEqual((await published()).website, baseline), "Tiklangan nashr boshlang‘ich sayt ma’lumotiga teng").toBe(true);
});

step("CMS13", "Yakun: himoya/JS va 390/1366px admin ko‘rinishi — gorizontal overflow yo‘q", async () => {
  for (const route of ["/kontent/sayt", "/media"]) {
    const response = await anonymous.request.get(ADMIN + route, { maxRedirects: 0 });
    expect([303, 307, 308].includes(response.status()), route).toBe(true);
    expect(new URL(response.headers().location, ADMIN).pathname).toBe("/kirish");
  }
  for (const width of [1366, 390]) {
    await admin.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await admin.goto(ADMIN + "/kontent/sayt", { waitUntil: "networkidle" });
    await expect(admin.locator("h1")).toHaveText("Sayt boshqaruvi");
    const overflow = await admin.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${width}px admin sahifasida gorizontal scroll yo‘q`).toBeLessThanOrEqual(1);
    const file = path.join(os.tmpdir(), `meningfermam-cms-admin-${width}-${Date.now()}.png`);
    await admin.screenshot({ path: file, fullPage: false, mask: [admin.locator('input[type=password], [data-testid="totp-secret"], .qr, .codes')] });
    screenshots.push({ width, path: file });
  }
  expect(errors.length, "Admin va sayt sahifalarida JS xatosi yo‘q").toBe(0);
});

let aborted = false;
try {
  for (const { id, name, run } of steps) {
    if (aborted) { results.push({ id, name, pass: null, skipped: true }); continue; }
    try {
      await run();
      results.push({ id, name, pass: true });
      console.log(`✓ ${id} ${name}`);
    } catch (error) {
      const alert = await admin.locator(".alert").allInnerTexts().catch(() => []);
      const detail = safe(`${error}\nAdmin sahifa: ${new URL(admin.url()).pathname}\nSayt sahifa: ${new URL(site.url()).pathname}\nXabar: ${alert.join(" | ")}\nOxirgi sayt so‘rovlari: ${JSON.stringify(publicNavigations.slice(-10))}`).slice(0, 3400);
      results.push({ id, name, pass: false, detail });
      console.log(`✗ ${id} ${name}\n${detail}`);
      aborted = true;
    }
  }
} finally {
  // QR, TOTP va zaxira kodlar screenshotga tushmasin; screenshot faqat OS temp papkasida.
  const screenshotPage = new URL(admin.url()).pathname.startsWith("/kirish") ? site : admin;
  const screenshot = path.join(os.tmpdir(), `meningfermam-cms-e2e-${Date.now()}.png`);
  let screenshotPath = screenshots.at(-1)?.path ?? null;
  if (!screenshotPath) {
    try {
      await screenshotPage.screenshot({ path: screenshot, fullPage: false, mask: [screenshotPage.locator('input[type=password], [data-testid="totp-secret"], .qr, .codes')] });
      screenshotPath = screenshot;
    } catch { /* yakuniy hisobotni screenshot xatosi to'xtatmaydi */ }
  }
  await owner.close(); await visitor.close(); await anonymous.close(); await browser.close();
  const summary = { at: new Date().toISOString(), admin: ADMIN, site: SITE, total: steps.length, passed: results.filter((result) => result.pass === true).length, failed: results.filter((result) => result.pass === false).map((result) => result.id), skipped: results.filter((result) => result.skipped).map((result) => result.id) };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ summary, results, errors, publicNavigations, screenshots, screenshot: screenshotPath }, null, 2));
  console.log(JSON.stringify(summary));
  process.exitCode = summary.failed.length ? 1 : 0;
}
