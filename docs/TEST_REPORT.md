# Test hisoboti

**Sana:** 2026-10-12, 14:38–14:48 (UTC+5).
**Muhit:** Windows 11 Home (10.0.26200), Node.js 24.21.0, npm 11.19.0, Next.js 16.4.0, React 19.2.8, TypeScript 5.9.3, Vitest 5.0.3, Playwright 1.64.0 (Chromium 156.0.8078.4, headless), axe-core 4.13.
**Sayt:** `npx next build` → `npx next start -p 3100` (production build, lokal). Tekshiruvlar lokal kompyuterda; bu staging/production natijasi emas.

Belgilar: **O'TDI** — buyruq bajarilib natija olingan; **QISMAN** — bir qismi tekshirilgan; **BAJARILMAGAN** — tekshirilmagan.

## 1. Avtomatik tekshiruvlar (TZ §11.1)

| Tekshiruv | Buyruq | Natija |
|---|---|---|
| Lint | `npm run lint` | O'TDI: 0 xato, 0 ogohlantirish |
| Tiplar | `npm run typecheck` (`tsc --noEmit`, strict) | O'TDI: 0 xato |
| Unit testlar | `npm test` | O'TDI: 4 fayl, 50/50 (yem hisobi, narx xotirasi, zot yo'qligi, doza, ombor/qisman bajarish/idempotentlik/reset, kontent qoidalari) |
| Build | `npm run build` | O'TDI: 11 sahifa + 404 + sitemap/robots/ikonkalar statik (○) |
| Sayt tekshiruvi | `npm run qa:site` | O'TDI: 12 URL (11 + 404) × 5 kenglik (320/390/768/1366/1920) × 2 harakat rejimi = 120 ishga tushirish. Gorizontal siljish 0; konsol/JS xatosi 0; 44×44 px dan kichik bosiladigan joy 0; axe (WCAG 2.1 A/AA) buzilish 0; SEO muammo 0; taqiqlangan ibora 0; sitemap 11 URL; robots.txt da sitemap bor. Natija: `docs/qa/site-check.json` |
| Xatti-harakat | `npm run qa:behavior` | O'TDI: 63/63 (60 amal + 3 qo'shimcha). Natija: `docs/qa/behavior.json` |
| Vizual moslik | `npm run qa:visual` | O'TDI (o'lchandi): 11 blok × 390/1366 px; farq 0,17–12,89 %. Izoh: `docs/VISUAL_PARITY_REPORT.md` |
| Paket xavfsizligi | `npm audit --omit=dev` / `npm audit` | Production: 0. Dev: 5 "high" (eslint-config-next → braces/micromatch; faqat lint vositasi) |

Tekshiruv paytida topilib tuzatilgan xatolar:
1. Lentadagi kartochkani sichqoncha bilan bosganda, fokus lentani surib yuborardi va bosish o'tkazib yuborilardi (test 10). Tuzatildi: faqat klaviatura fokusida suriladi.
2. "+1 flakon oldim" bosilganda fokus yo'qolardi (kartochka qayta yaratilardi). Tuzatildi.
3. Tez ikki marta bosish keyingi kunni ham bajarib yuborishi mumkin edi. Tuzatildi: 1,2 s qulf.
4. Sahifa metadata'sida og:image tushib qolgan edi. Tuzatildi.
5. Footer havolalari va matn ichidagi telefon havolasi 44 px dan kichik edi. Tuzatildi.

## 2. Qabul ssenariylari Q01–Q24 (TZ §11.2)

