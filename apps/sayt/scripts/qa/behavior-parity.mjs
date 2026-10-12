// Xatti-harakat tekshiruvi: demo v12 dan tuzilgan 60 amal (docs/DECISIONS.md, "60 amal") va Q01–Q22 ning avtomat qismi.
// Har amal: demodagidek (M), o'zgargan (O'), yangi (Y), olib tashlangan (X) — v3.1 bo'yicha kutilgan natija tekshiriladi.
// Ishlatish: sayt BASE_URL da ishlab tursin (standart http://localhost:3100): npm run qa:behavior
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Standart hisobot docs/qa ga yoziladi; audit qayta tekshiruvida OUT_FILE bilan vaqtinchalik fayl tanlang.
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const QA = path.join(ROOT, "docs/qa");
const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT_FILE = process.env.OUT_FILE ? path.resolve(process.env.OUT_FILE) : path.join(QA, "behavior.json");
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
const b = await launchBrowser();
const results = [];

async function open({ path = "/", width = 1366, motion = "reduce" } = {}) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: motion });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  return { ctx, page, errors };
}

async function t(id, kind, name, q, fn) {
  let pass = false, detail = "";
  try {
    const r = await fn();
    pass = r !== false;
    if (typeof r === "string") detail = r;
  } catch (e) {
    detail = String(e).split("\n")[0].slice(0, 300);
  }
  results.push({ id, kind, name, q, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${id} [${kind}] ${name}${detail && !pass ? " — " + detail : ""}`);
}

const assert = (c, msg) => { if (!c) throw new Error(msg); };
const tx = async (loc) => (await loc.innerText()).trim();
const loopX = (page) => page.$eval(".ltrack", (el) => { const m = /translateX\((-?[\d.]+)px\)/.exec(el.style.transform); return m ? -Number(m[1]) : 0; });
const wait = (page, ms) => page.waitForTimeout(ms);

// --- umumiy navigatsiya ---
await t("01", "M", "Logo bosh sahifaga olib boradi", "", async () => {
  const { ctx, page } = await open({ path: "/aloqa" });
  await page.locator("header .logo").click();
  await page.waitForURL(BASE + "/");
  await ctx.close();
});
await t("02", "M", "Tepa menyuning 7 havolasi", "§6", async () => {
  const { ctx, page } = await open();
  const hrefs = await page.$$eval("header .links a", (as) => as.map((a) => a.getAttribute("href")));
  await ctx.close();
  const want = ["/#muammo", "/#yem", "/#kasal", "/#ombor", "/#eslatma", "/#holat", "#aloqa"];
  assert(JSON.stringify(hrefs) === JSON.stringify(want), JSON.stringify(hrefs));
});
await t("03", "O'", "Tepadagi “Ilova haqida” → ilova holati oynasi (#oxiri emas)", "Q17", async () => {
  const { ctx, page } = await open({ path: "/statistika" });
  await page.locator("header").getByRole("button", { name: "Ilova haqida" }).click();
  const dlg = page.locator("dialog[open]");
  assert(await dlg.isVisible(), "oyna ochilmadi");
  const text = await tx(dlg);
  assert(text.includes("Ilova hali ishga tushmagan") && text.includes("ochilish sanasi hali belgilanmagan"), text);
  assert(await dlg.locator('a[href="tel:+998996180300"]').count() === 1, "tel yo'q");
  assert(await dlg.locator('a[href="https://t.me/MeningFermamUzb"]').count() === 1, "telegram yo'q");
  await page.keyboard.press("Escape");
  assert(!(await page.locator("dialog[open]").count()), "Escape bilan yopilmadi");
  await ctx.close();
});
await t("04", "M", "Pastki menyu: Yem, Molim kasal, Dorilar, Aloqa; joriy bo'lim belgilanadi", "§6", async () => {
  const { ctx, page } = await open({ width: 390 });
  const labels = await page.$$eval(".tabbar a", (as) => as.map((a) => a.textContent.trim()));
  assert(labels.join("|") === "🌾Yem|🩺Molim kasal|💊Dorilar|📞Aloqa", labels.join("|"));
  await page.evaluate(() => document.getElementById("yem").scrollIntoView());
  await wait(page, 200);
  const on = await page.$eval(".tabbar a.on", (a) => a.textContent.trim() + "|" + a.getAttribute("aria-current"));
  await ctx.close();
  assert(on === "🌾Yem|location", on);
});
await t("05", "M", "O'qilish chizig'i scroll bilan to'ladi", "§6", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight / 2));
  await wait(page, 200);
  const tf = await page.$eval("#progress", (el) => el.style.transform);
  await ctx.close();
  const v = Number(/scaleX\(([\d.]+)\)/.exec(tf)?.[1]);
  assert(v > 0.3 && v < 0.8, tf);
});
await t("06", "O'", "Suzuvchi 📞 tugma haqiqiy tel: havola", "Q18", async () => {
  const { ctx, page } = await open();
  const href = await page.getAttribute(".fab", "href");
  const vis = await page.isVisible(".fab");
  await ctx.close();
  assert(href === "tel:+998996180300" && vis, `${href} ${vis}`);
});

// --- muammo lentasi ---
await t("07", "M", "Lenta o'zi aylanadi", "Q02", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.locator(".loop").scrollIntoViewIfNeeded();
  await wait(page, 200);
  const a = await loopX(page); await wait(page, 1000); const c = await loopX(page);
  await ctx.close();
  assert(c !== a, `${a} → ${c}`);
});
await t("08", "M", "Sichqoncha ustida sekinlashadi", "§4.1", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.locator(".loop").scrollIntoViewIfNeeded();
  await wait(page, 800);
  let a = await loopX(page); await wait(page, 600); const free = (await loopX(page)) - a;
  const box = await page.locator(".loop").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await wait(page, 2500);
  a = await loopX(page); await wait(page, 600); const hover = (await loopX(page)) - a;
  await ctx.close();
  assert(free > 0 && hover >= 0 && hover < free * 0.5, `erkin ${free.toFixed(1)}, ustida ${hover.toFixed(1)}`);
});
await t("09", "M", "Sichqoncha/touch bilan surish", "§4.1", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.getByRole("button", { name: "To‘xtatish" }).click();
  const box = await page.locator(".loop").boundingBox();
  const a = await loopX(page);
  await page.mouse.move(box.x + 600, box.y + 150); await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + 600 - i * 20, box.y + 150);
  await page.mouse.up(); await wait(page, 100);
  const c = await loopX(page);
  await ctx.close();
  assert(Math.abs(c - a - 200) < 5, `${a} → ${c}`);
});
await t("10", "M", "Surish kartochkani tasodifan bosmaydi; oddiy bosish bo'limga o'tadi", "Q01", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.getByRole("button", { name: "To‘xtatish" }).click();
  const card = page.locator(".pc").first();
  const cb = await card.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + 100); await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(cb.x + cb.width / 2 - i * 10, cb.y + 100);
  await page.mouse.up(); await wait(page, 200);
  const h1 = await page.evaluate(() => location.hash);
  const c2 = page.locator(".pc").nth(1);
  const b2 = await c2.boundingBox();
  // foydalanuvchi kabi: sichqonchani kartochkaga olib keladi (tilt 0,25 s tugaydi), keyin bosadi
  await page.mouse.move(b2.x + b2.width / 2, b2.y + 60); await wait(page, 400);
  await page.mouse.down(); await page.mouse.up(); await wait(page, 300);
  const h2 = await page.evaluate(() => location.hash);
  await ctx.close();
  assert(h1 === "" && h2 === "#yem", `surishdan keyin "${h1}", bosgandan keyin "${h2}"`);
});
await t("11", "Y", "“To‘xtatish / Davom ettirish” tugmasi", "Q02", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.getByRole("button", { name: "To‘xtatish" }).click();
  await wait(page, 300);
  let a = await loopX(page); await wait(page, 700); const stopped = (await loopX(page)) === a;
  await page.getByRole("button", { name: "Davom ettirish" }).click();
  await wait(page, 300);
  a = await loopX(page); await wait(page, 700); const moving = (await loopX(page)) !== a;
  await ctx.close();
  assert(stopped && moving, `to'xtadi=${stopped}, yurdi=${moving}`);
});
await t("12", "Y", "Ekrandan chiqqanda lenta to'xtaydi", "Q02", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await wait(page, 400);
  const a = await loopX(page); await wait(page, 800); const c = await loopX(page);
  await ctx.close();
  assert(a === c, `${a} → ${c}`);
});
await t("13", "Y", "Klaviatura: kartochkaga fokus — lenta to'xtaydi, Enter bo'limga olib boradi", "§4.1", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  // haqiqiy klaviatura: to'xtatish tugmasidan Tab bilan 5-kartochkaga
  await page.locator(".loopbtn").focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
  await wait(page, 200);
  const a = await loopX(page); await wait(page, 600); const c = await loopX(page);
  const vis = await page.locator(".pc").nth(4).evaluate((el) => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; });
  await page.keyboard.press("Enter"); await wait(page, 300);
  const h = await page.evaluate(() => location.hash);
  await ctx.close();
  assert(a === c && vis && h === "#ombor", `x ${a}→${c}, ko'rinadi=${vis}, hash=${h}`);
});
await t("14", "O'", "9 kartochka; 8-kartochka “Vazn” → #yem; “Zot” kartochkasi yo'q", "Q01", async () => {
  const { ctx, page } = await open();
  const cards = await page.$$eval(".pc:not([aria-hidden])", (as) => as.map((a) => [a.querySelector("small").textContent, a.getAttribute("href")]));
  await ctx.close();
  assert(cards.length === 9, `soni ${cards.length}`);
  assert(cards[7][0] === "Vazn" && cards[7][1] === "#yem", JSON.stringify(cards[7]));
  assert(!cards.some(([n]) => n === "Zot"), "Zot bor");
});

