// Mahsulot auditi regressiyalari. Sayt avval BASE_URL da xizmat qilishi kerak.
// Ishlatish: node scripts/qa/audit-product-regressions.mjs
// BASE_URL (standart :3100), PLAYWRIGHT_CHANNEL (masalan msedge). Natija faqat terminalga yoziladi.
import { chromium, expect } from "@playwright/test";

const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const guides = ["/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/savollar", "/daftardan-farqi", "/tez-orada"];
const results = [];
const doneLabel = "✓ Namuna bosqichini bajarish";
const finishedLabel = "✓ Namuna bosqichlari bajarildi";

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

const browser = await launchBrowser();
async function test(id, name, fn, { width = 1366, height = 900 } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  try {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await fn(page);
    expect(errors, "Brauzer JavaScript xatolari").toEqual([]);
    results.push({ id, name, pass: true });
    console.log(`✓ ${id} ${name}`);
  } catch (error) {
    const detail = String(error).split("\n").filter(Boolean).slice(0, 8).join("\n");
    results.push({ id, name, pass: false, detail });
    console.log(`✗ ${id} ${name}\n${detail}`);
  } finally {
    await context.close();
  }
}

const sick = (page) => page.locator("#kasal");
const action = (page) => sick(page).locator(".rxdone");
const day = (page) => sick(page).locator(".tbody .lbl");
const stock = (page, name) => page.locator("#ombor .stock li").filter({ hasText: name });
const amount = (page, name) => stock(page, name).locator(".sh span");
async function addSample(page, name) {
  await stock(page, name).getByRole("button", { name: /^\+ 1 namuna birligi qo‘shish:/ }).click();
}
async function complete(page) {
  await expect(action(page)).toHaveText(doneLabel);
  await expect(action(page)).toBeEnabled();
  await action(page).click();
}

await test("P01", "Buzoq: ikkala namuna birligini qo‘shib uch bosqichni tugatish mumkin", async (page) => {
  await sick(page).getByRole("button", { name: "🐮 Buzoq", exact: true }).click();
  await expect(action(page)).toBeDisabled();
  await expect(action(page)).toHaveText("Avval dorini oling");
  await expect(amount(page, "Suv-tuz kukuni")).toHaveText("0 namuna birligi");
  await expect(amount(page, "Ichak dorisi")).toHaveText("0 namuna birligi");

  await addSample(page, "Suv-tuz kukuni");
  await expect(action(page)).toBeDisabled(); // bir dori yetishi butun bosqichni ochmaydi
  await expect(amount(page, "Suv-tuz kukuni")).toHaveText("1 namuna birligi");
  await expect(amount(page, "Ichak dorisi")).toHaveText("0 namuna birligi");
  await addSample(page, "Ichak dorisi");

  for (let step = 1; step <= 3; step++) {
    if (step > 1) {
      await addSample(page, "Suv-tuz kukuni");
      await addSample(page, "Ichak dorisi");
    }
    await expect(day(page)).toHaveText(`${step}-kun, jami 3 kun`);
    await complete(page);
    await expect(amount(page, "Suv-tuz kukuni")).toHaveText("0 namuna birligi");
    await expect(amount(page, "Ichak dorisi")).toHaveText("0 namuna birligi");
    if (step < 3) await expect(action(page)).not.toHaveText(finishedLabel);
  }
  await expect(action(page)).toHaveText(finishedLabel);
  await expect(action(page)).toBeDisabled();
});

await test("P02", "Oqsoq buqa: sprey namuna birligi ombordan qo‘shiladi va kurs davom etadi", async (page) => {
  await sick(page).getByRole("button", { name: "🐂 Buqa", exact: true }).click();
  await sick(page).getByRole("button", { name: "Oqsoqlanyapti", exact: true }).click();
  await expect(action(page)).toBeDisabled();
  await expect(amount(page, "Tuyoq spreyi")).toHaveText("0 namuna birligi");
  await expect(amount(page, "Oksitetrasiklin")).toHaveText("260 ml");
  for (let step = 1; step <= 3; step++) {
    await addSample(page, "Tuyoq spreyi");
    await expect(day(page)).toHaveText(`${step}-kun, jami 3 kun`);
    await complete(page);
    await expect(amount(page, "Tuyoq spreyi")).toHaveText("0 namuna birligi");
    await expect(amount(page, "Oksitetrasiklin")).toHaveText(`${260 - step * 40} ml`);
    if (step < 3) await expect(action(page)).not.toHaveText(finishedLabel);
  }
  await expect(action(page)).toHaveText(finishedLabel);
  await expect(action(page)).toBeDisabled();
});