| Q | Mazmun | Natija | Dalil |
|---|---|---|---|
| Q01 | 9 kartochka, "Vazn" → #yem; surish bosmaydi | O'TDI | behavior 10, 13, 14; content.test |
| Q02 | Lenta pauza/davom, ekrandan chiqqanda pauza, reduced-motion | O'TDI | behavior 07, 11, 12, 60 |
| Q03 | H1 aynan; "Qanday qilib?" → #yem | O'TDI | behavior 16; content.test |
| Q04 | Yemda zot yo'q; nasab buzilmagan | O'TDI | feed-calc.test; behavior 19 |
| Q05 | 36 400 so'm/kun; 1 092 000 so'm/oy | O'TDI | feed-calc.test; behavior 23 |
| Q06 | Beda +100 → 36 900; reload'da saqlanadi; 0 saqlanadi; reset | O'TDI | prices.test; behavior 26–29 |
| Q07 | Sigir/buqa/qo'y variantlari; NaN/manfiy yo'q | O'TDI | feed-calc.test (barcha kombinatsiyalar); behavior 18, 20, 21 |
| Q08 | Sut/vazn prognozi yo'q | O'TDI | feed-calc.test; behavior 24 (barcha holatlar) |
| Q09 | Alomat tashxis emas | O'TDI | behavior 32. Izoh: egasi qarori (E-09) bilan klinik ma'lumot saqlangan |
| Q10 | Shoshilinchda veterinar birinchi | O'TDI | behavior 33; content.test |
| Q11 | Dori yetmasa "Tugadi" bo'lmaydi | O'TDI | drug-store.test; behavior 37, 38, 40 |
| Q12 | Qoldiq manfiy emas; bir bosish — bir ayirish | O'TDI | drug-store.test (3000 tasodifiy amal); behavior 39 |
| Q13 | Ombor reset izchil | O'TDI | drug-store.test; behavior 47 |
| Q14 | Vetapteka uydirmasi yo'q, "Tez kunda" | O'TDI | behavior 17, 42; content.test |
| Q15 | "Keyinroq"/"Berdim" maket holati, push yo'q | O'TDI | behavior 48–51 |
| Q16 | Tablar: mouse/klaviatura/ARIA/fokus | O'TDI | behavior 53, 54 |
| Q17 | Boshlash → tasdiqlangan fallback ("Tez kunda") | O'TDI | behavior 03, 55 |
| Q18 | Kontakt uydirilmagan | O'TDI | behavior 06, 57; content.test |
| Q19 | /maxfiylik, /shartlar; 10 ichki sahifa | O'TDI | behavior 58; site-check (status) |
| Q20 | 320/390/768/1366/1920 overflow va klaviatura fokusi | QISMAN | Overflow: site-check (0). Klaviatura: lenta, tablar, oyna, narx maydonlari avtomat; butun sahifani qo'lda Tab bilan aylanib chiqish BAJARILMAGAN |
| Q21 | 44×44 px, kontrast, reduced-motion | O'TDI | site-check (kichik joy 0; axe kontrast 0); behavior 60 |
| Q22 | SEO: 2 meta, sitemap, robots, OG, bitta H1, lang=uz | O'TDI | site-check (SEO 0, sitemap 11); behavior Q-meta |
| Q23 | Haqiqiy Android/iPhone, scroll, 5 fermer | BAJARILMAGAN | Egasi tashkil qiladi |
| Q24 | Hisobot vaqt, buyruq, muhit, pass/fail bilan | O'TDI | Ushbu hujjat |

## 3. 22 nazorat bandi (TZ §13)

| Band | Holat | Qayerda |
|---|---|---|
| K-01 Qisman bajarishda "Tugadi" | Yopildi | drug-store.ts, A varianti |
| K-02 Tasdiqlanmagan "tasdiqlangan" yorliqlar | **Ochiq — egasi qarori (E-10)** | Muhr, "Sertifikatli", "vrachlar belgilagan" demodagidek |
| K-03 Uydirma vetapteka | Yopildi | "Tez kunda" |
| F-01 Boshlash #boshi/#oxiri | Yopildi | StartButton |
| F-02 Lenta to'xtatish tugmasi | Yopildi | ProblemLoop |
| F-03 Ekrandan chiqqanda pauza | Yopildi | ProblemLoop |
| F-04 Tab strelkalari | Yopildi | FeatureTabs |
| F-05 44 px dan kichik tugmalar | Yopildi | sayt.css; site-check 0 |
| F-06 "Keyinroq" natijasiz | Yopildi | ReminderDemo |
| F-07 Placeholder telefon/manzil | Yopildi | aloqa.ts |
| F-08 Maxfiylik/Shartlar havolasi | Yopildi | footer, 2 sahifa |
| F-09 Funksiyalar holati farqi | Qisman — yagona manba bor; "Ishlaydi" dalilsiz (E-11) | holat.ts |
| F-10 Yem narxi 0 tiklanmaydi | Yopildi | prices.ts |
| F-11 Tarixiy CSS aralash | Yopildi | sayt.css (yakuniy holat) |
| T-01 D-25 va 1-blok | Yopildi | Hero yagona CTA; kartochkalar saqlangan |
| T-02 "Ertaga eslatma keladi" | Yopildi | content.test |
| T-03 Narx taqiqi | Yopildi | Faqat xizmat narxi taqiqlangan; yem narxi bor |
| T-04 Eslatma sarlavhasi | Yopildi | "Dori eslatmasi qanday ishlaydi?" |
| T-05 Dalilsiz ✓ | Yopildi | Ushbu hisobot faqat bajarilgan testlar bilan |
| T-06 2 meta tavsif | Yopildi | seo.ts; behavior Q-meta |
| Y-01 Prognoz va'dalari | Yopildi | feed-calc.ts |
| Y-02 Zot hisobda | Yopildi | feed-calc.ts |

## 4. Bajarilmagan tekshiruvlar

- Haqiqiy Android (Chrome, Yandex Browser) va iPhone (Safari 15+) qurilmalarida ko'rik; desktop Firefox/Safari/Edge. Faqat Chromium (headless) ishlatildi.
- 5 fermer bilan "10 soniya" sinovi (TZ §1.3).
- LCP/CLS/INP: staging yoki production'da o'lchanadi (TZ §9.2). Lokal build natijasi foydalanuvchi natijasi emas.
- Butun sahifani qo'lda klaviatura bilan aylanib chiqish va ekran o'quvchi (NVDA/VoiceOver) bilan sinov.
- Maxfiylik va Shartlar matnlarini yuridik ko'rikdan o'tkazish.
- Klinik matnlarni veterinariya mutaxassisi ko'rigidan o'tkazish (TZ §11.3).