// --- hero ---
await t("15", "M", "Hero parallaksi (sichqoncha)", "§4.2", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.evaluate(() => document.getElementById("stage").scrollIntoView({ block: "center" }));
  await wait(page, 200);
  const box = await page.locator("#stage").boundingBox();
  const y = Math.min(box.y + 120, 800);
  await page.mouse.move(box.x + 50, y); await wait(page, 100);
  const a = await page.$eval("#stage .layer", (el) => el.style.transform);
  await page.mouse.move(box.x + box.width - 50, y); await wait(page, 100);
  const c = await page.$eval("#stage .layer", (el) => el.style.transform);
  await ctx.close();
  assert(a && c && a !== c, `${a} | ${c}`);
});
await t("16", "O'", "H1 aynan; yagona Hero CTA “Yem hisobini sinab ko‘ring ›” → #yem", "Q03", async () => {
  const { ctx, page } = await open();
  const h1 = await tx(page.locator("h1"));
  const ctas = await page.$$eval(".hero .hbtns a, .hero .hbtns button", (as) => as.map((a) => [a.textContent, a.getAttribute("href")]));
  await ctx.close();
  assert(h1.replace(/\s+/g, " ") === "Hayvoningiz gapira olmaydi. Uning o‘rniga biz aytamiz.", h1);
  assert(ctas.length === 1 && ctas[0][0] === "Yem hisobini sinab ko‘ring ›" && ctas[0][1] === "#yem", JSON.stringify(ctas));
});
await t("17", "O'", "Video yo'q — SVG sahna; “Video joyi” yozuvi yo'q; vetapteka “rejalashtirilgan”", "Q14", async () => {
  const { ctx, page } = await open();
  const svg = await page.locator("#stage svg.scene").count();
  const txt = await tx(page.locator("#stage"));
  await ctx.close();
  assert(svg === 1 && !txt.includes("Video joyi") && txt.includes("rejalashtirilgan") && !/km/.test(txt), txt.slice(0, 200));
});

