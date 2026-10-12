// Ko'z bilan ko'rish uchun skrinshotlar: node scripts/qa/shots.mjs [url-yo'llari...]
// Sayt BASE_URL da ishlab turishi kerak (standart http://localhost:3100). Natija: docs/qa/shots/*.png (gitga kirmaydi).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const widths = (process.env.WIDTHS || "390,1366").split(",").map(Number);
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const out = path.resolve(import.meta.dirname, "../../../..", "docs/qa/shots");
fs.mkdirSync(out, { recursive: true });

const b = await chromium.launch();
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    const name = (path === "/" ? "bosh" : path.replace(/\//g, "_").replace(/^_/, "")) + `-${w}.png`;
    await p.screenshot({ path: `${out}/${name}`, fullPage: true });
    console.log(name);
  }
  await ctx.close();
}
await b.close();