---

# C1 bosqichi: repozitoriy tuzilmasi, kontent turlari, baza sxemasi

**Sana:** 2026-10-12, 15:24–15:35 (UTC+5). **Muhit:** yuqoridagi bilan bir xil; baza testlari PGlite 0.5.9 (WASM PostgreSQL), Drizzle ORM 0.45.4, drizzle-kit 0.31.11, zod 4.6.6.

| Tekshiruv | Buyruq (ildizdan) | Natija |
|---|---|---|
| Lint (4 workspace) | `npm run lint` | O'TDI: 0 xato |
| Tiplar (4 workspace) | `npm run typecheck` | O'TDI: 0 xato |
| Kontent sxemalari va qoidalari | `npm test -w packages/content` | O'TDI: 10/10 |
| Baza: migratsiyalar, cheklovlar, trigger'lar | `npm test -w packages/db` | O'TDI: 14/14 — 12 jadval; telefon logini; (tur, kalit) unique; klinik tur belgisi; versiya raqami unique va xesh formati; versiya o'zgarmas/o'chirilmas; bitta joriy nashr va versiya o'z birligidan; tekshiruvchi ≠ muallif; klinik tasdiq faqat klinik kontentga; SVG/hajm/tur cheklovi; jurnal faqat qo'shiladi (UPDATE/DELETE/TRUNCATE rad); sessiya muddati; oxirgi faol administrator |
| Sayt unit testlari | `npm test -w apps/sayt` | O'TDI: 52/52 (yangi: sayt kontenti umumiy sxemalarga mos) |
| Build | `npm run build` | O'TDI: sayt 11 sahifa + 404 statik; admin bo'sh sahifa statik |
| Sayt brauzer tekshiruvi (ko'chirishdan keyin) | `npm run qa:site` | O'TDI: 120 ishga tushirish, barcha ko'rsatkichlar 0, sitemap 11 |
| Sayt xatti-harakati (ko'chirishdan keyin) | `npm run qa:behavior` | O'TDI: 63/63 |
| Admin sarlavhalari | `curl -sI localhost:3200` | O'TDI: `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'`; robots.txt `Disallow: /` |
| Paket xavfsizligi | `npm audit --omit=dev` / `npm audit` | Production: 0. Dev: 9 (5 high — eslint-config-next zanjiri; 4 moderate — drizzle-kit ichidagi eski esbuild). Faqat dev vositalari (D-16, D-20) |

Bajarilmagan (C1 doirasida emas): haqiqiy PostgreSQL serverida migratsiya (Eskiz VPS olingach), admin kirishi va sessiyalar (C2), kontent tahrirlash (C3–C4).

---

# C2 bosqichi: admin panelga kirish

**Sana:** 2026-10-12, 15:46–16:00 (UTC+5). **Muhit:** yuqoridagi bilan bir xil; @node-rs/argon2 2.2.2, otpauth 9.5.2, qrcode 1.5.4. E2E: admin production build (`next start -p 3200`), fayldagi PGlite test bazasi (`npm run qa:prepare`), Chromium.

| Tekshiruv | Buyruq | Natija |
|---|---|---|
| Lint, tiplar (4 workspace) | `npm run lint`, `npm run typecheck` | O'TDI: 0 xato |
| Kirish xizmati unit testlari | `npm test -w apps/admin` | O'TDI: 21/21 — telefon/IP normallashtirish; AES-GCM (buzilgan shifr rad); parol siyosati; HIBP k-anonimlik (faqat 5 belgi yuboriladi, internetsiz null); administrator yaratish (noto'g'ri telefon, zaif/sizib chiqqan parol, takroriy login rad); birinchi kirish → sozlash → 10 zaxira kod; oraliq sessiya bilan admin'ga kirib bo'lmaydi; TOTP replay rad; zaxira kod bir marta; kod bosqichida 5 xato → sessiya yopiladi; oraliq sessiya 10 daqiqada eskiradi; blok 15 → 30 daqiqa; mavjud bo'lmagan login ham "cheklangan"; IP cheklovi; 30 daqiqa harakatsizlik va 12 soat umumiy muddat; faolsizlantirilgan foydalanuvchi; chiqish va hamma qurilmalardan chiqish; parol o'zgarsa barcha sessiyalar yopiladi; bazada parol/token/TOTP siri/zaxira kod ochiq holda yo'q va jurnalda amallar bor |
| Baza testlari (0002 migratsiyasi bilan) | `npm test -w packages/db` | O'TDI: 14/14 |
| Sayt testlari | `npm test -w apps/sayt` | O'TDI: 52/52 (sayt o'zgarmagan) |
| Build | `npm run build` | O'TDI: sayt statik; admin — barcha sahifalar dinamik + Proxy (CSP) |
| Admin E2E | `npm run qa:auth -w apps/admin` | O'TDI: 10/10 — AQ01 (4 himoyalangan yo'l → /kirish; no-store, noindex, DENY, har so'rovda yangi nonce'li CSP, `unsafe-inline` yo'q); AQ02 (QR bilan sozlash, 10 zaxira kod, cookie `__Host-` HttpOnly/Secure/Strict; kod bosqichida bosh ekran ochilmaydi; noto'g'ri kod rad; zaxira kod bir marta); AQ03 (5 xatodan keyin to'g'ri parol ham rad; mavjud bo'lmagan login uchun ham xuddi shu xabar); AQ06 (server action cookie'siz → /kirish; boshqa Origin bilan → rad); AQ13 (parol o'zgarganda ikkinchi qurilma chiqariladi, eski parol ishlamaydi; "Hamma qurilmalardan chiqish"); konsolda CSP buzilishi 0. Natija: `docs/qa/admin-auth.json` |
| Paket xavfsizligi | `npm audit --omit=dev` | Production: 0 |

Topilib tuzatilgan xatolar:
1. Sozlash tasdiqlangach zaxira kodlar ko'rinmay qolardi (cookie o'zgargach sahifa qayta render bo'lib, boshqa sahifaga yo'naltirardi). Tuzatildi: sahifa daraxti saqlanadi.
2. Admin build env'siz sahifani oldindan render qilmoqchi bo'lardi. Tuzatildi: admin sahifalari doim dinamik.
3. Turbopack migratsiya papkasini bundle'ga qo'shmoqchi bo'lardi. Tuzatildi: migratsiya alohida modul (`@meningfermam/db/migrate`).

Bajarilmagan: haqiqiy serverda (HTTPS, Caddy, `TRUST_PROXY=1`) IP cheklovini sinash; HIBP xizmatiga haqiqiy so'rov (unit testda soxta javob bilan); WebAuthn (keyingi bosqich taklifi).

---

# C3 bosqichi: kontentni tahrirlash (aloqa, funksiyalar holati, savol-javob)

**Sana:** 2026-10-12, 16:10–16:26 (UTC+5). **Muhit:** yuqoridagi bilan bir xil. E2E: admin production build, toza PGlite bazasi (`qa:prepare`: 5 foydalanuvchi, shu jumladan muharrir; saytdagi kontent 1-versiya sifatida).

| Tekshiruv | Buyruq | Natija |
|---|---|---|
| Lint, tiplar | `npm run lint`, `npm run typecheck` | O'TDI: 0 xato |
| Kontent xizmati unit testlari | `npm test -w apps/admin` | O'TDI: 33/33 (kirish 21 + kontent 12): kalit tartibidan qat'i nazar bir xil xesh; farq; noto'g'ri ma'lumot versiya yaratmaydi; o'zgarmagan ma'lumot — versiya yo'q; conflict; klinik tekshiruvchi tahrirlay olmaydi; muharrir nashr qila olmaydi; nashrgacha sayt uchun eski versiya; ko'rib chiqish → nashr; kontent qoidasi ogohlantirishi va tasdiq bilan nashr (jurnalda); klinik kontent nashr qilinmaydi (C4); tiklash va tarix |
| Barcha testlar | `npm test` | O'TDI: 109/109 (kontent 10, baza 14, admin 33, sayt 52) |
| Admin kontent E2E | `npm run qa:content -w apps/admin` | O'TDI: 13/13 — AQ01 (kontent sahifalari yopiq); qoralama saqlanadi, nashr o'zgarmaydi; noto'g'ri telefon saqlanmaydi; farq jadvali; AQ09 nashr; AQ10 tiklash + tarix; bir vaqtda tahrirda conflict va tahrir saqlanib qoladi; funksiya qo'shish, bo'sh tab rad; "bepul" — ogohlantirish va tasdiq bilan nashr; AQ04 muharrir: nashr tugmasi yo'q, ushlangan nashr so'rovi muharrir cookie'si bilan rad etildi, ko'rib chiqishga yuborish ishlaydi; administrator ko'rib chiqishdagini nashr qiladi; 390 px da bosish yuzasi ≥44 px va konsolda xato 0. Natija: `docs/qa/admin-content.json` |
| Admin kirish E2E (qayta) | `npm run qa:auth -w apps/admin` | O'TDI: 10/10 |
| Paket xavfsizligi | `npm audit --omit=dev` | Production: 0 |

Topilib tuzatilgan xatolar:
1. Bir vaqtda tahrirda "conflict" bo'lganda sahifa yangilanib, foydalanuvchining saqlanmagan o'zgarishlari jimgina yo'qolardi. Tuzatildi: sahifa faqat muvaffaqiyatli saqlashdan keyin yangilanadi.
2. Tarmoq xatosida Next'ning standart xato sahifasi qat'iy CSP tomonidan bloklanardi. Tuzatildi: o'z xato sahifalari.
3. ↑/↓ tugmalari eni 37 px edi. Tuzatildi: ≥44 px.

Bajarilmagan (C3 doirasida emas): nashr qilingan kontentning saytda ko'rinishi (C6); bosh sahifa, ichki sahifalar, SEO, yem narxlari, klinik namunalar tahriri (C4); media (C5).

---

# Faqat frontend: backend olib tashlandi, sayt statik (egasi qarori E-21)

**Sana:** 2026-10-12, 16:40–17:10 (UTC+5). **Muhit:** Windows 11, Node 24.21.0, Next.js 16.4.0, Playwright 1.64 (Chromium 156). Sayt: `npm run build` (statik eksport, `apps/sayt/out/`) → `npm run serve` (`scripts/serve-static.mjs`, port 3100).

Yuqoridagi C1–C3 bo'limlari endi arxivlangan backend'ga tegishli (`Downloads/meningfermam-backend-arxiv-2026-10-12`); ularning natijalari tarix sifatida qoldirildi.

| Tekshiruv | Buyruq | Natija |
|---|---|---|
| Backend paketlari | `ls node_modules` | O'TDI: drizzle, pglite, postgres, argon2, otpauth — 0 ta |
| Lint, tiplar | `npm run lint`, `npm run typecheck` | O'TDI: 0 xato |
| Unit testlar | `npm test` | O'TDI: 62/62 (kontent sxemalari 10, sayt 52) |
| Statik build | `npm run build` | O'TDI: 11 sahifa + 404 + sitemap/robots/ikonkalar → `out/` (2,7 MB); bo'lak fayllari: 12 nusxa |
| Statik server yo'llari | `curl` | O'TDI: `/`, `/yem-rejasi`, `/aloqa` → 200; `/yem-rejasi/` → 301 `/yem-rejasi`; noma'lum yo'l → 404 sahifa; `/../package.json` va `%2e%2e` → 404; xavfsizlik sarlavhalari bor |
| Sayt tekshiruvi | `npm run qa:site` | O'TDI: 120 ishga tushirish — holat, siljish, konsol xatosi, 44 px dan kichik joy, axe, SEO, taqiqlangan ibora — hammasi 0; sitemap 11 URL |
| Xatti-harakat | `npm run qa:behavior` | O'TDI: 63/63 (yem hisobi va narx xotirasi, davolash/ombor, eslatma, tablar, "Tez kunda" oynasi, footer va h.k. statik saytda ham ishlaydi) |
| Vizual moslik | `npm run qa:visual` | O'TDI (o'lchandi): natijalar statik eksportdan oldingisi bilan raqamma-raqam bir xil (0,17–12,89 %) |
| Paket xavfsizligi | `npm audit --omit=dev` / `npm audit` | Production: 0. Dev: 5 high (eslint-config-next zanjiri, faqat lint) |

Topilib tuzatilgan xatolar:
1. Statik build `robots.txt`/`sitemap.xml` da to'xtadi. Tuzatildi: `dynamic = "force-static"`.
2. Har sahifada 4 ta 404: Next 16.4 statik eksporti route group bo'laklarini brauzer kutganidan boshqa nom bilan yozadi; oldindan yuklash ishlamasdi. Tuzatildi: build'dan keyin `flatten-segments.mjs` (404 → 0; sahifalararo o'tish tekshirildi).
3. Apache'da `/aloqa` ham fayl (`aloqa.html`), ham papka (`aloqa/`) bo'lgani uchun papkaga yo'naltirilishi mumkin edi. Tuzatildi: `.htaccess` da `DirectorySlash Off` va maxsus qoida.

Bajarilmagan: haqiqiy Apache/nginx hostingda `.htaccess` sinovi (hosting olingach); haqiqiy Android/iPhone va 5 fermer sinovi; LCP/CLS/INP o'lchovi (hostingda).

---

# Audit (2026-10-12, 17:10–17:45): faqat frontend sayt

**Qamrov:** `apps/sayt` (statik eksport), `packages/content`, build/QA skriptlari, hosting sozlamasi (`public/.htaccess`, nginx namunasi). Backend arxivlangan — qamrovda emas.
**Usul:** kod tahlili + qayta yuzaga keltirish (Playwright/Chromium 156, curl) + tuzatish + 3 bosqichli tekshiruv (statik → funksional → regressiya).

| ID | Daraja | Joy | Muammo | Dalil (qayta yuzaga keltirish) | Holat |
|---|---|---|---|---|---|
| ERR-001 | MEDIUM | `src/components/sayt/v2/StartButton.tsx` | `showModal()` shartsiz chaqirilardi; `method="dialog"` formasi | `showModal` olib tashlangan brauzerda "Boshlash" → `TypeError`, oyna ochilmadi | TESTDAN O'TDI: zaxira qatlam ochiladi, Escape/fon/"Yopish" yopadi, fokus qaytadi; oddiy brauzerda `:modal` |
| ERR-002 | MEDIUM | `src/app/(sayt)/sayt.css` | `color-mix()` zaxira qiymatsiz (5 joy: menyu, pastki menyu fonlari va b.) | Kod tahlili: Safari < 16.2 da qiymat bekor → fon shaffof | TESTDAN O'TDI: `color-mix` 0 ta (Tailwind'dagisi `@supports` ichida); fonlar aynan avvalgidek |
| ERR-003 | MEDIUM | `public/.htaccess` | Siqish (brotli/gzip) sozlanmagan | Bosh sahifa 821 KB siqilmagan; LCP 2,6–2,9 s (lokal, sekin 4G + 4x CPU) | TESTDAN O'TDI (lokal serverda): HTML 85,8 → 15,7 KB; jami ≈357 KB; LCP 1,6–2,3 s. Apache'da sinalmagan |
| ERR-004 | MEDIUM | `public/.htaccess` | Nomi o'zgarmaydigan fayllar (logo, og.png, ikonka) 1 yil `immutable` keshlanardi | Kod tahlili: `FilesMatch` hamma `.png/.webp` ga tegishli | TUZATILDI: lokal server bilan bir xil qoida tekshirildi; Apache'da sinalmagan |
| ERR-005 | LOW | `sayt.css` | Chop etishda scroll'da paydo bo'ladigan bloklar ko'rinmasdi | `print` emulyatsiyasi: 15 dan 2 blok `opacity: 0` | TESTDAN O'TDI: 0 ta yashirin |
| ERR-006 | LOW | `scripts/serve-static.mjs` | Buzilgan URL serverni yiqitardi; papka tekshiruvi `startsWith(root)` | `/%E0%A4%A` → jarayon `URIError` bilan chiqib ketdi | TESTDAN O'TDI: 404, server ishlayveradi; `../outx`, `%2e%2e`, null bayt → 404 |
| ERR-007 | LOW | `Hero.tsx` → `HeroVideo.tsx` | Video `autoplay` bilan — reduced-motion'ga bo'ysunmasdi (TZ §8.3) | Kod tahlili (video hozir berilmagan) | TESTDAN O'TDI (sinov video manzili bilan build): reduce → `play()` 0, aks holda 1 |

Tasdiqlanmagan gumonlar (xato emas): qorong'i rejimda fon oq qoladi ✓; shrift yuklangach lenta kengligi o'zgarmaydi ✓; 13 sahifadagi 415 havoladan singani 0 ✓; takroriy `id` 0 ✓; CLS 0 ✓.

**Regressiya (17:32–17:42):** lint 0, TypeScript 0, unit 62/62, site-check 120 ishga tushirishda hamma ko'rsatkich 0, xatti-harakat 63/63, vizual natijalar avvalgisi bilan bir xil, `npm run qa:audit` hammasi ✓, production paketlarida zaiflik 0.

**Qoldiq xavflar:**
1. TZ §9.1 "iOS Safari 15+" talab qiladi, Next 16 va Tailwind v4 esa rasman Safari 16.4+ ni qo'llab-quvvatlaydi. ERR-001/002 eski brauzer xavfini kamaytirdi, lekin iOS 15–16.3 da to'liq ishlash kafolatlanmaydi — haqiqiy qurilmada sinalmagan.
2. `.htaccess` haqiqiy Apache hostingda sinalmagan; HTTPS qoidasi domenga bog'langan va hosting proxy orqasida bo'lsa qayta sozlash kerak bo'lishi mumkin.
3. Loyiha git'da emas — o'zgarishlar tarixi va qaytarish imkoni yo'q.
4. LCP raqamlari lokal o'lchov; TZ bo'yicha haqiqiy natija hostingda o'lchanadi.
5. © yili build vaqtida yoziladi — yangi yilda qayta build kerak.

---

# Professional audit tuzatishlari (2026-10-12)

**Tekshiruv vaqti:** 19:01–19:10 (UTC+5). **Qamrov:** joriy statik frontend. **Muhit:** Node.js 24.21.0, Next.js 16.4.0 (Turbopack), Playwright/Chromium 156.0.8078.4; `apps/sayt/out/` lokal statik serverda (`http://localhost:4311`).

Egasi auditdagi tuzatishlarni “boshla” bilan tasdiqladi (E-22). Manba fayllari o'zgartirishdan oldin vaqtinchalik papkaga nusxalandi. Quyidagi natijalar yangi buildga tegishli; oldingi hisobotlar tarix sifatida saqlangan.

## Tuzatilgan kamchiliklar

1. Buzoq ich ketishi va buqa oqsoqlanishi uchun yetishmayotgan dorilar namuna omboriga qo'shiladi. Qadoq/doza haqida ma'lumot bo'lmagan uch tur uchun birlik aniq **“namuna birligi”**: haqiqiy ml yoki mahsulot hajmi o'ylab topilmadi. Barcha namuna kurslarini oxirigacha sinash mumkin.
2. Takroriy kunlar `treatmentDays` bilan alohida kuzatiladi: buqa 1 → 14, qo'y 1 → 10. Birinchi bosqichdan keyin yakunlangan deyilmaydi. Takroriy bosish ombordan ikki marta ayirmaydi. Tugma faqat namuna bosqichlari bajarilganini bildiradi; doza formulalari va klinik yo'riqnomalar o'zgartirilmagan.
3. Harakat rejimi almashtirilganda yem summasi eski qiymatga qaytmaydi; yarim yo'ldagi animatsiya ham to'g'ri yakunlanadi.
4. JavaScript ishlamasa ham barcha asosiy bo'lim sarlavhalari ko'rinadi.
5. Eski brauzer uchun zaxira oynada Tab/Shift+Tab va dasturiy fokus ichkarida qoladi. Fon vaqtincha bloklanadi; yopilganda fokus, scroll va avvalgi atributlar tiklanadi.
6. “Ishlaydi” → “Namuna”, “Boshlash” → “Ilova haqida”. Haqiqiy ilova hali ochilmagani, bildirishnoma va haqiqiy yozuv saqlash ishlamasligi aniq aytiladi.
7. Dalili ko'rsatilmagan veterinar/sertifikat da'volari olib tashlandi; klinik kartochkalar “Namuna” deb belgilandi.
8. Footerda barcha yettita qo'llanma va savol-javob sahifasiga kirish havolalari bor.
9. Foyda-zarar va'dasi mavjud sut statistikasi va nasab namunalariga moslashtirildi. Ma'lumoti yetarli bo'lmagan juftlashga ijobiy xulosa berilmaydi.
10. Asosiy tushuntirish muammo kartochkalaridan oldinga o'tdi. 390×844 ekranda asosiy tugmaning pastki cheti 484 px atrofida; 320/390/768/1366 px ko'rinishlari screenshot bilan ko'rildi, gorizontal siljish 0.

## Yangi tekshiruv dalillari

| Tekshiruv | Buyruq / dalil | Yakuniy natija |
|---|---|---|
| Lint | `npm run lint` | O'TDI: 0 xato |
| Tiplar | `npm run typecheck`; builddagi TypeScript | O'TDI |
| Unit testlar | `npm test` | O'TDI: **67/67** (kontent 11, sayt 56) |
| Production build | `npm run build` | O'TDI: barcha ommaviy sahifalar statik; bo'lak fayllarining 12 nusxasi yaratildi |
| Yangi UX regressiyalari | `audit-ux-regressions.mjs` | O'TDI: **4/4** — JS'siz sarlavha, harakat rejimi/summa, zaxira modal, oddiy modal |
| Yangi mahsulot regressiyalari | `audit-product-regressions.mjs` | O'TDI: **7/7** — ikkala oldin berk kurs, takroriy kunlar, matnlar, yettita havola, mobil birinchi ekran |
| Xatti-harakat regressiyasi | `npm run qa:behavior` | O'TDI: **63/63**, [yangi JSON](qa/behavior-audit-fixes-2026-10-12.json) |
| Sahifa tekshiruvi | `npm run qa:site` | O'TDI: **120** ishga tushirish (12 yo'l × 5 kenglik × 2 harakat rejimi); holat, siljish, JS/konsol, kichik bosish yuzasi, axe, SEO va taqiqlangan matn muammolari **0**. [Yangi JSON](qa/site-audit-fixes-2026-10-12.json) |
| Oldingi audit regressiyalari | `npm run qa:audit -w apps/sayt` | O'TDI: oyna, chop etish, fonlar. Lokal sekin 4G/4× CPU o'lchovlari: LCP 2 596/1 880 ms, CLS 0/0,0005; bu hosting natijasi emas |

Yangi regressiyalarni qayta bajarish: sayt ishlayotganida `npm run qa:regressions` (standart port 3100; boshqa port uchun `BASE_URL`). JSON hisobotlar uchun `OUT_FILE` berilsa, mutlaq yo'l ishlating.

**Tekshiruv chegarasi:** haqiqiy Android/iPhone, Apache/nginx hosting va fermer sinovi bu bosqichda o'tkazilmadi. Demo v12 bilan eski piksel moslik foizlari yangi maketga qo'llanmaydi: bo'limlar tartibi va matnlar E-22 asosida qasddan o'zgartirildi. Ommaviy hostingga joylashtirilmagan.

# Admin orqali saytni boshqarish (2026-10-13, E-23)

**Joriy natija:** login/parol va majburiy TOTP bilan himoyalangan admin ommaviy saytga ulandi. Saytning dizayn sozlamalari, matnlari, bo'limlari, sahifalari, SEO, logo/rasmlari va oddiy formulali hisoblagichlari qoralama → nashr → ochiq sayt tartibida ishlaydi. Qo'shish, o'chirish, yashirish, tartiblash va eski versiyadan tiklash mavjud. Bu eski ADMIN_TZ dagi barcha klinik, foydalanuvchi boshqaruvi va hosting bandlari tugagan degani emas.

**Muhit:** Windows, Node 24.21.0, Next.js 16.4.0, production buildlar; admin `localhost:4320`, sayt `localhost:4310`. Sinov faqat yangi `qa-cms-*` PGlite bazasi va vaqtinchalik account bilan bajarildi. Yakuniy E2E: 2026-10-13 02:24 (Asia/Tashkent; JSON vaqti UTC).

| Tekshiruv | Natija |
|---|---|
| Workspacelar lint/typecheck, keyingi public/admin lint va build TypeScript tekshiruvlari | O'TDI |
| Unit testlar (`npm test`) | **157/157**: kontent 41, baza 14, admin 41, sayt 61 |
| Statik public build (`CMS_MODE=static`) | O'TDI: `out/` eksport saqlangan |
| Dinamik public build (`CMS_MODE=dynamic`) va admin production build | O'TDI: yangi sahifalar va `/media/[id]` so'rovda bajariladi |
| Haqiqiy brauzerda CMS E2E | **13/13**, xato va o'tkazib yuborilgan bosqich yo'q; [JSON dalil](qa/cms-e2e-2026-10-13.json) |
| Adminning 390 va 1366 px ko'rinishi | O'TDI: gorizontal siljish yo'q; ikkala screenshot ko'z bilan ko'rildi |
| O'zgarishlar formati (`git diff --check`, CRLF hisobga olingan) | O'TDI |

E2E tasdiqlagan holatlar: kirishsiz admin yopiq; noto'g'ri parol rad etiladi; parol + TOTP ishlaydi; qoralama saytga chiqmaydi; nashrdagi matn/rang avval ochilgan tabda ichki navigatsiyada ham yangilanadi; yangi bo'limning tartibi va ko'rinishi boshqariladi; yashirilgan bo'lim havolalari yo'qoladi; yangi sahifa va hisoblagich haqiqiy 7 500/5 000 natijalarini beradi; sahifa o'chirilsa menyu/footer havolalari ketadi va URL 404 qaytaradi; rasm qoralamada 404, nashrdan keyin asl PNG baytlari bilan 200; eski versiya nashr etilganda boshlang'ich ma'lumotlar va havolalar qaytadi. Brauzerdagi JavaScript xatolari: **0**.

Topilgan va tuzatilgan haqiqiy CMS xatolari: dinamik rasm yo'lining statik generator sabab 500 qaytarishi; umumiy layout/template ichidagi eski CMS ma'lumoti navigatsiyada qolishi; yashirilgan bo'lim/o'chirilgan sahifaga havolalar qolishi. Testlar tuzatilgan xatti-harakatni production serverlarda tekshirdi.

**Qayta bajarish:** dinamik sayt va admin buildlari tayyor bo'lganda `npm run qa:cms:prepare -w apps/admin`, alohida terminalda `npm run qa:cms:serve -w apps/admin`, keyin `npm run qa:cms -w apps/admin`. Har full run oldidan yangi fixture kerak, chunki TOTP birinchi kirishda sozlanadi. Production bazada QA prepare ishlatilmaydi.

**Chegara:** Vercel/Eskizga deploy, haqiqiy PostgreSQL, production HTTPS/kirish, telefon qurilmalari va klinik mutaxassis tasdig'i tekshirilmadi. Rasm yuklash 2 MB PNG/JPEG/WebP; video HTTPS havolasi bilan. Yangi dasturiy xizmat/to'lov/SMS oddiy formula muharriridan yaratilmaydi. Ishga tushirish va hosting sozlamalari: [ADMIN_CMS.md](ADMIN_CMS.md).

## Vercelga chiqarish tayyorgarligi (2026-10-13)

Egasining "BAJAR" ko'rsatmasi asosida production deploy boshlandi. GitHub `Umarxoja01/MeningFermam` ulanishi tasdiqlandi; mavjud ommaviy `https://mening-fermam.vercel.app` sayt HTTP 200 qaytardi. Bu manzil hali yangi admin/CMS nashri sifatida tekshirilmagan.

Ikkala Next configga monorepo uchun `outputFileTracingRoot` berildi, Node `24.x`ga mahkamlandi, CMS env namunalari yangilandi, `.vercel/` Gitdan chiqarildi. O'zgarishdan so'ng public dynamic va admin production buildlari hamda barcha workspace lint tekshiruvlari o'tdi. Pushga tayyor 198 ta manba fayli tekshirildi: haqiqiy maxfiy kalit, bazaning nusxasi yoki private key topilmadi; `.env.local`, `.data`, `.next` va `.vercel` Gitga kirmaydi.

**Hozirgi tashqi blok:** Vercel CLI hisobdan chiqqan; Vercel/Neon ulanishlari hali o'rnatilmagan, PostgreSQL production URL mavjud emas. Shu sababli production migratsiya va to'liq admin/CMS deploy bajarilgani da'vo qilinmaydi. Hisoblar ulangach, ikki loyiha envlari → migratsiya → admin/seed → deploy → production brauzer sinovi davom ettiriladi.