// --- yem ---
const feed = (page) => page.locator("#yem .calc");
const perDay = (page) => tx(page.locator("#yem .cost b").first());
const perMonth = (page) => tx(page.locator("#yem .cost b").nth(1));
const groupBtns = (page, n) => page.locator("#yem .calc .fld").nth(n).locator("button");
const pressed = async (page, n) => (await groupBtns(page, n).evaluateAll((bs) => bs.filter((x) => x.getAttribute("aria-pressed") === "true").map((x) => x.textContent)))[0];

await t("18", "M", "Hayvon tanlash; standart tanlovlar", "Q07", async () => {
  const { ctx, page } = await open();
  const s0 = [await pressed(page, 0), await pressed(page, 1), await pressed(page, 2)].join("/");
  await feed(page).getByRole("button", { name: /Buqa/ }).click();
  const buqa = [await pressed(page, 1), await pressed(page, 2)].join("/");
  await feed(page).getByRole("button", { name: /Qo‘y/ }).click();
  const qoy = [await pressed(page, 1), await pressed(page, 2)].join("/");
  await ctx.close();
  assert(s0 === "🐄 Sigir/400 kg/10 litr" && buqa === "400 kg/O‘rtacha" && qoy === "45 kg/Ko‘proq", `${s0} | ${buqa} | ${qoy}`);
});
await t("19", "X", "Zot maydoni va zot koeffitsiyenti yo'q; nasab sahifasi buzilmagan", "Q04", async () => {
  const { ctx, page } = await open();
  const yemText = await tx(page.locator("#yem"));
  const labels = await page.$$eval("#yem .fld > span", (s) => s.map((x) => x.textContent));
  await page.goto(BASE + "/nasab-daraxti");
  const nasab = await tx(page.locator("main"));
  await ctx.close();
  assert(!/zot/i.test(yemText), "yem bo'limida “zot” so'zi bor");
  assert(labels.join("|") === "Hayvon|Vazni|Hozir kuniga necha litr sut beradi?", labels.join("|"));
  assert(nasab.includes("№ 0230 — otasi: yaqin qarindosh") && nasab.includes("№ 0507 bilan juftlash: nasabni mutaxassis tekshirishi kerak"), "nasab namunasi yoki mutaxassis izohi yo'q");
});
await t("20", "O'", "Vazn: sigir/buqa 300–600, qo'y 30–75", "Q07", async () => {
  const { ctx, page } = await open();
  const w = async () => (await groupBtns(page, 1).allTextContents()).join(",");
  const s = await w();
  await feed(page).getByRole("button", { name: /Buqa/ }).click(); const bq = await w();
  await feed(page).getByRole("button", { name: /Qo‘y/ }).click(); const q = await w();
  await ctx.close();
  assert(s === "300 kg,400 kg,500 kg,600 kg" && bq === s && q === "30 kg,45 kg,60 kg,75 kg", `${s} | ${bq} | ${q}`);
});
await t("21", "M", "Holat: sigir 5–25 litr; buqa Kam/O‘rtacha/Ko‘p; qo'y Oddiy/Ko‘proq", "Q07", async () => {
  const { ctx, page } = await open();
  const g = async () => (await groupBtns(page, 2).allTextContents()).join(",");
  const s = await g();
  await feed(page).getByRole("button", { name: /Buqa/ }).click(); const bq = await g();
  await feed(page).getByRole("button", { name: /Qo‘y/ }).click(); const q = await g();
  await ctx.close();
  assert(s === "5 litr,10 litr,15 litr,20 litr,25 litr" && bq === "Kam,O‘rtacha,Ko‘p" && q === "Oddiy,Ko‘proq", `${s} | ${bq} | ${q}`);
});
await t("22", "M", "Natija ro'yxati: yemlar va tuz", "§4.3", async () => {
  const { ctx, page } = await open();
  const rows = await page.$$eval("#yem .out li", (ls) => ls.map((l) => l.innerText.replace(/\s+/g, " ").trim()));
  await ctx.close();
  assert(rows.join("|") === "Beda 5 kg|Silos 9 kg|Somon 2 yarim kg|Arpa 2 kg|Kepak 1 kg|Kunjara yarim kg|Tuz 2 osh qoshiq", rows.join("|"));
});
await t("23", "M", "Sigir 400 kg / 10 litr: 36 400 so‘m kuniga, ~1 092 000 so‘m oyiga", "Q05", async () => {
  const { ctx, page } = await open();
  const d = await perDay(page), m = await perMonth(page);
  await ctx.close();
  assert(d === "36 400 so‘m" && m === "~1 092 000 so‘m", `${d} | ${m}`);
});
await t("24", "X", "Prognoz yo'q (sut/vazn oshishi)", "Q08", async () => {
  const { ctx, page } = await open();
  const all = [];
  for (const [a, n] of [["Sigir", 5], ["Buqa", 3], ["Qo‘y", 2]]) {
    await feed(page).getByRole("button", { name: new RegExp(a) }).click();
    for (let i = 0; i < n; i++) { await groupBtns(page, 2).nth(i).click(); all.push(await tx(page.locator("#yem"))); }
  }
  await ctx.close();
  const bad = all.find((s) => /\+\s?\d+\s?kg|kg 3 oyda|oyiga \+|Vazni saqlanadi|litr sut kuniga|ko‘payadi/.test(s));
  assert(!bad, bad?.slice(0, 200));
});
await t("25", "M", "“Yem narxlarini o‘zingiz yozing” ochiladi", "§4.3", async () => {
  const { ctx, page } = await open();
  await page.locator("#yem summary").click();
  const n = await page.locator("#yem .prow").count();
  await ctx.close();
  assert(n === 6, `qator ${n}`);
});
await t("26", "M", "Beda +100 → 36 900; −100 → 36 400; 0 da “−” o'chiq", "Q06", async () => {
  const { ctx, page } = await open();
  await page.locator("#yem summary").click();
  await page.getByRole("button", { name: "Beda narxini 100 so‘mga oshirish" }).click();
  const up = await perDay(page);
  await page.getByRole("button", { name: "Beda narxini 100 so‘mga kamaytirish" }).click();
  const down = await perDay(page);
  await page.getByLabel("Silos", { exact: true }).fill("0");
  const minusOff = await page.getByRole("button", { name: "Silos narxini 100 so‘mga kamaytirish" }).isDisabled();
  await ctx.close();
  assert(up === "36 900 so‘m" && down === "36 400 so‘m" && minusOff, `${up} | ${down} | ${minusOff}`);
});
await t("27", "O'", "Noto'g'ri narx rad etiladi (izoh chiqadi, hisob o'zgarmaydi); bo'sh maydon hisobni buzmaydi", "Q06", async () => {
  const { ctx, page } = await open();
  await page.locator("#yem summary").click();
  const inp = page.getByLabel("Beda", { exact: true });
  await inp.fill("");
  const empty = await perDay(page);
  await inp.fill("-5");
  const err = await page.locator("#yem .prow .err").count();
  const afterBad = await perDay(page);
  await inp.blur();
  const reverted = await inp.inputValue();
  const errGone = await page.locator("#yem .prow .err").count();
  await inp.fill("2 600");
  const ok = await perDay(page);
  for (const bad of ["abc", "2,5", "100001"]) { await inp.fill(bad); assert(await page.locator("#yem .prow .err").count() === 1, `rad etilmadi: ${bad}`); }
  await ctx.close();
  assert(empty === "36 400 so‘m" && err === 1 && afterBad === "36 400 so‘m" && reverted === "2500" && errGone === 0 && ok === "36 900 so‘m",
    `${empty} | err=${err} | ${afterBad} | ${reverted} | ${errGone} | ${ok}`);
});
await t("28", "O'", "Narx reload'da saqlanadi, 0 ham; buzilgan xotira sahifani buzmaydi", "Q06", async () => {
  const { ctx, page, errors } = await open();
  await page.locator("#yem summary").click();
  await page.getByLabel("Beda", { exact: true }).fill("0");
  await page.getByLabel("Silos", { exact: true }).fill("1000");
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#yem summary").click();
  const b0 = await page.getByLabel("Beda", { exact: true }).inputValue();
  const s0 = await page.getByLabel("Silos", { exact: true }).inputValue();
  const d0 = await perDay(page);
  await page.evaluate(() => localStorage.setItem("mf-narx", "{buzuq"));
  await page.reload({ waitUntil: "networkidle" });
  const d1 = await perDay(page);
  await ctx.close();
  // beda 0, silos 1000: 36 350 − 12 500 + 9×100 = 24 750 → 24 800
  assert(b0 === "0" && s0 === "1000" && d0 === "24 800 so‘m" && d1 === "36 400 so‘m" && errors.length === 0, `${b0} ${s0} ${d0} ${d1} ${errors}`);
});
await t("29", "M", "“Taxminiy narxlarga qaytarish” — narxlar va xotira tozalanadi", "Q06", async () => {
  const { ctx, page } = await open();
  await page.locator("#yem summary").click();
  await page.getByLabel("Arpa", { exact: true }).fill("5000");
  await page.getByRole("button", { name: "Taxminiy narxlarga qaytarish" }).click();
  const d = await perDay(page);
  const ls = await page.evaluate(() => localStorage.getItem("mf-narx"));
  await ctx.close();
  assert(d === "36 400 so‘m" && ls === null, `${d} ${ls}`);
});

