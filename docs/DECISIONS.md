# Qarorlar

Asos: **TZ v3.1** (MeningFermam_TZ_v3.1_tuzatilgan.pdf, 2026-10-11, maqomi "TASDIQ UCHUN") va **demo v12** (meningfermam-demo-v12.html).
Ustuvorlik: egasining aniq, eng so'nggi qarori → tasdiqlangan TZ → v3.1 tuzatishlari → demo referensi.

## Egasining qarorlari (chatda, 2026-10-12)

| # | Qaror | TZ v3.1 ga ta'siri |
|---|---|---|
| E-01 | Yem hisoblagichidan zot tanlovi olib tashlanadi, nasab va juftlash saqlanadi | TZ'da tasdiqlangan yagona qaror (Y-02) |
| E-02 | Faqat TZ v3.1 asos qilinadi; v3.0 hisobga olinmaydi | — |
| E-03 | Ommaviy sayt alohida, bazasiz loyiha; eski ZIP'dagi ilova/admin/Prisma kodi olinmaydi | §10 |
| E-04 | Next.js **16.4.0** (16.3.7 o'rniga) | §10. Sabab: `npm audit` — 16.0.0–16.3.7 da 6 ta "high" advisory (SSG/ISR cache poisoning, Image Optimization SSRF va b.); 16.4.0 da tuzatilgan |
| E-05 | "Boshlash" → "Tez kunda" holati (/kirish yo'q) | §2.4 variantlaridan biri |
| E-06 | Kontaktlar: tel. +998 99 618 03 00; Telegram @MeningFermamUzb; Instagram @meningfermam; ish vaqti har kuni 8:00–21:00 | Instagram — egasining qo'shimchasi |
| E-07 | Veterinar: +998 99 444 65 44, Telegram @Sardorxoja_Vet; ism hozircha yozilmaydi ("Veterinar"); keyin bir nechta bo'lishi mumkin | "Veterinar chaqirish" shu raqamga |
| E-08 | Email va manzil hozircha ko'rsatilmaydi, keyin admin paneldan qo'shiladi | §4.9 |
| E-09 | "Molim kasal"dagi barcha ma'lumot (dori nomlari, doza, sxema, izohlar) saqlanadi | §4.4/§7 dagi "haqiqiy ko'rsatma sifatida chiqmasin" talabini o'zgartiradi. "Namuna" belgilari va shoshilinchda veterinar ustuvorligi saqlangan |
| E-10 | Hero muhri, "Vet vrachlar — dori va yemni belgilagan", ishonch lentasi, "✓ Sertifikatli", "professional veterinar vrachlar belgilagan" — demodagidek qoladi | K-02 yopilmaydi (egasi qarori). Tavsiya: production'dan oldin qayta ko'rib chiqish |
| E-11 | "Ishlaydi" holati dalilsiz ko'rsatiladi | §4.8 qoidasini o'zgartiradi (F-09 qisman) |
| E-12 | "Sut daftari" "Tez kunda"dan olib tashlanadi; sut statistikasi "Ishlaydi"dagi "Sut va statistika" ichida | §4.8 jadvalini o'zgartiradi |
| E-13 | Shrift: SF. Qonuniy yo'li: iPhone/Mac'da tizimning SF shrifti, boshqa qurilmalarda Inter (SF'ni saytga yuklab tarqatish Apple litsenziyasida yo'q) | §8.2 (Inter) dan farq |
| E-14 | Qisman bajarish — A varianti: biror dori yetmasa "Bajarildi" bosilmaydi, hech narsa ayirilmaydi | §4.4 ni aniqlashtiradi |
| E-15 | Imlo: o‘/g‘ to‘g‘ri belgi bilan (‘), tutuq ’ | §7 |
| E-16 | Footerda "Manzil" o'rniga "Veterinar" ustuni; hamma matn/kontakt keyin admin paneldan o'zgarishi kerak | Kontent `src/content` da, admin'ga mos tuzilmada |
| E-17 | Demodagi logo ishlatiladi; domen meningfermam.uz; hosting Eskiz (sayt tayyor bo'lgach) | §12 |
| E-18 | Ichki sahifalar matni: docs/MATNLAR_QORALAMA.md 2-versiya tasdiqlangan | §5 |
| E-19 | Admin panel noldan yoziladi (C bosqichi, alohida TZ) | doiradan tashqari |
| E-20 | Admin TZ (`docs/ADMIN_TZ.md`) tasdiqlandi; S-1…S-9 tavsiya bo'yicha: telefon+parol+TOTP, "mutaxassis tasdig'isiz" belgisi, bitta repozitoriyda ikki dastur, Drizzle, bigint ID, sessiya 30 daq/12 soat, jurnal 1 yil, video yuklash, Eskiz VPS | C/D bosqichlari |
| E-21 | **Faqat frontend** (2026-10-12): admin panel va baza loyihadan olib tashlanadi; sayt to'liq statik | E-19, E-20 va D-17…D-33 arxivlangan backend'ga tegishli (`Downloads/meningfermam-backend-arxiv-2026-10-12`); matn/kontakt endi `apps/sayt/src/content` fayllarida o'zgartiriladi (E-08, E-16 shunga ko'ra) |
| E-22 | Professional auditdagi 10 kamchilikni tuzatish boshlandi (2026-10-12, egasining “boshla” ko'rsatmasi) | E-10/E-11 o'rniga tasdiqlanmagan ekspert/sertifikat da'volari olib tashlanadi, “Ishlaydi” → “Namuna”; asosiy tushuntirish kartochkalardan oldin keladi. Doza va tibbiy yo'riqnoma o'zgartirilmaydi; takroriy kunlar faqat namuna bosqichi sifatida kuzatiladi. |

## Ishlab chiquvchi qarorlari (egasi qarorlari va TZ doirasida)

| # | Qaror | Sabab |
|---|---|---|
| D-01 | Kontaktlar `src/content/aloqa.ts` da (TZ §10 dagi CONTACT_* env o'rniga) | Ochiq ma'lumot; admin panelga ko'chirish oson; sir emas |
| D-02 | Yem: demo formulalari aynan, zot parametrisiz. Sigirda zot cheklovi yo'q (`real = litr`) — demo v12 ham shunday | Sun'iy konstanta qo'shilmadi; TZ qabul raqamlari o'z-o'zidan chiqadi |
| D-03 | Yaxlitlash: har yem 0,5 kg ga, kunlik 100 so'mga, oylik 1000 so'mga, **yarmi yuqoriga** (Math.round) | Qabul raqamlari aynan .5 chegarada; qoida testda qotirilgan |
| D-04 | Narx: 0–100 000 so'm/kg butun son; bo'sh maydon hisobni buzmaydi; noto'g'ri qiymat rad etiladi + izoh; maydondan chiqqanda oxirgi to'g'ri narx; reset saqlangan narxlarni o'chiradi | Egasi bilan kelishilgan (11-savol) |
| D-05 | Standart tanlov (hayvon almashtirilganda): ikkinchi tugma — buqa 400 kg "O'rtacha", qo'y 45 kg "Ko'proq"; ochilishda sigir 400 kg 10 litr | Demo xatti-harakati. Egasi tasdiqladi (2026-10-12) |
| D-06 | "Bajarildi" bosilgach tugma 1,2 s qulflanadi | Tez ikki marta bosish ikkinchi kunni ham bajarib yubormasligi uchun (Q12) |
| D-07 | Lenta: klaviatura fokusida (`:focus-visible`) va kartochka to'liq ko'rinmaganda suriladi | Sichqoncha bosganda kartochka kursor ostidan qochmasligi uchun (topilgan xato) |
| D-08 | Ombor: "Ochilgan: N ml · muddat tasdiqlanmagan" (demo: "X kun ichida ishlating") | §4.5: yaroqlilik qoldiqqa tenglashtirilmaydi |
| D-09 | Shoshilinch ogohlantirishga veterinar raqami qo'shildi | §4.4, Q10: veterinarga murojaat birlamchi |
| D-10 | Shoshilinch/yetishmaydi rangi #8F3A2C / #FBF3F1 (demo #B5513F/#F8E4DE) | Kontrast 4,5:1 dan past edi; TZ §8.1 palitrasidan |
| D-11 | Barcha bosiladigan yuzalar ≥44×44 px (demo: narx tugmalari 42, menyu 42 va b.) | §8.2, F-05 |
| D-12 | Demodagi `body` 8 px brauzer chekkasi saytda yo'q (Tailwind preflight) | Demo nuqsoni; vizual farq hisobotida |
| D-13 | Hero CTA'dan keyingi "Video joyi" yorlig'i ko'rsatilmaydi; video env bilan beriladi | §4.2 |
| D-14 | OpenGraph rasmi (public/og.png) logo va sarlavhadan yasaldi | §9.4 |
| D-15 | Kursor halqasi, tilt, magnit tugmalar demodagidek; faqat sichqonchali qurilmada va reduced-motion o'chiq bo'lsa | §11.1 demo pariteti; §8.3 |
| D-17 | Monorepo (npm workspaces): `apps/sayt`, `apps/admin`, `packages/content` (sxemalar + kontent qoidalari), `packages/db` (Drizzle sxema + migratsiyalar) | S-3; sayt va admin bir xil kontent turlarini ishlatadi |
| D-18 | Lokal ishlab chiqish va testlarda PGlite (WASM PostgreSQL); serverda oddiy PostgreSQL (postgres.js) | Kompyuterda PostgreSQL/Docker ishlamaydi; PGlite haqiqiy PostgreSQL dvigateli |
| D-19 | Qoidalarning bir qismi bazada: CHECK (telefon formati, media turi/hajmi, xesh, klinik tur) va trigger'lar (versiya o'zgarmas, tekshiruvchi ≠ muallif, klinik tasdiq faqat klinik kontentga, jurnal faqat qo'shiladi, oxirgi administrator) | Ilova kodida xato bo'lsa ham baza buzilmasin |
| D-20 | `drizzle-kit` dev vositasidagi eski esbuild (moderate) qabul qilindi | Faqat migratsiya yaratishda; saytga/admin'ga kirmaydi; drizzle-kit yangilanishi kuzatiladi |
| D-21 | Ikki bosqichli kirish **barcha** rollar uchun majburiy (TZ: administrator uchun) | Bitta qoida — oddiyroq va xavfsizroq; muharrir ham kontentni o'zgartiradi |
| D-22 | Parol: argon2id (m=19 MiB, t=2, p=1; @node-rs/argon2); TOTP: otpauth (±1 qadam, kod qayta ishlatilmaydi); TOTP siri AES-256-GCM bilan shifrlangan; zaxira kodlar HMAC-SHA256; sessiya tokeni 256 bit, bazada SHA-256 | ADMIN_TZ §4.1–4.2; kriptografiya o'zimiz yozilmagan |
| D-23 | Cookie `__Host-mf_admin`: HttpOnly, Secure, SameSite=Strict, Path=/; kod bosqichi 10 daqiqa; to'liq sessiya 12 soat, harakatsizlik 30 daqiqa; kirgandan keyin token almashtiriladi | S-6; session fixation'ga qarshi |
| D-24 | Blok: 5 xato → 15 daqiqa, keyingisi 2 baravar (24 soatgacha); mavjud bo'lmagan login ham "cheklangan" javob oladi; IP bo'yicha cheklov faqat `TRUST_PROXY=1` (Caddy/nginx orqasida) | Login mavjudligini bilib bo'lmasin; soxta X-Forwarded-For'ga ishonilmasin |
| D-25 | CSP har so'rovda nonce bilan (`src/proxy.ts`), `unsafe-inline` yo'q; admin'da inline style ishlatilmaydi | ADMIN_TZ §4.4 |
| D-26 | Sizib chiqqan parol tekshiruvi (HIBP, k-anonimlik) `PWNED_CHECK=1` bilan; internet bo'lmasa tekshiruv o'tkazib yuboriladi | Tashqi xizmat ishlamasa admin bloklanmasin |
| D-27 | Lokal ishlab chiqish va E2E: fayldagi PGlite (`DATABASE_URL=pglite:./.data/…`); serverda PostgreSQL (`postgres://`) | D-18 davomi |
| D-28 | C3 da tahrirlanadi: aloqa, funksiyalar holati, savol-javob (har biri bitta kontent birligi, kalit "asosiy"); qolganlari C4 | ADMIN_TZ §11 |
| D-29 | Har saqlash — yangi o'zgarmas versiya; o'zgarmagan ma'lumot versiya yaratmaydi; tahrir boshlangan versiya raqami tekshiriladi ("conflict" — hech kimning o'zgarishi yo'qolmaydi, tahrirlar oynada qoladi) | ADMIN_TZ §3 |
| D-30 | Nashr faqat administrator; muharrir "ko'rib chiqishga yuborish"; tiklash eski versiyadan yangi qoralama yaratadi (avtomatik nashr qilinmaydi) | ADMIN_TZ §2, §3 |
| D-31 | Kontent qoidasi buzilsa (soxta kontakt, "bepul/pullik", prognoz…) nashrda ogohlantirish; aniq tasdiq bilan nashr mumkin va jurnalga `content_publish_with_warnings` yoziladi | ADMIN_TZ §4.4 ("ogohlantirish") |
| D-32 | Saytdagi joriy qiymatlar bazaga `npm run content:seed` bilan bir marta yuklanadi; sayt hali fayldan o'qiydi (bazaga ulanish — C6) | ADMIN_TZ §7.5 |
| D-33 | Admin'da o'z xato sahifalari (`error.tsx`, `global-error.tsx`): Next'ning standart xato sahifasi inline uslub ishlatadi va qat'iy CSP uni bloklaydi | Topilgan muammo (E2E) |
| D-34 | Statik eksport (`output: "export"`): `out/` — HTML/CSS/JS; Node.js server shart emas (Eskiz'ning oddiy hostingi ham yetadi) | E-21 |
| D-35 | Xavfsizlik sarlavhalari, toza URL (`/yem-rejasi` → `yem-rejasi.html`), `/` bilan tugagan manzildan yo'naltirish, HTTPS, 404 — `public/.htaccess` (Apache) va `docs/VSCODE_TZ.md` dagi nginx sozlamasi | Statik eksportda `next.config` `headers()` ishlamaydi |
| D-36 | Build'dan keyin `scripts/flatten-segments.mjs`: Next 16.4 route group bo'laklarini papkaga yozadi, brauzer esa nuqtali nom bilan so'raydi — to'g'ri nomli nusxalar yaratiladi | Topilgan muammo: har sahifada 4 ta 404 va oldindan yuklash ishlamasdi |
| D-37 | Lokal sinov uchun `scripts/serve-static.mjs` (qaramliksiz): `.htaccess` bilan bir xil yo'llar, 404 holati, papkadan tashqariga chiqish taqiqlangan | QA skriptlari hostingdagidek muhitda ishlaydi |
| D-38 | "Boshlash" oynasi: `showModal` bo'lmasa zaxira qatlam (Escape, fon, "Yopish", fokus boshqaruvi); oyna portal orqali `<body>` ga chiziladi | Audit ERR-001 (iOS Safari < 15.4) |
| D-39 | `color-mix()` o'rniga aynan teng `rgba()` | Audit ERR-002 (Safari < 16.2, Chrome < 111) |
| D-40 | Hosting: brotli/gzip siqish; kesh — faqat `/_next/static/` uzoq muddat, rasm/ikonka 1 kun, HTML har safar tekshiriladi; minimal CSP (`base-uri`, `object-src`, `form-action`, `frame-ancestors`) | Audit ERR-003, ERR-004 |
| D-41 | Chop etish uslubi; Hero videosi `autoplay` siz (faqat reduced-motion o'chiq bo'lsa o'ynatiladi); lokal statik server buzilgan URL va qo'shni papkaga qarshi himoyalangan | Audit ERR-005, ERR-007, ERR-006 |
| D-16 | `npm audit`: production 0; dev'da 5 "high" (eslint-config-next → braces/micromatch) | Faqat lint vositasi, saytga kirmaydi; eslint-config-next yangilanishi kuzatiladi |

## Demo v12 dan tuzilgan 60 amal

Asl "60 amal" ro'yxati hech bir manbada yo'q edi; egasining roziligi bilan demo v12 dan tuzildi.
Avtomat tekshiruv: `scripts/qa/behavior-parity.mjs` (ID'lar bir xil). Belgilar: **M** — demodagidek, **O'** — v3.1 bo'yicha o'zgargan, **Y** — yangi, **X** — olib tashlangan.

| ID | Amal | Holat | ID | Amal | Holat |
|---|---|---|---|---|---|
| 01 | Logo → bosh sahifa | M | 31 | Alomat tanlash | M |
| 02 | Tepa menyu 7 havola | M | 32 | "Ehtimoliy holat (namuna)" | O' |
| 03 | Tepa "Boshlash" → "Tez kunda" | O' | 33 | Shoshilinch → veterinar birinchi | M |
| 04 | Pastki menyu + joriy bo'lim | M | 34 | "Veterinar chaqirish" → tel | O' |
| 05 | O'qilish chizig'i | M | 35 | Sxema va dorilar | M |
| 06 | 📞 tugma → tel: | O' | 36 | Vazn → doza | M |
| 07 | Lenta aylanadi | M | 37 | "Bajarildi" (hammasi yetarli) | O' |
| 08 | Sichqoncha ustida sekinlashadi | M | 38 | Biror dori yetmaydi → bloklanadi | O' |
| 09 | Surish | M | 39 | Ikki marta bosish → bir marta | Y |
| 10 | Surish kartochkani bosmaydi | M | 40 | Kurs tugadi | M |
| 11 | To'xtatish/Davom ettirish | Y | 41 | Yangi flakon xabari | M |
| 12 | Ekrandan chiqqanda pauza | Y | 42 | Vetapteka "Tez kunda" | O' |
| 13 | Klaviatura bilan kartochkalar | Y | 43 | Ombor kartochkalari, 1/2/3 ustun | M |
| 14 | 9 kartochka, 8-chi "Vazn" | O' | 44 | "Kam qoldi" | M |
| 15 | Hero parallaksi | M | 45 | "muddat tasdiqlanmagan" | O' |
| 16 | "Qanday qilib? ›" → #yem | M | 46 | "+1 flakon oldim" | M |
| 17 | SVG sahna, "Video joyi" yo'q | O' | 47 | Ombor reset + davolash kuni | O' |
| 18 | Hayvon tanlash | M | 48 | Bildirishnoma paydo bo'ladi | M |
| 19 | Zot tanlash | X | 49 | "Keyinroq" | Y |
| 20 | Vazn: buqa 300–600 | O' | 50 | "Berdim" → "Berildi" | M |
| 21 | Sut / boqish darajasi | M | 51 | Maketni qayta ko'rsatish | Y |
| 22 | Natija va tuz | M | 52 | Statistika va juftlash | M |
| 23 | Kunlik/oylik xarajat | M | 53 | Holat tablari | M |
| 24 | Prognoz qatori | X | 54 | Tablar ←/→, ARIA | Y |
| 25 | Narxlar bo'limi | M | 55 | Yakun "Boshlash" → "Tez kunda" | O' |
| 26 | −/+ 100 so'm | M | 56 | Footer bo'limlari | M |
| 27 | Narx yozish (validatsiya) | O' | 57 | Footer aloqasi haqiqiy | O' |
| 28 | Saqlash/tiklash, 0 ham | O' | 58 | Maxfiylik · Shartlar havola | O' |
| 29 | Taxminiy narxlarga qaytarish | M | 59 | Kursor, tilt, magnit | M |
| 30 | Kim kasal (4) | M | 60 | Reduced-motion | M |

Jami: M — 34, O' — 17, Y — 7, X — 2.

## TZ v3.1 ichidagi ziddiyatlar (qayd)

- §11.1 da "19 ssenariy", §11.2 da Q01–Q24 (24 ta). Testlar 24 band bo'yicha (19 taga qisqartirilmagan).
- §4.8 da 3 tab, lekin qoidada "Namuna" holati ham tilga olingan — 3 tab saqlandi.
- §4.3 "boshqa ma'lumotlar sessiyada" — §2.3 bo'yicha faqat sahifa xotirasida (sessionStorage ishlatilmadi).
- Buqa vazni: demoda 200–500, v3.1 da 300–600 — v3.1 qo'llandi.
