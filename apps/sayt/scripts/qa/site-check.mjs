// Sayt tekshiruvi (TZ v3.1 §11.1; Q19–Q22): 11 URL + 404 × 320/390/768/1366/1920 px.
// Har sahifa va kenglikda: gorizontal siljish, konsol/JS xatosi, 44×44 px dan kichik bosiladigan joy,
// axe-core (WCAG 2.1 A/AA), SEO (bitta H1, lang=uz, title, description, canonical, OpenGraph).
// Ishlatish: sayt ishlab turgan bo'lsin (npm run build && npx next start -p 3100), keyin: npm run qa:site
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// hisobot ildizdagi docs/qa ga yoziladi
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const QA = path.join(ROOT, "docs/qa");
const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT_FILE = process.env.OUT_FILE ? path.resolve(process.env.OUT_FILE) : path.join(QA, "site-check.json");
const PAGES = ["/", "/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/daftardan-farqi", "/tez-orada", "/savollar", "/aloqa", "/maxfiylik", "/shartlar"];
const NOT_FOUND = "/bu-sahifa-yoq";
const WIDTHS = [320, 390, 768, 1366, 1920];
const MOTION = ["reduce", "no-preference"];
const FORBIDDEN = [/\+998 __/, /_{4,}/, /info@meningfermam\.uz/, /@meningfermam_bot/, /hozir ochiq/i, /\d+,\d km/, /bepul/i, /pullik/i, /100\s?% ishlaydi/i, /qolib ketmaydi/i, /ertaga eslatma keladi/i, /Video joyi/];

const out = { startedAt: new Date().toISOString(), base: BASE, node: process.version, runs: 0, overflow: [], consoleErrors: [], smallTargets: [], axe: [], seo: [], forbidden: [], status: [] };

const b = await chromium.launch();
out.browser = `chromium ${b.version()}`;

async function check(path, width, motion) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: motion });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  const expected = path === NOT_FOUND ? 404 : 200;
  if (res.status() !== expected) out.status.push({ path, width, got: res.status(), expected });
  // butun sahifani aylantirib chiqish (scroll'da paydo bo'ladigan qismlar uchun)
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
  await page.waitForTimeout(motion === "reduce" ? 100 : 1200);
  out.runs++;

  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (ov.sw > ov.cw) out.overflow.push({ path, width, motion, ...ov });
  // 404 sahifasining o'zi konsolda "404" resurs xatosini beradi — bu kutilgan
  const errs = errors.filter((e) => !(path === NOT_FOUND && /404/.test(e)));
  if (errs.length) out.consoleErrors.push({ path, width, motion, errors: errs });

  if (motion === "reduce") {
    const small = await page.evaluate(() => {
      const sel = "a[href], button, input, select, textarea, summary, [role=tab], [tabindex]:not([tabindex='-1'])";
      const res = [];
      for (const el of document.querySelectorAll(sel)) {
        if (el.closest("[aria-hidden=true], dialog:not([open])")) continue;
        if (el.matches("main[tabindex]")) continue;
        if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (el.classList.contains("skip")) continue; // ekrandan tashqarida, fokusda 44+ px
        if (r.width < 44 || r.height < 44) res.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inline: getComputedStyle(el).display === "inline" });
      }
      return res;
    });
    if (small.length) out.smallTargets.push({ path, width, items: small });

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    for (const v of axe.violations) out.axe.push({ path, width, id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" "), help: v.help });

    if (width === 390) {
      const seo = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        h1: document.querySelectorAll("h1").length,
        title: document.title,
        description: document.querySelector("meta[name=description]")?.content || "",
        canonical: document.querySelector("link[rel=canonical]")?.href || "",
        ogTitle: document.querySelector("meta[property='og:title']")?.content || "",
        ogImage: document.querySelector("meta[property='og:image']")?.content || "",
        robots: document.querySelector("meta[name=robots]")?.content || "",
      }));
      const problems = [];
      if (seo.lang !== "uz") problems.push("lang");
      if (seo.h1 !== 1) problems.push(`h1=${seo.h1}`);
      if (!seo.title) problems.push("title");
      if (path !== NOT_FOUND) {
        if (!seo.description) problems.push("description");
        if (!seo.canonical) problems.push("canonical");
        if (!seo.ogTitle) problems.push("og:title");
        if (!seo.ogImage) problems.push("og:image");
      } else if (!/noindex/.test(seo.robots)) problems.push("404 noindex yo'q");
      out.seo.push({ path, ...seo, problems });

      const text = await page.evaluate(() => document.body.innerText);
      const hits = FORBIDDEN.filter((re) => re.test(text)).map(String);
      if (hits.length) out.forbidden.push({ path, hits });
    }
  }
  await ctx.close();
}

for (const path of [...PAGES, NOT_FOUND]) for (const width of WIDTHS) for (const motion of MOTION) await check(path, width, motion);

// sitemap va robots
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
out.sitemapUrls = (sm.match(/<loc>/g) || []).length;
const rb = await (await fetch(`${BASE}/robots.txt`)).text();
out.robotsHasSitemap = /Sitemap:/i.test(rb);
await b.close();

out.finishedAt = new Date().toISOString();
const strictSmall = out.smallTargets.flatMap((s) => s.items.filter((i) => !i.inline).map((i) => ({ path: s.path, ...i })));
const inlineSmall = out.smallTargets.flatMap((s) => s.items.filter((i) => i.inline).map((i) => ({ path: s.path, ...i })));
out.summary = {
  runs: out.runs,
  status: out.status.length,
  overflow: out.overflow.length,
  consoleErrors: out.consoleErrors.length,
  smallTargetsBlock: strictSmall.length,
  smallTargetsInlineText: inlineSmall.length,
  axeCriticalSerious: out.axe.filter((v) => v.impact === "critical" || v.impact === "serious").length,
  axeAll: out.axe.length,
  seoProblems: out.seo.filter((s) => s.problems.length).length,
  forbidden: out.forbidden.length,
  sitemapUrls: out.sitemapUrls,
  robotsHasSitemap: out.robotsHasSitemap,
};
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.summary, null, 2));
const fail = out.summary.status || out.summary.overflow || out.summary.consoleErrors || out.summary.smallTargetsBlock || out.summary.axeAll || out.summary.seoProblems || out.summary.forbidden || out.sitemapUrls !== 11 || !out.robotsHasSitemap;
process.exit(fail ? 1 : 0);