// --- molim kasal ---
const kasal = (page) => page.locator("#kasal");
const stockOf = (page, name) => tx(page.locator("#ombor .stock li", { hasText: name }).locator(".sh span"));
await t("30", "M", "Kim kasal: sigir, buzoq, buqa, qo'y", "§4.4", async () => {
  const { ctx, page } = await open();
  const n = await kasal(page).locator(".pick .fld").first().locator("button").allTextContents();
  await ctx.close();
  assert(n.join(",") === "🐄 Sigir,🐮 Buzoq,🐂 Buqa,🐑 Qo‘y", n.join(","));
});
await t("31", "M", "Alomat tanlansa ehtimoliy holat va izoh almashadi", "§4.4", async () => {
  const { ctx, page } = await open();
  await kasal(page).getByRole("button", { name: "Yo‘talyapti" }).click().catch(async () => {
    await kasal(page).getByRole("button", { name: /Buzoq/ }).click();
    await kasal(page).getByRole("button", { name: "Yo‘talyapti" }).click();
  });
  const h = await tx(kasal(page).locator("h3"));
  await ctx.close();
  assert(h === "Shamollash", h);
});
await t("32", "O'", "Alomat avtomatik tashxis emas: “Ehtimoliy holat (namuna)”", "Q09", async () => {
  const { ctx, page } = await open();
  const p = await tx(kasal(page).locator(".probable"));
  await ctx.close();
  assert(p === "Ehtimoliy holat (namuna) — veterinarning tekshiruvi kerak", p);
});
await t("33", "M", "Shoshilinch alomat: veterinarga murojaat birinchi, davolash boshqaruvi yo'q", "Q10", async () => {
  const { ctx, page } = await open();
  await kasal(page).getByRole("button", { name: "Qorni shishib ketdi" }).click();
  const urgent = await kasal(page).locator(".urgent").isVisible();
  const tel = await kasal(page).locator('.urgent a[href="tel:+998994446544"]').count();
  const done = await kasal(page).locator(".rxdone").count();
  const note = await kasal(page).locator(".miss-note").isVisible();
  await ctx.close();
  assert(urgent && tel === 1 && done === 0 && note, `urgent=${urgent} tel=${tel} done=${done} note=${note}`);
});
await t("34", "O'", "“Veterinar chaqirish” veterinar raqamiga qo'ng'iroq qiladi, Telegram bilan", "§4.4", async () => {
  const { ctx, page } = await open();
  const href = await kasal(page).getByRole("link", { name: /Veterinar chaqirish/ }).getAttribute("href");
  const tg = await kasal(page).locator('a[href="https://t.me/Sardorxoja_Vet"]').count();
  await ctx.close();
  assert(href === "tel:+998994446544" && tg === 1, `${href} ${tg}`);
});
await t("35", "M", "Sxema va dorilar ko'rsatiladi (egasi qarori: ma'lumot saqlanadi)", "§4.4", async () => {
  const { ctx, page } = await open();
  const plan = await kasal(page).locator(".tl li").count();
  const drugs = await kasal(page).locator(".drug").count();
  await ctx.close();
  assert(plan === 3 && drugs === 2, `${plan} ${drugs}`);
});
await t("36", "M", "Vazn tanlansa doza qayta hisoblanadi (300 kg → 8 ml)", "§4.4", async () => {
  const { ctx, page } = await open();
  await kasal(page).locator(".treat").getByRole("button", { name: "300 kg" }).click();
  const dose = await tx(kasal(page).locator(".rx li", { hasText: "Meloksikam" }).locator(".dose"));
  await ctx.close();
  assert(dose === "8 ml", dose);
});
await t("37", "O'", "“Bajarildi”: hamma dori ayiriladi, kun +1; “Ertaga eslatma keladi” yo'q", "Q11", async () => {
  const { ctx, page } = await open();
  await kasal(page).locator(".rxdone").click();
  const msg = await tx(kasal(page).locator(".msg"));
  const yelin = await stockOf(page, "Yelin shpritsi");
  const melo = await stockOf(page, "Meloksikam");
  const day = await tx(kasal(page).locator(".tbody .lbl"));
  await ctx.close();
  assert(msg.includes("Ombordan ayirildi") && !/Ertaga/i.test(msg) && yelin === "5 dona" && melo === "5 ml" && day === "2-kun, jami 3 kun", `${msg} | ${yelin} | ${melo} | ${day}`);
});
await t("38", "O'", "Bitta dori yetmasa kun bajarilmaydi va hech narsa ayirilmaydi", "Q11", async () => {
  const { ctx, page } = await open();
  await kasal(page).getByRole("button", { name: "Yem yemayapti, isitma" }).click();
  await kasal(page).locator(".rxdone").click(); // 1-kun: meloksikam 10 ml (15 bor), vitamin 8 ml
  await wait(page, 1300);
  const btn = kasal(page).locator(".rxdone");
  const disabled = await btn.isDisabled();
  const label = await tx(btn);
  const before = await stockOf(page, "Meloksikam");
  await btn.click({ force: true });
  const after = await stockOf(page, "Meloksikam");
  const day = await tx(kasal(page).locator(".tbody .lbl"));
  // buzoq ich ketishi: namunaviy birliklar omborda bor, lekin boshlang'ich qoldiq 0
  await kasal(page).getByRole("button", { name: /Buzoq/ }).click();
  const off2 = await kasal(page).locator(".rxdone").isDisabled();
  const miss = await tx(kasal(page).locator(".rx"));
  await ctx.close();
  assert(disabled && label === "Avval dorini oling" && before === "5 ml" && after === "5 ml" && day === "2-kun, jami 3 kun" && off2 && miss.includes("0 namuna birligi") && miss.includes("Yetmaydi"),
    `${disabled} ${label} ${before}→${after} ${day} ${off2}`);
});
await t("39", "Y", "Tez ikki marta bosish bir marta hisobdan chiqadi", "Q12", async () => {
  const { ctx, page } = await open();
  await kasal(page).locator(".rxdone").dblclick();
  await wait(page, 200);
  const yelin = await stockOf(page, "Yelin shpritsi");
  const day = await tx(kasal(page).locator(".tbody .lbl"));
  await ctx.close();
  assert(yelin === "5 dona" && day === "2-kun, jami 3 kun", `${yelin} ${day}`);
});
await t("40", "O'", "Takroriy kurs 14-kun bosqichidan keyingina tugaydi", "Q11", async () => {
  const { ctx, page } = await open();
  await kasal(page).getByRole("button", { name: /Buqa/ }).click();
  await kasal(page).locator(".rxdone").click();
  await wait(page, 1300);
  assert(await tx(kasal(page).locator(".tbody .lbl")) === "14-kun · namuna kunlari: 1, 14", "takroriy kun ko'rsatilmagan");
  assert(await tx(kasal(page).locator(".rxdone")) === "✓ Namuna bosqichini bajarish", "birinchi bosqichdayoq tugadi");
  await kasal(page).locator(".rxdone").click();
  const b2 = kasal(page).locator(".rxdone");
  const r = [await tx(b2), await b2.isDisabled()];
  await ctx.close();
  assert(r[0] === "✓ Namuna bosqichlari bajarildi" && r[1], JSON.stringify(r));
});
await t("41", "M", "Yangi flakon ochilgani xabarda aytiladi", "§4.5", async () => {
  const { ctx, page } = await open();
  await kasal(page).getByRole("button", { name: /Buqa/ }).click();
  await kasal(page).locator(".rxdone").click();
  const msg = await tx(kasal(page).locator(".msg"));
  await ctx.close();
  assert(msg.includes("Yangi flakon ochildi") && msg.includes("Ivermektin"), msg);
});
await t("42", "O'", "Vetapteka: “Tez kunda”, masofa/ochiq/dori bor yo'q", "Q14", async () => {
  const { ctx, page } = await open();
  const box = await tx(kasal(page).locator(".box", { hasText: "Eng yaqin vetapteka" }));
  await ctx.close();
  assert(box.includes("Tez kunda: yaqindagi vetaptekalar va dorilar mavjudligi") && !/km|ochiq|dori bor/.test(box), box);
});

