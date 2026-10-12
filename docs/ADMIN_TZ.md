# MeningFermam — Admin panel: texnik topshiriq

**Versiya:** 0.1 · 2026-10-12 · **Maqom: egasi tasdiqlagan (2026-10-12)**, §10 dagi barcha qarorlar tavsiya bo'yicha. C1 bajarildi (`docs/TEST_REPORT.md`).
**Doira:** C bosqichi (admin panel) va D bosqichi (PostgreSQL). Ommaviy sayt (B bosqichi) tayyor: `docs/TEST_REPORT.md`.
**Asos:** egasining qarorlari (`docs/DECISIONS.md`, E-01…E-20), A bosqichidagi admin taklifi va xavfsizlik rejasi.

**2026-10-13 yangilanish (E-23):** egasining so'nggi ko'rsatmasi §1.1/§1.3 dagi dizayn cheklovini kengaytirdi. Endi ranglar, shrift, o'lchamlar, bo'limlar tartibi/ko'rinishi, yangi sahifalar va oddiy formulali hisoblagichlar boshqariladi. Klinik doza hamda asosiy yem formulasi avvalgidek kodda qoladi. Rasm yuklashning joriy chegarasi 2 MB (PNG/JPEG/WebP), video esa HTTPS havolasi bilan. Quyidagi eski C bosqichi talablari to'liq bajarilgan deb hisoblanmaydi; yangi ishlaydigan doira va hosting cheklovlari [ADMIN_CMS.md](ADMIN_CMS.md), tekshiruv dalillari [TEST_REPORT.md](TEST_REPORT.md) da.

---

## 0. Qisqacha (egasi uchun)

- **Admin panel** — saytdagi matn, kontakt, savol-javob, funksiyalar holati va rasmlarni brauzer orqali, dasturchisiz o‘zgartirish joyi.
- **Manzil:** alohida, `admin.meningfermam.uz`. Ommaviy sayt bilan bir server (Eskiz VPS), lekin alohida dastur.
- **Kirish:** telefon raqami (yoki login) + parol + telefondagi ilovadan 6 xonali kod (ikki bosqichli tasdiqlash).
- **Ish tartibi:** o‘zgartirasiz → "Ko‘rib chiqish" (oldindan ko‘rish) → "Nashr qilish" → saytda bir necha soniyada chiqadi. Har o‘zgarish tarixda saqlanadi, istalgan vaqtda oldingi versiyaga qaytish mumkin.
- **Hozir foydalanuvchi bitta — siz.** Xodimlar va rollar keyin qo‘shiladi; tizim boshidanoq shunga tayyor quriladi.
- **Admin'ga kirmaydi:** fermer hisoblari, hayvon kartalari, to‘lov, push/SMS, Telegram bot. Ular alohida ilova loyihasi.

---

## 1. Maqsad va doira

### 1.1 Maqsad
Ommaviy saytning `src/content/*.ts` fayllaridagi hamma kontentni brauzer orqali, xavfsiz, tarixi bilan boshqarish. Sayt dizayni va kodi o'zgarmaydi; faqat ma'lumot manbasi fayldan bazaga o'tadi.

