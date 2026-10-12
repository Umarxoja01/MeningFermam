// Next 16.4 statik eksporti route group bo'laklarini papka ichiga yozadi (masalan aloqa/__next.!KHNheXQp/aloqa/__PAGE__.txt),
// brauzer esa ularni bitta fayl nomi bilan so'raydi (aloqa/__next.!KHNheXQp.aloqa.__PAGE__.txt — Next'dagi
// convertSegmentPathToStaticExportFilename). Natijada oldindan yuklash 404 beradi. Bu skript build'dan keyin to'g'ri nomli
// nusxalarni yaratadi (asl fayllar qoladi). Next tuzatilsa — keraksiz bo'ladi va hech narsa qilmaydi.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] || "out");
let made = 0;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else yield p;
  }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (!statSync(p).isDirectory() || name === "_next") continue;
    if (name.startsWith("__next.")) {
      for (const f of files(p)) {
        const flat = path.join(dir, path.relative(dir, f).split(path.sep).join("."));
        if (!existsSync(flat)) { copyFileSync(f, flat); made++; }
      }
    } else {
      walk(p);
    }
  }
}

walk(out);
console.log(`Bo'lak fayllari: ${made} ta nusxa yaratildi`);
