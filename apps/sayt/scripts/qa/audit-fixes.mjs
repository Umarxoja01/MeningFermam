// Audit tuzatishlarini tekshirish (docs/TEST_REPORT.md, "Audit"): ERR-001 dialog zaxirasi, ERR-002 fonlar, ERR-003 siqish/LCP, ERR-005 chop etish.
// Ishlatish: npm run serve (alohida terminalda) → npm run qa:audit; BASE_URL / PLAYWRIGHT_CHANNEL ixtiyoriy.
import { chromium } from "@playwright/test";
const B = (process.env.BASE_URL || "http://localhost:3100").replace(/\/$/, "");
const b = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
let failures = 0;
const ok = (c, m) => { if (!c) failures++; console.log(`${c ? "✓" : "✗"} ${m}`); };
// ERR-001: <dialog>.showModal yo'q brauzer
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript(() => { delete HTMLDialogElement.prototype.showModal; delete HTMLDialogElement.prototype.close; });
  await p.goto(B + "/", { waitUntil: "networkidle" });
  const closedHidden = await p.$$eval("dialog.startdlg", (ds) => ds.every((d) => getComputedStyle(d).display === "none"));
  await p.locator("#oxiri").getByRole("button", { name: "Ilova haqida" }).click();
  const dlg = p.locator("dialog.startdlg.fallback");
  const vis = await dlg.isVisible();
  const focusIn = await p.evaluate(() => !!document.activeElement?.closest("dialog"));
  const txt = vis ? await dlg.innerText() : "";
  await p.keyboard.press("Escape");
  const escClosed = await dlg.count() === 0 || !(await dlg.isVisible());
  const focusBack = await p.evaluate(() => document.activeElement?.textContent);
  await p.locator("#oxiri").getByRole("button", { name: "Ilova haqida" }).click();
  await p.getByRole("button", { name: "Yopish" }).click();
  const btnClosed = !(await p.locator("dialog.startdlg.fallback").isVisible().catch(() => false));
  await p.locator("#oxiri").getByRole("button", { name: "Ilova haqida" }).click();
  await p.locator(".startdlg-backdrop").click({ position: { x: 10, y: 10 } });
  const bgClosed = !(await p.locator("dialog.startdlg.fallback").isVisible().catch(() => false));
  ok(closedHidden && vis && txt.includes("Ilova hali ishga tushmagan") && focusIn && escClosed && focusBack === "Ilova haqida" && btnClosed && bgClosed && !errs.length,
    `ERR-001 zaxira oyna: yopiqda yashirin=${closedHidden} ochildi=${vis} fokus ichida=${focusIn} Escape=${escClosed} fokus qaytdi=${focusBack} Yopish=${btnClosed} fon=${bgClosed} xato=${errs.length}`);
  await p.close();
}
// ERR-001: oddiy brauzerda (showModal bor) avvalgidek
{
  const p = await b.newPage();
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.locator("header").getByRole("button", { name: "Ilova haqida" }).click();
  const modal = await p.evaluate(() => document.querySelector("dialog[open]")?.matches(":modal"));
  await p.getByRole("button", { name: "Yopish" }).click();
  ok(modal && (await p.locator("dialog[open]").count()) === 0, `ERR-001 oddiy brauzer: :modal=${modal}, "Yopish" ishlaydi`);
  await p.close();
}
// ERR-005: chop etish
{
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await p.goto(B + "/", { waitUntil: "networkidle" });
  await p.emulateMedia({ media: "print" });
  const hidden = await p.$$eval(".rv", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
  const tab = await p.$eval(".tabbar", (e) => getComputedStyle(e).display);
  ok(hidden === 0 && tab === "none", `ERR-005 chop etish: yashirin bloklar=${hidden}, pastki menyu=${tab}`);
  await p.close();
}
// ERR-002: menyu foni
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(B + "/", { waitUntil: "networkidle" });
  const nav = await p.$eval(".nav", (e) => getComputedStyle(e).backgroundColor);
  const tab = await p.$eval(".tabbar", (e) => getComputedStyle(e).backgroundColor);
  ok(nav === "rgba(255, 255, 255, 0.86)" && tab === "rgba(255, 255, 255, 0.92)", `ERR-002 fonlar: nav=${nav}, tabbar=${tab}`);
  await p.close();
}
// ERR-003: siqish bilan LCP (lokal, sekin 4G + 4x CPU; taxminiy)
for (const motion of ["no-preference", "reduce"]) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: motion }); const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); new PerformanceObserver((l) => { const e = l.getEntries().at(-1); if (e) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); });
  await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(2500);
  const tr = await p.evaluate(() => Math.round(performance.getEntriesByType("resource").reduce((s, r) => s + r.transferSize, 0) / 1024) + Math.round(performance.getEntriesByType("navigation")[0].transferSize / 1024));
  console.log(`  ERR-003 ${motion}: LCP=${Math.round(await p.evaluate(() => window.__lcp))}ms CLS=${(await p.evaluate(() => window.__cls)).toFixed(4)} uzatilgan≈${tr} KB`);
  await c.close();
}
await b.close();
if (failures) process.exitCode = 1;