### 1.2 Kiritiladi
| # | Bo'lim | Hozir qayerda | Nima o'zgartiriladi |
|---|---|---|---|
| A-1 | Aloqa | `aloqa.ts` | Asosiy telefon, ish vaqti, Telegram, Instagram, **email, manzil**; veterinarlar ro'yxati (ism, telefon, Telegram, tartib, ko'rinadi/yo'q) |
| A-2 | Bosh sahifa matnlari | `bosh.ts`, `muammolar.ts` | Hero (muhr, ost matn, suzuvchi kartochkalar, ishonch lentasi), bo'lim sarlavhalari, 9 muammo kartochkasi, yakun matni, "Boshlash" oynasi matni |
| A-3 | Funksiyalar holati | `holat.ts` | Funksiya qo'shish/o'chirish, nomi, belgisi, holati (Ishlaydi / Jarayonda / Tez kunda), tartib |
| A-4 | Savol-javob | `savollar.ts` | Guruhlar, savol va javoblar, tartib |
| A-5 | Ichki sahifalar | `sahifalar.ts` | H1, kirish matni, bloklar (sarlavha, matn, qadamlar, eslatma), yakuniy tugma; Maxfiylik va Shartlar |
| A-6 | SEO | `seo.ts` | Har sahifa title va description |
| A-7 | Klinik namunalar | `kasallik.ts`, `ombor.ts` | Alomatlar, ehtimoliy holat, sxema, dorilar, dozalar, ombor namunasi (§5 dagi alohida qoidalar bilan) |
| A-8 | Yem namunasi | `prices.ts` | Taxminiy yem narxlari (so'm/kg) |
| A-9 | Media | `public/brand`, `og.png` | Logo, OpenGraph rasmi, hero videosi |
| A-10 | Foydalanuvchilar | — | Admin qo'shish/o'chirish, rol berish, sessiyalarni ko'rish va yopish |
| A-11 | Tarix va jurnal | — | Kim, qachon, nimani o'zgartirgani; oldingi versiyaga qaytish |

### 1.3 Kiritilmaydi
Fermer ro'yxatdan o'tishi va hisoblari, hayvon/ferma ma'lumotlari, to'lov, push/SMS, Telegram bot, analitika paneli, yem hisoblagich formulalarini o'zgartirish (formula kodda qoladi va testlanadi), sayt dizayni/joylashuvini o'zgartirish.

---

## 2. Foydalanuvchilar va rollar

| Rol | Vakolat | Hozir |
|---|---|---|
| **Administrator** | Hamma kontent; nashr; foydalanuvchi va rollar; jurnal; tiklash | Egasi (yagona foydalanuvchi) |
| **Kontent muharriri** | Klinik bo'lmagan kontentni yozish va "ko'rib chiqishga yuborish"; nashr qila olmaydi | Keyin |
| **Klinik tekshiruvchi** (veterinar/zootexnik) | Klinik kontentni ko'rib chiqish va tasdiqlash yoki qaytarish; boshqa kontentni tahrirlay olmaydi | Keyin |

Vakolat jadvali:

| Amal | Administrator | Muharrir | Klinik tekshiruvchi |
|---|---|---|---|
| Oddiy kontent qoralamasi | ✓ | ✓ | — |
| Oddiy kontentni nashr qilish | ✓ | — | — |
| Klinik kontent qoralamasi | ✓ | ✓ | izoh |
| Klinik kontentni tasdiqlash | — (o'zi bera olmaydi) | — | ✓ (muallif bo'lmasa) |
| Klinik kontentni nashr qilish | ✓ (§5.2 qoidasi bilan) | — | — |
| Foydalanuvchi va rollar | ✓ (o'ziga rol bera olmaydi) | — | — |
| Jurnalni ko'rish | ✓ | faqat o'ziniki | faqat o'ziniki |
| Oldingi versiyaga qaytish | ✓ | so'rov | — |

Qoidalar:
- Rollar faqat serverda tekshiriladi; tugmani yashirish himoya emas.
- Administrator rolini berish/olish — qayta parol + ikki bosqichli kod talab qiladi va jurnalga yoziladi.
- Oxirgi administratorni o'chirib bo'lmaydi.

---

## 3. Kontent jarayoni

```
Qoralama ──► Ko'rib chiqishda ──► Nashr qilingan
   ▲              │                    │
   └── Qaytarildi ┘                    └──► Oldingi versiya (tiklash = yangi versiya)
```

- Har saqlash — yangi **versiya** (o'zgarmas yozuv: kim, qachon, nima). Nashr qilingan versiya alohida belgilanadi.
- **Oldindan ko'rish:** qoralama saytdagi ko'rinishda ochiladi (faqat admin uchun, `noindex`).
- **Nashr** bitta tranzaksiyada: tekshiruv → nashr belgisi → jurnal → saytga yangilash signali.
- **Tiklash:** eski versiyadan yangi qoralama yaratiladi; klinik bo'lsa §5.2 qoidasi qayta qo'llanadi.
- Bir vaqtda ikki kishi tahrirlasa: versiya raqami tekshiriladi, keyingisiga "boshqa o'zgarish bor" xabari chiqadi (yo'qolgan o'zgarish bo'lmaydi).

---

## 4. Kirish va xavfsizlik

### 4.1 Autentifikatsiya
- Ochiq ro'yxatdan o'tish **yo'q**. Birinchi administrator serverda buyruq (CLI) bilan yaratiladi; qolganlar — taklif havolasi orqali (bir martalik, 24 soatlik).
- Parol: kamida 12 belgi, ma'lum sizib chiqqan parollar ro'yxatiga qarshi tekshiruv; saqlash **argon2id** (sinovdan o'tgan kutubxona orqali).
- **Ikki bosqichli tasdiqlash (TOTP)** — administrator uchun majburiy (Google Authenticator va shunga o'xshash). Tiklash uchun 10 ta bir martalik zaxira kod (bir marta ko'rsatiladi, xeshlangan holda saqlanadi).
- Kirish urinishlari cheklanadi: hisob bo'yicha (5 xato → 15 daqiqa blok, keyin oshib boradi) va IP bo'yicha. Xato xabari umumiy ("login yoki parol noto'g'ri").
- Keyingi bosqich (taklif): WebAuthn/passkey.

> Admin "noldan yoziladi" (E-19), lekin parol xeshlash, TOTP, tasodifiy tokenlar kabi kriptografik qismlar o'zimiz yozilmaydi — sinovdan o'tgan kutubxonalardan olinadi.

### 4.2 Sessiya
- Serverdagi sessiyalar jadvali; brauzerga faqat tasodifiy 256-bitli token, bazada uning xeshi.
- Cookie: `HttpOnly`, `Secure`, `SameSite=Strict`, `__Host-` prefiksi, `Path=/`.
- Muddat: harakatsizlik 30 daqiqa, umumiy 12 soat. Kirgandan keyin yangi token (session fixation'ga qarshi).
- Parol, rol yoki ikki bosqichli sozlama o'zgarsa — shu foydalanuvchining barcha sessiyalari yopiladi. "Hamma qurilmalardan chiqish" tugmasi.

### 4.3 Vakolat (har so'rovda)
- **Har bir** server action va API route ichida: sessiya → foydalanuvchi faol → rol → resurs egaligi. Standart — rad etish.
- Middleware faqat qo'shimcha qatlam (yo'naltirish uchun); asosiy tekshiruv har amalning o'zida.
- ID bo'yicha murojaatlar (IDOR) — har doim vakolat bilan tekshiriladi.

### 4.4 Kiruvchi ma'lumot va XSS
- Har forma serverda sxema bilan tekshiriladi (tur, uzunlik, format: telefon `+998XXXXXXXXX`, Telegram/Instagram nik, URL faqat `https:`).
- Kontent oddiy matn sifatida saqlanadi va ko'rsatiladi; xom HTML yo'q. Kerak bo'lsa faqat cheklangan formatlash (qalin, ro'yxat, havola) — allowlist sanitizatsiya bilan.
- Ommaviy sayt va admin'da qat'iy **CSP** (nonce bilan), `X-Content-Type-Options`, `frame-ancestors 'none'`.
- Kontent qoidalari serverda ham tekshiriladi (sayt testlaridagi kabi): soxta telefon shabloni, "bepul/pullik", sut/vazn prognozi va h.k. — nashrdan oldin ogohlantirish.

### 4.5 CSRF va origin
- `SameSite=Strict` + har o'zgartiruvchi so'rovda `Origin`/`Sec-Fetch-Site` tekshiruvi; Next.js server action'larining origin himoyasi yoqilgan.

### 4.6 Media yuklash
- Ruxsat: JPEG, PNG, WebP (rasm), MP4 (video). SVG yuklash **taqiqlanadi**.
- Hajm: rasm ≤ 5 MB, video ≤ 30 MB. Turi fayl kengaytmasi bo'yicha emas, ichidagi baytlar bo'yicha tekshiriladi.
- Rasmlar qayta kodlanadi (EXIF va yashirin ma'lumot o'chadi), o'lchami cheklanadi; fayl nomi tasodifiy.
- Fayllar kod papkasidan tashqarida saqlanadi va `nosniff` bilan beriladi.

### 4.7 Sirlar va kesh
- Sirlar (baza paroli, sessiya kaliti) faqat serverdagi env faylida, ruxsatlari cheklangan; `NEXT_PUBLIC_` bilan hech qachon.
- Admin javoblari: `Cache-Control: private, no-store`; `X-Robots-Tag: noindex`; admin subdomeni robots.txt da yopiq (bu himoya emas, faqat qo'shimcha).
- Ommaviy sayt admin'ga faqat o'qish huquqli alohida kanal orqali murojaat qiladi va **faqat nashr qilingan** kontentni oladi.

### 4.8 Jurnal (audit)
- Yoziladi: kirish/chiqish, muvaffaqiyatsiz kirish, har saqlash/nashr/tiklash, rol va foydalanuvchi o'zgarishi, media yuklash/o'chirish.
- Maydonlar: vaqt, foydalanuvchi, amal, obyekt, versiya, IP (qisqartirilgan), natija.
- **Yozilmaydi:** parol, token, TOTP kodi, sessiya kaliti.
- Jurnalni o'zgartirib yoki o'chirib bo'lmaydi (faqat qo'shish); saqlash muddati — 1 yil (taklif).

### 4.9 Server va zaxira
- Eskiz VPS (O'zbekiston): Node.js ≥ 20.9, PostgreSQL 16/17, HTTPS (Caddy yoki nginx, avtomatik sertifikat), firewall (faqat 80/443 va SSH kalit bilan).
- Baza tashqariga ochilmaydi (faqat localhost).
- Zaxira: har kuni shifrlangan nusxa, boshqa joyda saqlanadi (7 kunlik + 4 haftalik + 3 oylik). **Har oy tiklash sinovi** va natijasi hisobotga.
- Yangilanishlar: `npm audit` har relizdan oldin; Next.js va kutubxonalar xavfsizlik tuzatishlari 7 kun ichida.

---

## 5. Klinik kontent (A-7)

### 5.1 Hozirgi holat
E-22 audit tuzatishlarida dalilsiz "vrachlar belgilagan" / "Sertifikatli" yozuvlari olib tashlangan. E-09 bo'yicha dori nomlari, dozalar va namunaviy sxemalar saqlangan; klinik mutaxassis tasdig'i bu ishda olinmagan. Yangi sayt muharriri ularning doza va hisoblash kodini tahrirlamaydi.

### 5.2 Admin'dagi qoida (taklif)
- Klinik kontent har versiyasida: **manba** (yo'riqnoma, adabiyot), **mutaxassis** (ism, mutaxassislik), **tasdiq sanasi**, aynan tasdiqlangan versiya.
- Klinik tekshiruvchi bo'lmaguncha: administrator nashr qila oladi, lekin versiya **"mutaxassis tasdig'isiz"** deb belgilanadi va bu jurnalga yoziladi.
- Mutaxassis tasdiqlagan matn o'zgarsa — avtomatik "qayta ko'rib chiqish" holatiga qaytadi.
- Muharrir klinik tasdiqni o'ziga bera olmaydi; muallif o'z matnini tasdiqlay olmaydi.
- "Vrachlar belgilagan", "Sertifikatli" kabi yozuvlar faqat tegishli tasdiq maydonlari to'ldirilgan bo'lsa yoqiladigan qilib qurilishi (taklif) — egasi qarori bilan hozircha qo'lda yoqilgan.

---

## 6. Ma'lumotlar bazasi (D bosqichi)

PostgreSQL. Barcha jadvallarda `id` (bigint identity yoki UUIDv7 — tanlov §10), `created_at`, foreign key'lar va cheklovlar.

| Jadval | Asosiy maydonlar | Cheklov |
|---|---|---|
| `admin_user` | telefon/login, ism, parol xeshi, faol, TOTP siri (shifrlangan), oxirgi kirish | login unique |
| `user_role` | user, role | role ∈ {admin, editor, clinical} |
| `recovery_code` | user, kod xeshi, ishlatilgan | — |
| `session` | user, token xeshi, yaratilgan, oxirgi faollik, muddat, IP/qurilma | token xeshi unique |
| `login_attempt` | login, IP, vaqt, natija | rate limit uchun |
| `content_item` | tur (contacts, faq, page, feature, …), kalit (masalan `/yem-rejasi`), klinikmi | (tur, kalit) unique |
| `content_version` | item, raqam, ma'lumot (JSONB, sxema bo'yicha), xesh, muallif, holat | (item, raqam) unique; o'zgarmas |
| `publication` | item, nashr qilingan versiya, kim, qachon | bitta item — bitta joriy nashr |
| `review` | versiya, tekshiruvchi, qaror, izoh | tekshiruvchi ≠ muallif |
| `clinical_attestation` | versiya, mutaxassis, manba, sana | faqat klinik item uchun |
| `media_asset` | fayl yo'li, tur, hajm, checksum, o'lcham, kim yukladi, holat | checksum unique |
| `audit_event` | vaqt, user, amal, obyekt, versiya, IP, natija | faqat INSERT |

- **Kontent sxemasi** ommaviy saytdagi `src/content` turlari bilan bir xil (umumiy paket) — sayt va admin bir xil tuzilmani tushunadi.
- **Migratsiyalar:** faqat oldinga, kodda saqlanadi, avval nusxa bazada sinaladi.
- **ORM/so'rov vositasi:** tanlov §10 da.
- Fermer ma'lumotlari bu bazaga qo'shilmaydi (alohida ilova loyihasi).

---

## 7. Ommaviy sayt bilan bog'lanish

1. Sayt build vaqtida va nashrdan keyin nashr qilingan kontentni o'qiydi (faqat o'qish huquqi).
2. "Nashr qilish" → imzolangan so'rov saytga → tegishli sahifa(lar) qayta yangilanadi (on-demand revalidation). Kutilgan vaqt: bir necha soniya.
3. Admin yoki baza ishlamasa — sayt oxirgi muvaffaqiyatli versiyani ko'rsataveradi (statik nusxa). Bo'sh yoki buzilgan kontent hech qachon chiqmaydi: nashrdan oldin sxema tekshiruvi.
4. Qoralama va admin ma'lumotlari ommaviy saytga hech qachon chiqmaydi.
5. O'tish rejasi: hozirgi `src/content` qiymatlari bazaga bir martalik import qilinadi → sayt bazadan o'qiydigan bo'ladi → fayllar faqat zaxira (fallback) sifatida qoladi.

---

## 8. Admin interfeysi

- O'zbek lotin, telefonda ham qulay (asosiy ishlatish — telefon bo'lishi mumkin), bosish yuzasi ≥ 44 px, sayt bilan bir xil ranglar.
- Bosh ekran: "Oxirgi o'zgarishlar", "Ko'rib chiqishni kutayotganlar", bo'limlar ro'yxati.
- Har formada: oldindan ko'rish, "Qoralama saqlash", "Nashr qilish", versiyalar tarixi va farqini ko'rish.
- Kontakt formasida format tekshiruvi va namuna ("+998 99 123 45 67"); bo'sh qoldirilgan maydon saytda ko'rinmaydi.
- Xavfli amallar (nashr, tiklash, o'chirish, rol) — tasdiqlash oynasi.

---

## 9. Qabul mezonlari (tekshiruvlar)

| # | Mezon |
|---|---|
| AQ01 | Kirmagan foydalanuvchi har bir admin sahifa, server action va API'ga kira olmaydi (avtomatik test: barcha yo'llar ro'yxati bo'yicha) |
| AQ02 | Ikki bosqichli kodsiz administrator kira olmaydi; zaxira kod bir marta ishlaydi |
| AQ03 | 5 noto'g'ri urinishdan keyin blok; IP bo'yicha cheklov ishlaydi |
| AQ04 | Muharrir nashr qila olmaydi, klinik tasdiq bera olmaydi, rol o'zgartira olmaydi (to'g'ridan-to'g'ri so'rov bilan ham) |
| AQ05 | Boshqa foydalanuvchi obyektiga ID orqali kirish rad etiladi (IDOR) |
| AQ06 | Boshqa saytdan yuborilgan so'rov rad etiladi (CSRF/origin) |
| AQ07 | Kontentdagi `<script>` va HTML saytda matn bo'lib chiqadi (XSS testi) |
| AQ08 | SVG, noto'g'ri turdagi va katta fayl yuklanmaydi; rasm EXIF'siz saqlanadi |
| AQ09 | Nashr: saytda ≤ 30 soniyada chiqadi; qoralama chiqmaydi |
| AQ10 | Tiklash: eski versiya qayta nashr qilinadi, tarix saqlanadi |
| AQ11 | Admin/baza o'chganda sayt ishlashda davom etadi (oxirgi versiya) |
| AQ12 | Jurnalda har amal bor; parol/token yo'q |
| AQ13 | Parol yoki rol o'zgarganda barcha sessiyalar yopiladi |
| AQ14 | Zaxiradan tiklash sinovi hujjatlashtirilgan |
| AQ15 | Ommaviy saytning hamma eski testlari (50 unit, 63 xatti-harakat, site-check) o'tadi |
| AQ16 | `npm audit` production 0 kritik/yuqori; lint, TypeScript, build 0 xato |

Natijalar `docs/TEST_REPORT.md` uslubida: vaqt, muhit, buyruq, haqiqiy natija, bajarilmaganlar.

---

## 10. Qarorlar (egasi tasdiqladi: hammasi tavsiya bo'yicha, 2026-10-12)

| # | Savol | Qaror |
|---|---|---|
| S-1 | Kirish logini: telefon raqami yoki email? | Telefon raqami + parol + ikki bosqichli kod |
| S-2 | Klinik kontent mutaxassissiz nashr bo'lganda "mutaxassis tasdig'isiz" belgisi admin'da qayd etilsinmi (saytda ko'rinmaydi)? | Ha |
| S-3 | Kod tuzilishi: sayt va admin bitta repozitoriyda ikki alohida dastur sifatidami? | Ha — umumiy kontent turlari bir joyda, xato kam |
| S-4 | Baza bilan ishlash vositasi | Drizzle (SQL'ga yaqin, yengil, migratsiyalari aniq). Muqobil: Prisma, Kysely |
| S-5 | ID turi | bigint identity (oddiy, tez) |
| S-6 | Sessiya muddati: 30 daqiqa harakatsizlik / 12 soat | Ha |
| S-7 | Jurnal saqlash muddati | 1 yil |
| S-8 | Hero videosi admin orqali yuklanadimi yoki faqat havola? | Yuklash (≤ 30 MB, MP4) |
| S-9 | Eskiz tarifi: VPS (Node.js + PostgreSQL) | Kamida 2 vCPU, 2–4 GB RAM, 40 GB disk (taklif; tarif tanlanganda aniqlanadi) |

---

## 11. Bosqichlar

| Bosqich | Ish | Natija |
|---|---|---|
| C0 | Ushbu TZ va §10 qarorlarini tasdiqlash | Yozma tasdiq |
| C1 | Repozitoriy tuzilmasi (sayt + admin), umumiy kontent turlari, baza sxemasi, migratsiyalar | Bo'sh admin, testlar |
| C2 | Kirish: parol, ikki bosqichli kod, sessiya, cheklovlar, CLI bilan birinchi admin | AQ01–AQ03, AQ13 |
| C3 | Kontent: aloqa, funksiyalar holati, savol-javob (eng ko'p o'zgaradiganlari) + versiya, nashr, tiklash | AQ09, AQ10 |
| C4 | Qolgan kontent: bosh sahifa, ichki sahifalar, SEO, yem narxlari, klinik namunalar (§5) | — |
| C5 | Media yuklash | AQ08 |
| C6 | Saytni bazadan o'qishga o'tkazish, import, fallback | AQ11, AQ15 |
| C7 | Xavfsizlik testlari, jurnal, zaxira va tiklash sinovi, hisobotlar | AQ04–AQ07, AQ12, AQ14, AQ16 |
| E | Eskiz'ga chiqarish (alohida ruxsat) | — |

Har bosqich oxirida: lint, TypeScript, testlar, build va hisobot. Keyingi bosqich oldingisi o'tgandan keyin.
