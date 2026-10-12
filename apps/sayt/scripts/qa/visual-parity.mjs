// Demo v12 bilan blokma-blok vizual solishtirish (TZ v3.1 §11.1). 390 va 1366 px, reduced-motion (barqaror holat).
// Har blok: demo va sayt skrinshoti, piksel farqi (pixelmatch). Farqlar qasddan bo'lsa docs/VISUAL_PARITY_REPORT.md da izohlanadi.
// Rasmlar: docs/qa/parity/*.png (gitga kirmaydi); natija: docs/qa/parity/report.json.
// Ishlatish: npm run qa:visual   (DEMO=<demo html yo'li>, standart: ildizdagi meningfermam-demo-v12.html)
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const DEMO = pathToFileURL(path.resolve(process.env.DEMO || path.join(ROOT, "meningfermam-demo-v12.html"))).href;
const OUT = path.join(ROOT, "docs/qa/parity");
const blocks = [
  ["menyu", "header .nav"], ["1-muammo", "#muammo"], ["2-hero", ".hero"], ["3-yem", "#yem"], ["4-kasal", "#kasal"], ["5-ombor", "#ombor"],
  ["6-eslatma", "#eslatma"], ["7-statistika", "#statistika"], ["8-holat", "#holat"], ["9-yakun", "#oxiri"], ["10-footer", "footer"],
];
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
async function shoot(url, width, sel, file) {
  const ctx = await b.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  // skroll chizig'i ikkala tomonda ham joy egallamasin (adolatli solishtirish)
  await page.addStyleTag({ content: "html{scrollbar-width:none}::-webkit-scrollbar{display:none}" });
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({ path: file, animations: "disabled" });
  await ctx.close();
  return PNG.sync.read(fs.readFileSync(file));
}

function diff(a, c, file) {
  const w = Math.max(a.width, c.width), h = Math.max(a.height, c.height);
  const pad = (img) => { const o = new PNG({ width: w, height: h }); o.data.fill(255); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o; };
  const A = pad(a), C = pad(c), D = new PNG({ width: w, height: h });
  const n = pixelmatch(A.data, C.data, D.data, w, h, { threshold: 0.15 });
  fs.writeFileSync(file, PNG.sync.write(D));
  return { demo: `${a.width}×${a.height}`, site: `${c.width}×${c.height}`, diffPct: +((n / (w * h)) * 100).toFixed(2) };
}

const report = { at: new Date().toISOString(), demo: DEMO, base: BASE, threshold: 0.15, rows: [] };
for (const width of [390, 1366]) {
  for (const [name, sel] of blocks) {
    const a = await shoot(DEMO, width, sel, `${OUT}/${name}-${width}-demo.png`);
    const c = await shoot(BASE + "/", width, sel, `${OUT}/${name}-${width}-sayt.png`);
    const r = diff(a, c, `${OUT}/${name}-${width}-farq.png`);
    report.rows.push({ block: name, width, ...r });
    console.log(`${name.padEnd(14)} ${width}px  demo ${r.demo.padEnd(10)} sayt ${r.site.padEnd(10)} farq ${r.diffPct}%`);
  }
}
await b.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
