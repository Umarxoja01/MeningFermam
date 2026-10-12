// Lokal sinov uchun statik server — hostingdagi public/.htaccess bilan bir xil xatti-harakat:
// /yem-rejasi → yem-rejasi.html; /yem-rejasi/ → 301 /yem-rejasi; topilmasa 404.html (404 holati bilan);
// xavfsizlik sarlavhalari va CSP; kesh qoidasi; gzip siqish. Ishlatish: npm run serve  (standart: out/, port 3100)
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";

const root = path.resolve(process.argv[2] || "out");
const port = Number(process.argv[3] || process.env.PORT || 3100);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".png": "image/png",
  ".webp": "image/webp", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff",
};
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".svg"]);
const SECURITY = {
  "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'",
};

const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };

/** URL yo'li → fayl. Buzilgan URL yoki papkadan tashqariga chiqishga urinish → null (ERR-006). */
function resolve(urlPath) {
  let clean;
  try { clean = decodeURIComponent(urlPath); } catch { return null; }
  if (clean.includes("\0")) return null;
  const p = path.normalize(path.join(root, clean));
  if (p !== root && !p.startsWith(root + path.sep)) return null; // "out2" kabi qo'shni papka ham taqiqlangan
  for (const c of [p, `${p}.html`, path.join(p, "index.html")]) if (isFile(c)) return c;
  return null;
}

function cacheControl(urlPath) {
  if (urlPath.startsWith("/_next/static/")) return "public, max-age=31536000, immutable";
  if (/\.(png|webp|ico|svg|woff2)$/.test(urlPath)) return "public, max-age=86400";
  return "public, max-age=0, must-revalidate";
}

createServer((req, res) => {
  try {
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, SECURITY).end(); return; }
    const pathOnly = (req.url || "/").split("?")[0] || "/";
    // .htaccess bilan bir xil: /yem-rejasi/ → /yem-rejasi (shunday sahifa bo'lsa)
    if (pathOnly.length > 1 && pathOnly.endsWith("/") && resolve(pathOnly.slice(0, -1))) {
      res.writeHead(301, { ...SECURITY, Location: pathOnly.slice(0, -1) }).end();
      return;
    }
    let file = resolve(pathOnly);
    let status = 200;
    if (!file) { file = path.join(root, "404.html"); status = 404; }
    const ext = path.extname(file);
    const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers["accept-encoding"] || ""));
    res.writeHead(status, {
      ...SECURITY,
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": cacheControl(pathOnly),
      ...(gzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
    });
    if (req.method === "HEAD") { res.end(); return; }
    const stream = createReadStream(file);
    stream.on("error", () => res.destroy());
    (gzip ? stream.pipe(createGzip()) : stream).pipe(res);
  } catch {
    // hech qanday so'rov serverni yiqitmasin
    if (!res.headersSent) res.writeHead(400, SECURITY);
    res.end();
  }
}).listen(port, () => console.log(`Statik sayt: http://localhost:${port} (${root})`));
