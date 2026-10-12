// Audit regressiyalari: JS'siz sarlavha, harakat rejimida to'g'ri summa va zaxira modalning fokus/scroll holati.
// Sayt oldindan ishlasin. PowerShell: $env:BASE_URL='http://localhost:4311'; node apps/sayt/scripts/qa/audit-ux-regressions.mjs
// Faqat stdout: screenshot, hisobot yoki loyiha fayllari yozilmaydi.
import { chromium, expect } from "@playwright/test";

const BASE = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const browser = await chromium.launch();
let failed = 0;

async function check(name, options, run) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  try {
    await run(page);
    expect(errors, "Brauzerda JavaScript xatosi bo'lmasin").toEqual([]);
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}: ${String(error).split("\n")[0]}`);
  } finally {
    await context.close();
  }
}

const costs = (page) => page.locator(".calc .cost b").allTextContents();
const focusInDialog = (page) => page.evaluate(() => !!document.activeElement?.closest("dialog[open]"));
const bodyStyles = (page) => page.evaluate(() => Object.fromEntries(
  ["overflow", "position", "top", "left", "right", "width"].map((name) => [name, [document.body.style.getPropertyValue(name), document.body.style.getPropertyPriority(name)]]),
));
const backgroundAttrs = (page) => page.evaluate(() => Array.from(document.body.children).map((el) => ({
  inert: el.getAttribute("inert"), hidden: el.getAttribute("aria-hidden"),
})));

try {
  await check("JS ishlamasa ham bo'lim sarlavhalari ko'rinadi", { javaScriptEnabled: false, reducedMotion: "no-preference" }, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const words = page.locator(".h2 .w");
    expect(await words.count()).toBeGreaterThan(0);
    const hidden = await words.evaluateAll((items) => items.filter((el) => getComputedStyle(el).opacity !== "1" || getComputedStyle(el).visibility !== "visible").length);
    expect(hidden, "JS'siz H2 so'zlar yashirin qolmasin").toBe(0);
  });

  await check("Harakat rejimi o'zgarsa yem summasi eski qiymatga qaytmaydi", { reducedMotion: "reduce" }, async (page) => {
    await page.goto(BASE + "/yem-rejasi", { waitUntil: "networkidle" });
    const calc = page.locator(".calc");
    const initial = await costs(page);
    await calc.getByRole("button", { name: "600 kg", exact: true }).click();
    await expect.poll(() => costs(page)).not.toEqual(initial);
    const expected = await costs(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(() => costs(page)).toEqual(expected);
    await page.waitForTimeout(650);
    expect(await costs(page), "Rejim almashgach summa 400 kg qiymatiga qaytmasin").toEqual(expected);

    await calc.getByRole("button", { name: "400 kg", exact: true }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => costs(page)).toEqual(initial);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(() => costs(page)).toEqual(initial);
    await page.waitForTimeout(650);
    expect(await costs(page), "Yarim yo'ldagi animatsiya qayta tiklanmasin").toEqual(initial);
  });

  await check("Zaxira oyna fokusni ushlaydi, fonni qulflaydi va holatni qaytaradi", { reducedMotion: "reduce" }, async (page) => {
    await page.addInitScript(() => { delete HTMLDialogElement.prototype.showModal; delete HTMLDialogElement.prototype.close; });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    // Pastdagi tugma: oyna yopilganda bosh sahifa tepaga sakrab ketishini ham tekshiramiz.
    const trigger = page.locator("#oxiri button[aria-haspopup='dialog']");
    await trigger.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "auto" }));
    const beforeY = await page.evaluate(() => scrollY);
    const styles = await bodyStyles(page);
    const attrs = await backgroundAttrs(page);
    await trigger.click();
    const dialog = page.locator("dialog.fallback[open]");
    await expect(dialog).toBeVisible();
    await expect.poll(() => focusInDialog(page)).toBe(true);
    const backgroundHidden = await page.evaluate(() => {
      const dialog = document.querySelector("dialog.fallback[open]");
      return Array.from(document.body.children).filter((el) => el instanceof HTMLElement && el !== dialog && !el.classList.contains("startdlg-backdrop"))
        .every((el) => el.hasAttribute("inert") && el.getAttribute("aria-hidden") === "true");
    });
    expect(backgroundHidden).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.body).position)).toBe("fixed");

    const first = dialog.locator("a[href], button:not([disabled])").first();
    const last = dialog.locator("a[href], button:not([disabled])").last();
    await first.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();
    // inert yo'q eski brauzerda ham JS fokusni qaytarsin.
    await page.evaluate(() => {
      for (const el of document.body.children) el.removeAttribute("inert");
      document.querySelector("main")?.focus();
    });
    await expect.poll(() => focusInDialog(page)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await bodyStyles(page)).toEqual(styles);
    expect(await backgroundAttrs(page)).toEqual(attrs);
    expect(Math.abs((await page.evaluate(() => scrollY)) - beforeY), "Yopilganda scroll tiklansin").toBeLessThanOrEqual(1);

    await trigger.click();
    await expect(dialog).toBeVisible();
    await dialog.locator("button").last().click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.locator(".startdlg-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await bodyStyles(page)).toEqual(styles);
    expect(await backgroundAttrs(page)).toEqual(attrs);
  });

  await check("Oddiy modal Escape bilan yopilib fokus tugmaga qaytadi", { reducedMotion: "reduce" }, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const trigger = page.locator("header button[aria-haspopup='dialog']");
    await trigger.click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.matches(":modal"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
} finally {
  await browser.close();
}

console.log(`Audit regressiyalari: ${4 - failed}/4 o'tdi`);
if (failed) process.exitCode = 1;