// --- dori ombori ---
await t("43", "O'", "Ombor: 5 dori va 3 namuna birligi; telefonda 1, planshetda 2, kompyuterda 3 ustun", "§4.5", async () => {
  const cols = [];
  for (const w of [390, 768, 1366]) {
    const { ctx, page } = await open({ width: w });
    cols.push(await page.$eval("#ombor .stock", (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length));
    if (w === 390) assert(await page.locator("#ombor .stock li").count() === 8, "soni");
    await ctx.close();
  }
  assert(cols.join(",") === "1,2,3", cols.join(","));
});
await t("44", "M", "“Kam qoldi” belgisi", "§4.5", async () => {
  const { ctx, page } = await open();
  const t1 = await tx(page.locator("#ombor .stock li", { hasText: "Meloksikam" }));
  await ctx.close();
  assert(t1.includes("Kam qoldi"), t1);
});
await t("45", "O'", "Ochilgan flakon: “muddat tasdiqlanmagan” (kun soni yo'q)", "§4.5", async () => {
  const { ctx, page } = await open();
  const all = await tx(page.locator("#ombor"));
  await ctx.close();
  assert(all.includes("Ochilgan: 60 ml · muddat tasdiqlanmagan") && !/kun ichida ishlating/.test(all), all.slice(0, 300));
});
await t("46", "M", "“+ 1 flakon oldim” qo'shadi; fokus tugmada qoladi", "§4.5", async () => {
  const { ctx, page } = await open();
  const btn = page.getByRole("button", { name: "+ 1 flakon oldim: Vitamin (A, D, E)" });
  await btn.click();
  const v = await stockOf(page, "Vitamin");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  await ctx.close();
  assert(v === "400 ml" && focused === "+ 1 flakon oldim: Vitamin (A, D, E)", `${v} ${focused}`);
});
await t("47", "O'", "“Omborni boshidan ko‘rsatish”: ombor va davolash kuni birga tiklanadi", "Q13", async () => {
  const { ctx, page } = await open();
  await kasal(page).locator(".rxdone").click();
  await page.getByRole("button", { name: "+ 1 flakon oldim: Vitamin (A, D, E)" }).click();
  await page.getByRole("button", { name: "Omborni boshidan ko‘rsatish" }).click();
  const yelin = await stockOf(page, "Yelin shpritsi"), vit = await stockOf(page, "Vitamin");
  const day = await tx(kasal(page).locator(".tbody .lbl"));
  await ctx.close();
  assert(yelin === "6 dona" && vit === "300 ml" && day === "1-kun, jami 3 kun", `${yelin} ${vit} ${day}`);
});

// --- eslatma ---
const showReminder = async (page) => { await page.evaluate(() => document.getElementById("eslatma").scrollIntoView()); await page.locator("#eslatma .noti").waitFor({ timeout: 4000 }); };
await t("48", "M", "Bildirishnoma bo'limga kelganda chiqadi", "Q15", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  const before = await page.locator("#eslatma .noti").count();
  await showReminder(page);
  const txt = await tx(page.locator("#eslatma .noti"));
  await ctx.close();
  assert(before === 0 && txt.includes("Dori vaqti: sigir № 0412"), `${before} ${txt}`);
});
await t("49", "Y", "“Keyinroq” maket holatini o'zgartiradi (push yo'q)", "Q15", async () => {
  const { ctx, page } = await open();
  await showReminder(page);
  await page.getByRole("button", { name: "Keyinroq" }).click();
  const st = await tx(page.locator("#eslatma [role=status]"));
  await ctx.close();
  assert(st === "⏰ Namuna: keyinroq eslatish tanlandi. Haqiqiy xabar yuborilmaydi.", st);
});
await t("50", "M", "“Berdim” → “Berildi”, holat e'lon qilinadi", "Q15", async () => {
  const { ctx, page } = await open();
  await showReminder(page);
  await page.getByRole("button", { name: "✓ Berdim" }).click();
  const b2 = page.getByRole("button", { name: "✓ Berildi" });
  const st = await tx(page.locator("#eslatma [role=status]"));
  const r = [await b2.isDisabled(), st];
  await ctx.close();
  assert(r[0] && st.includes("“Berildi” belgilandi") && st.includes("yozuv saqlanmaydi") && st.includes("xabar yuborilmaydi"), JSON.stringify(r));
});
await t("51", "Y", "Namunani qayta ko'rsatish", "§4.6", async () => {
  const { ctx, page } = await open();
  await showReminder(page);
  await page.getByRole("button", { name: "Keyinroq" }).click();
  await page.getByRole("button", { name: "Namunani qayta ko‘rsatish" }).click();
  await page.locator("#eslatma .noti").waitFor({ timeout: 3000 });
  await ctx.close();
});

