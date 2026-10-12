# Vizual moslik hisoboti (demo v12 ↔ sayt)

**Sana:** 2026-10-12. **Buyruq:** `npm run qa:visual` (`scripts/qa/visual-parity.mjs`).
**Usul:** har blok alohida skrinshot (Chromium, reduced-motion — barqaror holat), `pixelmatch` (threshold 0,15). Rasmlar `docs/qa/parity/*-demo.png`, `*-sayt.png`, `*-farq.png` (gitga kirmaydi), raqamlar `docs/qa/parity/report.json`.
**Standart:** demo v12 ning brauzerda hisoblangan yakuniy CSS holati (TZ v3.1 §8.1); boshidagi tarixiy sariq ranglar emas.

| Blok | 390 px farq | 1366 px farq | Asosiy sabab |
|---|---|---|---|
| Menyu | 7,31 % | 0,17 % | Demoda body 8 px chekka (telefonda eni 354 → 370); menyu tugmasi 44 px |
| 1. Muammo kartochkalari | 4,97 % | 2,20 % | "To'xtatish/Davom ettirish" tugmasi (yangi); 8-kartochka "Vazn"; body chekkasi |
| 2. Hero | 6,18 % | 6,84 % | "Video joyi" yorlig'i yo'q; "Vetapteka — tez kunda" (demo: "1,2 km"); body chekkasi |
| 3. Yem | 5,44 % | 4,03 % | "Zoti" maydoni va prognoz qatori yo'q (blok pastroq); TZ ost matni va izohi |
| 4. Molim kasal | 9,63 % | 6,75 % | TZ sarlavhasi; "Ehtimoliy holat (namuna)" qatori; veterinar Telegrami; vetapteka xaritasi va soxta ro'yxat o'rniga "Tez kunda" |
| 5. Dori ombori | 3,62 % | 3,29 % | "muddat tasdiqlanmagan"; 44 px tugmalar |
| 6. Eslatma | 12,89 % | 4,42 % | TZ sarlavhasi va izohi (telefonda 2 qator ko'p — telefon maketi pastga suriladi) |
| 7. Statistika | 2,10 % | 2,73 % | Body chekkasi, shrift tekislanishi |
| 8. Funksiyalar holati | 2,22 % | 2,22 % | §4.8 ro'yxati ("Sut va statistika"; "Video darslar" yo'q) |
| 9. Yakun | 8,07 % | 2,76 % | Ost matn "Ilova tez kunda…" (demo: "Bir daqiqada boshlaysiz.") |
| 10. Footer | 4,91 % | 3,68 % | Haqiqiy kontaktlar, "Veterinar" ustuni, Instagram; Maxfiylik/Shartlar/Aloqa havolalari; 44 px qatorlar |

## Qasddan farqlar (oldingi → yangi)

| Joy | Demo v12 | Sayt | Asos |
|---|---|---|---|
| Body | 8 px brauzer chekkasi | 0 | Demo nuqsoni (D-12) |
| Yem | "Zoti" maydoni; "≈ +81 kg 3 oyda", "Vazni saqlanadi" | Yo'q | Y-02, Y-01 |
| Yem sarlavha osti | "Zoti va vazniga qarab…" | "Hayvon turi va vazniga qarab taxminiy…" | §4.3 |
| Yem izohi | "✓ Yem tartibini veterinar vrach va zootexnik belgilagan" | "…Yem miqdorlari — namuna, zootexnik tasdig‘i kutilmoqda." | §4.3 (6) |
| Buqa vazni | 200–500 kg | 300–600 kg | §4.3 |
| Narx | 0 tiklanmaydi; noto'g'ri qiymat jimgina 0 | 0 tiklanadi; noto'g'ri rad etiladi + izoh | F-10, D-04 |
| Kasal sarlavhasi | "Bosing. Sxema, dori va doza chiqadi." | "Bosing. Namuna ko‘rinishini va veterinar bilan bog‘lanishni ko‘ring." | §4.4 |
| Vetapteka | Xarita, "hozir ochiq · dori bor · 1,2 km" | "Tez kunda: yaqindagi vetaptekalar va dorilar mavjudligi" | K-03 |
| Davolash xabari | "Ertaga eslatma keladi." | Yo'q | T-02 |
| Qisman bajarish | Bor dori ayiriladi, kun o'tadi | Tugma bloklanadi | K-01, E-14 |
| Ombor yorlig'i | "X kun ichida ishlating" | "muddat tasdiqlanmagan" | §4.5 |
| Eslatma | "Dori vaqti kelsa, ilova o'zi eslatadi" / "Bitta ham kun qolib ketmaydi." | "Dori eslatmasi qanday ishlaydi?" / "Bu namuna…" | §4.6, T-04 |
| "Keyinroq" | Natijasiz | "⏰ Keyinroq eslatiladi (namuna)" | F-06 |
| Boshlash | #oxiri / #boshi | "Tez kunda" oynasi | F-01, E-05 |
| Footer | +998 __, Toshkent sh. ______, info@…, @meningfermam_bot, 9:00–20:00 | Haqiqiy kontaktlar, 8:00–21:00 | F-07, E-06–E-08 |
| Ranglar | Shoshilinch #B5513F | #8F3A2C / #FBF3F1 | D-10 (kontrast) |
| O'lchamlar | Ayrim tugmalar 42 px | ≥44 px | F-05 |

Demodagidek qoldirilgan (egasi qarori E-10): Hero muhri, "Vet vrachlar — dori va yemni belgilagan", ishonch lentasi, "✓ Sertifikatli", "✓ Sxema va dorilarni professional veterinar vrachlar belgilagan. (Namuna)".