for (const sample of [
  { id: "P03", animal: "🐂 Buqa", repeat: 14, firstStock: 42, finalStock: 34 },
  { id: "P04", animal: "🐑 Qo‘y", repeat: 10, firstStock: 49, finalStock: 48 },
]) {
  await test(sample.id, `${sample.animal}: 1-kundan ${sample.repeat}-kunga o‘tadi va takrordan keyin tugaydi`, async (page) => {
    await sick(page).getByRole("button", { name: sample.animal, exact: true }).click();
    await expect(day(page)).toHaveText(`1-kun · namuna kunlari: 1, ${sample.repeat}`);
    await complete(page);
    await expect(day(page)).toHaveText(`${sample.repeat}-kun · namuna kunlari: 1, ${sample.repeat}`);
    await expect(action(page)).toHaveText(doneLabel);
    await expect(amount(page, "Ivermektin")).toHaveText(`${sample.firstStock} ml`);
    await complete(page);
    await expect(action(page)).toHaveText(finishedLabel);
    await expect(action(page)).toBeDisabled();
    await expect(amount(page, "Ivermektin")).toHaveText(`${sample.finalStock} ml`);
    await page.getByRole("button", { name: "Omborni boshidan ko‘rsatish", exact: true }).click();
    await expect(day(page)).toHaveText(`1-kun · namuna kunlari: 1, ${sample.repeat}`);
    await expect(amount(page, "Ivermektin")).toHaveText("50 ml");
  });
}

await test("P05", "Holat va davolash namuna deb ko‘rsatiladi; sertifikat/tasdiq da’volari olib tashlangan", async (page) => {
  await expect(page.getByRole("tab", { name: /Namuna/ })).toHaveCount(1);
  await expect(page.getByRole("tab", { name: /Ishlaydi/ })).toHaveCount(0);
  await expect(page.locator("#kasal .okb").first()).toHaveText("Namuna");
  await expect(page.locator("header").getByRole("button", { name: "Ilova haqida", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Boshlash", exact: true })).toHaveCount(0);
  for (const pathname of ["/", ...guides]) {
    if (pathname !== "/") await page.goto(BASE + pathname, { waitUntil: "networkidle" });
    const title = await page.title();
    const metadata = await page.locator('meta[name="description"]').getAttribute("content");
    const text = `${title}\n${metadata || ""}\n${await page.locator("body").innerText()}`;
    expect(text, pathname).not.toMatch(/sertifikatli|professional\s+veterinar(?:lar|\s+vrachlar)?\s+belgilagan|kim\s+foyda,?\s+kim\s+zarar/iu);
  }
});

await test("P06", "Yettita ichki qo‘llanma bosh sahifadagi footer havolalari orqali ochiladi", async (page) => {
  const links = await page.locator("footer a").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  for (const pathname of guides) expect(links, `Footer: ${pathname}`).toContain(pathname);
  for (const pathname of guides) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.locator(`footer a[href="${pathname}"]`).first().click();
    await expect.poll(() => new URL(page.url()).pathname.replace(/\/$/, "")).toBe(pathname);
    await expect(page.locator("main h1")).toBeVisible();
  }
});

await test("P07", "390×844: hero va asosiy tugma birinchi ekranda, muammo lentasidan oldin", async (page) => {
  const h1 = page.locator(".hero h1");
  const cta = page.locator(".hero .hbtns a");
  await expect(h1).toBeVisible();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "#yem");
  for (const [name, locator] of [["Sarlavha", h1], ["CTA", cta]]) {
    const rect = await locator.boundingBox();
    expect(rect, name).not.toBeNull();
    expect(rect.y, `${name} tepa`).toBeGreaterThanOrEqual(0);
    expect(rect.y + rect.height, `${name} past`).toBeLessThanOrEqual(844);
    expect(rect.x, `${name} chap`).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width, `${name} o‘ng`).toBeLessThanOrEqual(390);
  }
  const layout = await page.evaluate(() => {
    const hero = document.querySelector(".hero");
    const loop = document.querySelector(".loop");
    const button = document.querySelector(".hero .hbtns a");
    const r = button.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      heroBeforeLoop: !!(hero.compareDocumentPosition(loop) & Node.DOCUMENT_POSITION_FOLLOWING),
      ctaUncovered: hit === button || button.contains(hit),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(layout.heroBeforeLoop, "Hero lentadan oldin").toBe(true);
  expect(layout.ctaUncovered, "CTA ustini boshqa qatlam yopmaydi").toBe(true);
  expect(layout.horizontalOverflow, "Gorizontal scroll yo‘q").toBeLessThanOrEqual(1);
}, { width: 390, height: 844 });

await browser.close();
const failed = results.filter((result) => !result.pass).map((result) => result.id);
console.log(JSON.stringify({ total: results.length, passed: results.length - failed.length, failed }));
process.exitCode = failed.length ? 1 : 0;