// --- statistika, holat ---
await t("52", "M", "Statistika chiziqlari to'ladi; juftlash namunasi", "§4.7", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.evaluate(() => document.getElementById("statistika").scrollIntoView());
  await wait(page, 1800);
  const w = await page.$eval("#statBox .tr i", (el) => el.getBoundingClientRect().width);
  const ped = await tx(page.locator("#juftlash"));
  await ctx.close();
  assert(w > 100 && ped.includes("№ 0412"), `${w}`);
});
await t("53", "M", "Holat tablari bosilganda almashadi", "Q16", async () => {
  const { ctx, page } = await open();
  await page.getByRole("tab", { name: /Rejada/ }).click();
  const items = await page.locator("[role=tabpanel] .sf b").allTextContents();
  await ctx.close();
  assert(items.join(",") === "Eng yaqin vetapteka,Emlash kalendari,Tug‘ish eslatmasi", items.join(","));
});
await t("54", "Y", "Tablar: ←/→, Home/End, ARIA va fokus", "Q16", async () => {
  const { ctx, page } = await open();
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  const a = await page.evaluate(() => [document.activeElement.textContent, document.activeElement.getAttribute("aria-selected")]);
  await page.keyboard.press("End");
  const c = await page.evaluate(() => document.activeElement.textContent);
  await page.keyboard.press("ArrowRight");
  const d = await page.evaluate(() => document.activeElement.textContent);
  const panel = await page.getAttribute("[role=tabpanel]", "aria-labelledby");
  const sel = await page.$eval("[role=tab][aria-selected=true]", (e) => e.id);
  await ctx.close();
  assert(a[0].includes("Jarayonda") && a[1] === "true" && c.includes("Rejada") && d.includes("Namuna") && panel === sel, `${a} ${c} ${d} ${panel}/${sel}`);
});

