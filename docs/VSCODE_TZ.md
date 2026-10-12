# VS Code'da ishlash bo'yicha qo'llanma

MeningFermam — **faqat frontend**: ommaviy sayt to'liq statik eksport qilinadi (egasi qarori, 2026-10-12).
Server tomonda Node.js, baza yoki admin panel yo'q. Backend (admin, baza) loyihadan tashqariga arxivlangan:
`Downloads/meningfermam-backend-arxiv-2026-10-12`.

| Papka | Nima |
|---|---|
| `apps/sayt` | Ommaviy sayt: Next.js 16.4 (`output: "export"`), React 19.2, TypeScript strict, Tailwind v4 + `sayt.css` |
| `packages/content` | Kontent sxemalari (zod) va kontent qoidalari — sayt kontentini test qilish uchun |

Asos hujjatlar: TZ v3.1 (PDF), demo v12, `docs/DECISIONS.md`, `docs/MATNLAR_QORALAMA.md`.

## Ishga tushirish (ildiz papkadan)

```bash
npm install
npm run dev            # ishlab chiqish: http://localhost:3000
npm run build          # statik sayt: apps/sayt/out/
npm run serve          # out/ ni hostingdagidek ko'rish: http://localhost:3100
```

`apps/sayt/.env.example` → `apps/sayt/.env.local` (ixtiyoriy, build vaqtida o'qiladi): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_HERO_VIDEO`.

## Tuzilma (`apps/sayt`)

| Joy | Nima |
|---|---|
| `src/app/(sayt)/` | 11 ommaviy sahifa, `sayt.css` |
| `src/app/not-found.tsx`, `sitemap.ts`, `robots.ts` | 404, SEO fayllari (statik) |
| `src/components/sayt/v2/` | UI komponentlar |
| `src/content/*.ts` | **Barcha matn va kontakt** |
| `src/lib/` | Yem hisobi, narx xotirasi (localStorage), ombor reducer'i |
| `public/.htaccess` | Apache: toza URL, 404, HTTPS, xavfsizlik sarlavhalari, kesh |
| `scripts/flatten-segments.mjs` | Build'dan keyin: Next 16.4 statik eksportidagi bo'lak fayllari nomini to'g'rilaydi (oldindan yuklash 404 bermasin) |
| `scripts/serve-static.mjs` | Lokal statik server (`.htaccess` bilan bir xil xatti-harakat) |
| `tests/`, `scripts/qa/` | Unit testlar, brauzer tekshiruvlari |

## Matn yoki kontaktni o'zgartirish

`apps/sayt/src/content/` dagi faylni tahrirlang (masalan, email va manzil — `aloqa.ts`, savollar — `savollar.ts`) →
`npm test` (sxema va kontent qoidalari: soxta kontakt, "bepul", prognoz…) → `npm run build` → `out/` ni hostingga qayta yuklang.

## Hostingga yuklash

`apps/sayt/out/` papkasining **ichidagi hamma narsa** (yashirin `.htaccess` ham) hostingdagi sayt ildiziga yuklanadi.

- **Apache (oddiy hosting, cPanel):** `.htaccess` hammasini sozlaydi — `mod_rewrite` va `mod_headers` yoqilgan bo'lsin. HTTPS sertifikatini hosting panelidan yoqing.
- **nginx:**

```nginx
server {
  listen 443 ssl http2;
  server_name meningfermam.uz;
  root /var/www/meningfermam/out;

  location / { try_files $uri $uri.html $uri/index.html =404; add_header Cache-Control "public, max-age=0, must-revalidate"; }
  rewrite ^/(.+)/$ /$1 permanent;
  error_page 404 /404.html;

  gzip on;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml image/svg+xml;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
  add_header Content-Security-Policy "base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
  location /_next/static/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location ~* \.(png|webp|ico|svg|woff2)$ { add_header Cache-Control "public, max-age=86400"; }
}
server { listen 80; server_name meningfermam.uz www.meningfermam.uz; return 301 https://meningfermam.uz$request_uri; }
```

Yuklagandan keyin tekshiring: `/`, `/yem-rejasi`, `/yem-rejasi/` (→ `/yem-rejasi`), `/bu-yoq` (404 sahifa), `/sitemap.xml`, `/robots.txt`.

## Tekshiruv tartibi (har o'zgarishdan keyin, ildizdan)

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run serve                        # alohida terminalda (3100)
npm run qa:site                      # 11 URL + 404 × 5 kenglik: overflow, konsol, 44 px, axe, SEO
npm run qa:behavior                  # 60 amal + Q-ssenariylar
npm run qa:visual                    # demo v12 bilan blokma-blok
```

Birinchi marta: `npx playwright install chromium`. Natijalar `docs/qa/` ga; `docs/TEST_REPORT.md` ni yangilang.
Git Bash'da `MSYS_NO_PATHCONV=1` kerak bo'lishi mumkin. `npm run build` paytida `serve` to'xtatilgan bo'lsin (Windows `out/` ni band qiladi).

## Qoidalar

- TZ v3.1 + `docs/DECISIONS.md` (egasi qarorlari) ustuvor.
- Kontent qoidalari bitta joyda: `packages/content/src/rules.ts`.
- Har bosiladigan joy ≥44×44 px; reduced-motion'da animatsiya yo'q.
- Saytda server kodi yo'q: cookie, server action, API, `headers()` ishlatilmaydi (statik eksportda ishlamaydi).
- "TEST O'TDI" faqat bajarilgan buyruq natijasi bilan yoziladi.
