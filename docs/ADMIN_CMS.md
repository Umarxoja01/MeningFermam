# Admin orqali saytni boshqarish

## Kirish va kundalik tahrir

Login — administratorning telefon raqami. Parol `admin:create` buyrug'ida yashirin kiritiladi. Birinchi kirishda Authenticator sozlanadi; keyingi safar login/paroldan so'ng 6 xonali kod kiritiladi. Ochiq ro'yxatdan o'tish yo'q.

**Sayt boshqaruvi** ichida:

- **Dizayn:** rang, shrift, o'lcham, kenglik, masofa, burchaklar, logo va hero rasm/video havolasi.
- **Bosh sahifa:** sarlavha va matnlar, kartochkalar, menyu, tugma yozuvlari, eslatma/statistika namunalari.
- **Bo'limlar:** qo'shish, o'chirish, yashirish, tartiblash; matn, rasm, tugma yoki o'z hisoblagichingizni joylashtirish.
- **Sahifalar:** yangi sahifa, matn, ro'yxat, rasm, tugma, mavjud interaktiv blok va hisoblagich. Yangi sahifaning havolasi pastki menyuga qo'shiladi.
- **Hisoblagichlar:** nom, sonli maydonlar, boshlang'ich son/chegaralar, formula va natija. Masalan `bosh * narx`. Faqat sonlar, maydon nomlari va `+ - * / ( )` ishlaydi.
- **Boshqa yozuvlar / SEO:** bo'lim yorliqlari va qidiruvdagi title/description.

Aloqa, funksiya kartalari va savol-javobning alohida muharrirlari mavjud. Klinik doza va asosiy yem formulalari oddiy matn muharririda o'zgartirilmaydi.

Yangi ishlaydigan funksiya sifatida formulali hisoblagich yoki mavjud interaktiv blok qo'shiladi. To'lov, SMS, tashqi API kabi yangi xizmatlarning dasturiy qismini alohida kodlash kerak.

**Qoralama saqlash** saytga chiqarmaydi. **Nashr qilish**dan keyin ochiq saytni yangilang. Har saqlash versiya yaratadi; eski versiyadan tiklash yangi qoralama beradi, tarix o'chmaydi. Bir vaqtda tahrirda versiyalar ustiga yozilmaydi.

## Rasmlar

**Media** bo'limida PNG/JPEG/WebP yuklang (2 MB gacha), havolani rasm/logo maydoniga qo'ying va nashr qiling. Baytlar bazada saqlanadi. Nashrga ulanmagan rasm faqat adminda ko'rinadi. Video uchun HTTPS havolasi kiritiladi; video fayl yuklash bu bosqichda qo'shilmagan.

## Lokal ishga tushirish

`apps/admin/.env.local`: `DATABASE_URL`, doimiy 32 baytli base64 `ADMIN_ENC_KEY`.

```bash
npm run cms:migrate
npm run cms:build
npm run cms:start
```

Admin 3200, sayt 3100 portda. `cms:dev` — ishlab chiqish rejimi. Lokal PGlite'ni faqat admin ochadi; sayt `CMS_API_URL` orqali faqat nashr qilingan kontentni oladi. Maxfiy foydalanuvchi/sessiya yozuvlari API'da berilmaydi.

## Vercel

Vercel uchun doimiy PostgreSQL kerak. `pglite:` lokal fayli hosting bazasi bo'lmaydi: funksiyalar fayl tizimi faqat o'qiladi, `/tmp` esa vaqtinchalik joy. [Vercel hujjati](https://vercel.com/docs/functions/runtimes).

1. Ikki Next.js loyiha: Root Directory — `apps/admin` va `apps/sayt`; **Include source files outside of the Root Directory** yoqilgan bo'lsin. Build `npm run build`, Node `24.x`. Dinamik sayt uchun `out/` output override qo'ymang; framework Next.js, output standart `.next`. Ikkala Next configda `outputFileTracingRoot` monorepo rootga berilgan. [Vercel monorepo hujjati](https://vercel.com/docs/monorepos).
2. Admin env: `DATABASE_URL` (PostgreSQL), `ADMIN_ENC_KEY`, `PUBLIC_SITE_URL` (sayt domeni), `TRUST_PROXY=1`, `PWNED_CHECK=1`. Sirlar `NEXT_PUBLIC_` bilan boshlanmaydi.
3. Sayt env: `CMS_MODE=dynamic`, `CMS_API_URL=https://ADMIN-DOMEN/api/site-content`, `NEXT_PUBLIC_SITE_URL` (sayt domeni). Bevosita SQL varianti: API manzili o'rniga shu PostgreSQL `DATABASE_URL` beriladi.
4. Production bazaga migratsiya, administrator yaratish va `content:seed` qo'llanadi. Production bazada test `qa:prepare` ishlatilmaydi.
5. API domeni sayt uchun ochiladigan Production domeni bo'lsin; Preview Deployment Protection uning so'rovlarini bloklashi mumkin. Kirish cookie'si HTTPS talab qiladi.
6. Hostingda login, nashr, rasm va yangi sahifani qayta tekshiring. Lokal natija hosting natijasi emas.

Tekshiruvda saytning 200 javobi yetmaydi: kontent API ham 200 qaytarishi va nashr qilingan qiymat saytda ko'rinishi kerak. API ochilmasa sayt lokal qiymatlarni ko'rsatishi mumkin.

Dinamik rejimda har matn o'zgarishidan keyin qayta deploy kerak emas. [Next.js dinamik so'rov hujjati](https://nextjs.org/docs/app/api-reference/functions/connection).