// --- yakun, footer ---
await t("55", "O'", "Yakundagi “Ilova haqida” → ilova holati oynasi; #boshi/#oxiri ga olib boruvchi Boshlash yo'q", "Q17", async () => {
  const { ctx, page } = await open();
  await page.locator("#oxiri").getByRole("button", { name: "Ilova haqida" }).click();
  const ok = await page.locator("dialog[open]").isVisible();
  const bad = await page.$$eval("a", (as) => as.filter((a) => /Boshlash/.test(a.textContent) && /#(boshi|oxiri)/.test(a.getAttribute("href") || "")).length);
  const sub = await tx(page.locator("#oxiri .final > p"));
  await ctx.close();
  assert(ok && bad === 0 && !sub.includes("Bir daqiqada"), `${ok} ${bad} ${sub}`);
});
await t("56", "M", "Footer: logo va 5 bo'lim havolasi", "§4.9", async () => {
  const { ctx, page } = await open({ path: "/savollar" });
  const hrefs = await page.$$eval("footer .fgrid div:nth-child(3) a", (as) => as.map((a) => a.getAttribute("href")));
  await ctx.close();
  assert(hrefs.join(",") === "/#kasal,/#ombor,/#yem,/#eslatma,/#statistika", hrefs.join(","));
});
await t("57", "O'", "Footer aloqasi haqiqiy; soxta shablon yo'q", "Q18", async () => {
  const { ctx, page } = await open();
  const f = await tx(page.locator("footer"));
  const links = await page.$$eval("footer a", (as) => as.map((a) => a.getAttribute("href")));
  await ctx.close();
  const need = ["tel:+998996180300", "https://t.me/MeningFermamUzb", "https://www.instagram.com/meningfermam/", "tel:+998994446544", "https://t.me/Sardorxoja_Vet", "/maxfiylik", "/shartlar"];
  const miss = need.filter((n) => !links.includes(n));
  assert(!miss.length, "yo'q: " + miss.join(","));
  assert(!/__|______|info@meningfermam|meningfermam_bot|9:00–20:00/.test(f) && f.includes("Har kuni 8:00–21:00"), f.slice(0, 300));
});
await t("58", "O'", "Maxfiylik va Shartlar havolalari; 10 ichki sahifa 200; 404 sahifasi", "Q19", async () => {
  const codes = [];
  for (const p of ["/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/daftardan-farqi", "/tez-orada", "/savollar", "/aloqa", "/maxfiylik", "/shartlar"]) codes.push((await fetch(BASE + p)).status);
  const nf = await fetch(BASE + "/yoq-sahifa");
  const { ctx, page } = await open();
  await page.locator("footer").getByRole("link", { name: "Maxfiylik" }).click();
  await page.waitForURL(BASE + "/maxfiylik");
  const h1 = await tx(page.locator("h1"));
  await page.goto(BASE + "/yoq-sahifa");
  const nfText = await tx(page.locator("main"));
  await ctx.close();
  assert(codes.every((c) => c === 200) && nf.status === 404 && h1 === "Maxfiylik siyosati" && nfText.includes("Bosh sahifaga qaytish"), `${codes} ${nf.status} ${h1}`);
});

// --- effektlar ---
await t("59", "M", "Kompyuterda kursor halqasi va tilt", "§8.3", async () => {
  const { ctx, page } = await open({ motion: "no-preference" });
  await page.mouse.move(400, 400); await page.mouse.move(420, 420); await wait(page, 200);
  const op = await page.$eval("#cur", (el) => el.style.opacity);
  const card = await page.locator("#yem .calc").boundingBox();
  await page.evaluate(() => document.getElementById("yem").scrollIntoView());
  await wait(page, 300);
  const cb = await page.locator("#yem .calc").boundingBox();
  await page.mouse.move(cb.x + 20, cb.y + 20); await page.mouse.move(cb.x + 40, cb.y + 40); await wait(page, 100);
  const tilt = await page.$eval("#yem .calc", (el) => el.style.transform);
  await ctx.close();
  assert(op === "1" && /rotateX/.test(tilt) && card, `${op} ${tilt}`);
});
await t("60", "M", "Reduced-motion: hamma kontent ko'rinadi, lenta to'xtagan, raqamlar darhol", "Q02, Q21", async () => {
  const { ctx, page } = await open();
  const pre = await page.locator(".pre").count();
  const notShown = await page.$$eval(".rv", (els) => els.filter((e) => !e.classList.contains("shown")).length);
  const btn = await page.locator(".loopbtn").innerText();
  const a = await loopX(page); await wait(page, 700); const c = await loopX(page);
  await ctx.close();
  assert(pre === 0 && notShown === 0 && btn.includes("Davom ettirish") && a === c, `pre=${pre} notShown=${notShown} ${btn} ${a}→${c}`);
});

// --- qo'shimcha qabul tekshiruvlari ---
await t("Q-meta", "Y", "/yem-rejasi va /savollar meta tavsifi TZ §5 dagidek", "Q22", async () => {
  const { ctx, page } = await open({ path: "/yem-rejasi" });
  const a = await page.getAttribute("meta[name=description]", "content");
  await page.goto(BASE + "/savollar");
  const c = await page.getAttribute("meta[name=description]", "content");
  await ctx.close();
  assert(a === "Kunlik yem, aralashma va xarajat haqida namuna hisob." && c === "Yem rejasi, davolash va xavfsizlik savollariga javoblar.", `${a} | ${c}`);
});
await t("Q-ichki", "Y", "Ichki sahifadan /#yem fragment havolasi bosh sahifa bo'limiga olib boradi", "§6", async () => {
  const { ctx, page } = await open({ path: "/aloqa" });
  await page.locator("header .links").getByRole("link", { name: "Yem" }).click();
  await page.waitForURL(BASE + "/#yem");
  await wait(page, 500);
  const top = await page.$eval("#yem", (el) => el.getBoundingClientRect().top);
  await ctx.close();
  assert(Math.abs(top) < 200, `top=${top}`);
});
await t("Q-davolash", "Y", "/davolash-rejasi: shoshilinch ogohlantirish, namuna va ombor bir sahifada ishlaydi", "§5", async () => {
  const { ctx, page } = await open({ path: "/davolash-rejasi" });
  const warn = await page.locator(".callout.warn a").getAttribute("href");
  await page.locator(".rxdone").click();
  const y = await stockOf(page, "Yelin shpritsi");
  await ctx.close();
  assert(warn === "tel:+998994446544" && y === "5 dona", `${warn} ${y}`);
});

await b.close();
const summary = { total: results.length, passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).map((r) => r.id) };
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify({ at: new Date().toISOString(), base: BASE, summary, results }, null, 2));
console.log(JSON.stringify(summary));
process.exit(summary.failed.length ? 1 : 0);
