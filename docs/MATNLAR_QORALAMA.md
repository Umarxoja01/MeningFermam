# Sayt matnlari — 2-versiya (egasi tasdiqlagan, 2026-10-12)

Asos: TZ v3.1 §4–§7, §9.4 va egasining qarorlari (chatda kelishilgan).
Barcha matn va kontaktlar kelajakda admin paneldan o‘zgartiriladigan qilib `src/content` fayllarida saqlanadi.

Imlo (egasi qarori): o‘ va g‘ to‘g‘ri belgi bilan (‘), tutuq belgisi ’ (ma’lumot).

---

## 0. Umumiy matnlar (har sahifada)

| Joy | Matn |
|---|---|
| Footer shiori | Chorvadorning telefondagi yordamchisi. |
| Footer pastki qatori | © 2026 MeningFermam · Veterinar ko‘rigini almashtirmaydi · Maxfiylik · Shartlar |
| "Boshlash" bosilganda chiqadigan xabar | **Ilova tez kunda ishga tushadi.** Hozircha savollaringizni yozing: Telegram @MeningFermamUzb yoki +998 99 618 03 00. [Yopish] |
| Yakun bloki ost matni (demoda "Bir daqiqada boshlaysiz.") | Ilova tez kunda. Hozircha savollaringizni Telegramda yozing. |
| Eslatma maketida "Keyinroq" bosilganda | ⏰ Keyinroq eslatiladi (namuna) |
| "Molim kasal" — kasallik nomi ostida | Ehtimoliy holat (namuna) — veterinarning tekshiruvi kerak |
| "Veterinar chaqirish" tugmasi | `tel:+998994446544`; ostida kichik yozuv: Telegram: @Sardorxoja_Vet |
| Suzuvchi 📞 tugma | `tel:+998996180300` (ekran o‘quvchi uchun: "Qo‘ng‘iroq qilish: +998 99 618 03 00") |

**Footer ustunlari** (demoda: Logo · Aloqa · Bo‘limlar · Manzil):

- **Aloqa:** +998 99 618 03 00 · Har kuni 8:00–21:00 · Telegram: @MeningFermamUzb · Instagram: @meningfermam
- **Bo‘limlar:** Molim kasal · Dori ombori · Yem · Eslatma · Statistika
- **Veterinar:** +998 99 444 65 44 · Telegram: @Sardorxoja_Vet

Egasi qarori: "Manzil" ustuni o‘rniga "Veterinar" ustuni. Veterinarlar ro‘yxat ko‘rinishida saqlanadi (keyin bir nechta bo‘lishi mumkin), ismlar sayt qurilgandan keyin admin paneldan qo‘shiladi. Email va manzil ham keyin admin paneldan qo‘shiladi.

---

## 1. Sarlavha (title) va tavsif (description)

Title shabloni: `<sahifa nomi> | MeningFermam`. Ikkita tavsif TZ §5 dan aynan olingan (★).

| URL | Title | Description |
|---|---|---|
| / | MeningFermam — chorvadorning telefondagi yordamchisi | Yem xarajati, kasal hayvon, dori ombori va eslatma namunalari. Sigir, buqa, buzoq va qo‘y boquvchi fermerlar uchun. |
| /yem-rejasi | Yem rejasi va xarajat hisobi | ★ Kunlik yem, aralashma va xarajat haqida namuna hisob. |
| /davolash-rejasi | Davolash rejasi qanday ko‘rsatiladi | Kasal hayvon uchun sxema, dori ombori va eslatma ilovada qanday ko‘rinishining namunasi. |
| /nasab-daraxti | Nasab daraxti va juftlash | Hayvonning ota-onasi va bobo-buvisini ko‘rish, qarindosh bilan juftlashni tekshirish namunasi. |
| /statistika | Hayvon va ferma statistikasi | Har bir hayvonning suti, kasallik va davolash tarixi hamda ferma ko‘rsatkichlari namunasi. |
| /daftardan-farqi | Daftardan farqi | Qog‘oz daftar bilan MeningFermam ilovasini oddiy misollarda solishtiring. |
| /tez-orada | Tez orada | MeningFermam’ga keyin qo‘shiladigan funksiyalar: vetapteka, emlash kalendari, tug‘ish eslatmasi va boshqalar. |
| /savollar | Savol-javob | ★ Yem rejasi, davolash va xavfsizlik savollariga javoblar. |
| /aloqa | Aloqa | MeningFermam bilan bog‘lanish: telefon, Telegram va Instagram. Har kuni 8:00–21:00. |
| /maxfiylik | Maxfiylik siyosati | MeningFermam sayti qanday ma’lumotni saqlaydi va qanday ma’lumotni saqlamaydi. |
| /shartlar | Foydalanish shartlari | Sayt namunaviy ekanligi, veterinar ko‘rigini almashtirmasligi va foydalanish qoidalari. |
| 404 | Sahifa topilmadi | — (qidiruv tizimiga berilmaydi) |

---

## 2. Ichki sahifalar

Har sahifada bosh sahifadagi menyu, footer va ranglar bo‘ladi. Har birida bitta H1 va bitta yakuniy tugma.

### 2.1 /yem-rejasi

**H1:** Yem rejasi: qancha yem va necha pul

Hayvoningiz turini, vaznini va sutini (yoki qancha boqmoqchi ekaningizni) tanlang. Sayt kuniga qancha yem kerakligini va qancha pul ketishini taxminan hisoblab beradi.

> [Yem hisoblagichi — bosh sahifadagi bilan bir xil]

**Qanday hisoblanadi?**
1. Hayvonni tanlaysiz: sigir, buqa yoki qo‘y.
2. Vaznini tanlaysiz. Sigirda — kuniga necha litr sut berishini, buqada — qancha boqmoqchi ekaningizni (kam, o‘rtacha, ko‘p), qo‘yda — oddiy yoki ko‘proq.
3. Har bir yem yarim kilogrammgacha yaxlitlanadi: "5 kg", "2 yarim kg".
4. Har bir yem miqdori 1 kg narxiga ko‘paytiriladi va hammasi qo‘shiladi. Kunlik summa 100 so‘mgacha yaxlitlanadi, oylik summa 30 kun bo‘yicha hisoblanadi.

**Narxni o‘zingiz yozing**
Taxminiy narxlar (1 kg uchun): beda 2 500, silos 900, somon 1 200, arpa 4 000, kepak 2 500, kunjara 4 500 so‘m. Bozoringizdagi narxni yozing — sayt uni shu telefonda eslab qoladi. O‘z yemingiz bo‘lsa, 0 yozishingiz mumkin. "Taxminiy narxlarga qaytarish" tugmasi siz yozgan narxlarni o‘chiradi.

**Muhim**
Yem miqdorlari — namuna, zootexnik tasdig‘i kutilmoqda. Hisob sut yoki vazn qancha oshishini aytmaydi. Hayvoningiz kasal, bo‘g‘oz yoki yosh bo‘lsa, veterinar yoki zootexnik bilan maslahatlashing.

**Yakuniy tugma:** Hayvoningiz kasalmi? Davolash rejasini ko‘ring → /davolash-rejasi

### 2.2 /davolash-rejasi

**H1:** Davolash rejasi ilovada qanday ko‘rinadi

Hayvoningiz kasal bo‘lsa, ilova hammasini bir joyda ko‘rsatadi: alomat, sxema, dori, ombor va eslatma. Quyidagi namunani bosib ko‘ring.

> ⚠ **Hayvon og‘ir ahvolda bo‘lsa** — qorni shishib ketsa, yiqilib qolsa yoki suruvda to‘satdan o‘lim bo‘lsa — darhol veterinarga qo‘ng‘iroq qiling: **+998 99 444 65 44**.

> [Molim kasal + Dori ombori namunasi — bosh sahifadagi bilan bir xil]

**Qanday ishlaydi?**
1. **Kim kasal?** Sigir, buzoq, buqa yoki qo‘yni tanlaysiz.
2. **Nima bo‘ldi?** Ko‘rgan alomatingizni bosasiz. Sayt ehtimoliy holatni ko‘rsatadi, aniq tashxisni esa veterinar qo‘yadi.
3. **Sxema va dorilar.** Necha kun davolash, qaysi dori va hayvon vazniga qarab qancha berilishi ko‘rsatiladi.
4. **Ombor.** Dori omboringizda yetadimi — sayt o‘zi tekshiradi. Yetmasa, "Avval dorini oling" deydi va hech narsani ayirmaydi.
5. **"Bajarildi".** Ukol qilganingizni belgilaysiz: dori ombordan ayiriladi va keyingi kunga o‘tiladi. Hamma kunlar bajarilganda "Davolash tugadi" chiqadi.

**Eslatma**
Ilovada dori vaqti kelganda telefoningizga eslatma chiqadi. Saytdagi namuna haqiqiy xabar yubormaydi.

**Muhim**
Sxema va dozalar — namuna. Davolashdan oldin veterinar bilan maslahatlashing. Saytda bosgan amallaringiz sahifa yangilanganda boshidan boshlanadi.

**Yakuniy tugma:** Veterinarga qo‘ng‘iroq qilish → tel:+998994446544

### 2.3 /nasab-daraxti

**H1:** Nasab daraxti: kim kimning qarindoshi

Ilova har bir hayvonning ota-onasi va bobo-buvisini quloq raqami bilan eslab qoladi. Juftlashdan oldin hayvonlar qarindosh emasligini bir qarashda ko‘rasiz.

> [Nasab daraxti namunasi]
> Bobo-buvilar: № 0102 bobosi · № 0115 buvisi · № 0098 bobosi · № 0120 buvisi
> Ota-ona: № 0230 otasi · № 0241 onasi
> Hayvon: **№ 0412**

**Juftlashni tekshirish (namuna)**
- ✗ № 0230 bilan mumkin emas: otasi
- ✓ № 0507 bilan mumkin

**Qanday ishlaydi?**
1. Buzoq tug‘ilganda onasi va otasining quloq raqamini yozasiz.
2. Ilova daraxtni o‘zi chizadi.
3. Juftlash uchun hayvon tanlasangiz, u yaqin qarindosh bo‘lsa, ilova ogohlantiradi.

**Muhim**
Bu namuna. Nasl tanlash bo‘yicha yakuniy qarorni zootexnik yoki veterinar bilan qabul qiling.

**Yakuniy tugma:** Statistikani ko‘rish → /statistika

### 2.4 /statistika

**H1:** Statistika: qaysi hayvon foyda, qaysi biri zarar

Ilova har bir hayvonning sutini, kasalligi va davolanish tarixini yig‘ib boradi. Ferma bo‘yicha umumiy holatni ham ko‘rasiz.

**Ferma bo‘yicha (namuna)**
- Sog‘in sigirlar: 4 bosh
- Jami sut: kuniga 36 litr
- O‘rtacha: bir sigirdan 9 litr
- Diqqat talab qiladi: 1 bosh (№ 0377)

**Sut, kuniga (namuna)**
№ 0412 — 12 L · № 0388 — 10 L · № 0415 — 9 L · № 0377 — 5 L
! № 0377: sut kamaydi

**Hayvon kartochkasi (namuna): № 0377**
- Turi: sigir · Yoshi: 5 yosh
- Kunlik sut: 5 litr (oldin 9 litr edi)
- Kasallik tarixi: avgust — yelini shishgan, veterinar ko‘rgan
- Davolash tarixi: 3 kunlik kurs, tugallangan

**Muhim**
Raqamlar — namuna. Ilovada ular siz kiritgan yozuvlardan hisoblanadi.

**Yakuniy tugma:** Daftardan farqini ko‘ring → /daftardan-farqi

### 2.5 /daftardan-farqi

**H1:** Daftar bilan MeningFermam farqi

Ko‘p fermerlar hamma narsani daftarga yozadi. Daftar yaxshi, lekin u o‘zi eslatmaydi va o‘zi hisoblamaydi.

| Ish | Daftarda | MeningFermam’da | Holati |
|---|---|---|---|
| Dori vaqti | O‘zingiz eslab qolasiz | Vaqti kelganda telefonga eslatma chiqadi | Ishlaydi |
| Nasab | Varaqlab qidirasiz | Daraxt o‘zi chiziladi, qarindoshni ogohlantiradi | Ishlaydi |
| Qaysi hayvon foyda | Har birini qo‘lda hisoblaysiz | Sut, kasallik va davolash tarixi bir joyda | Ishlaydi |
| Veterinarga savol | Qo‘ng‘iroq qilib, hammasini qaytadan tushuntirasiz | Savol hayvon ma’lumoti bilan birga boradi | Ishlaydi |
| Yem xarajati | Kalkulyatorda hisoblaysiz | Tanlaysiz — kunlik va oylik summa chiqadi | Jarayonda |
| Dori va sxema | Qog‘ozdan qidirasiz | Sxema va doza bir joyda | Jarayonda |
| Dori ombori | Omborga borib sanaysiz | Ukol qilsangiz, o‘zi ayiriladi | Jarayonda |
| Vetapteka, emlash, tug‘ish eslatmasi | — | Keyin qo‘shiladi | Tez kunda |

**Yakuniy tugma:** Tez orada qo‘shiladiganlar → /tez-orada

### 2.6 /tez-orada

**H1:** Tez orada qo‘shiladigan funksiyalar

Bular hali tayyor emas. Ustida ishlayapmiz; aniq muddatini hozir aytmaymiz.

- 📍 **Eng yaqin vetapteka** — yaqindagi vetaptekalar va ularda dori borligi.
- 💉 **Emlash kalendari** — qaysi hayvonni qachon emlash kerakligi.
- 🍼 **Tug‘ish eslatmasi** — tug‘ish vaqti yaqinlashganda eslatma.
- 📱 **Ilovaga kirish** — "Boshlash" tugmasi keyin shu yerga olib boradi.

Egasi qarori: "Sut daftari" "Tez kunda"dan olib tashlandi; sut statistikasi "Ishlaydi" tabidagi "Sut va statistika" ichida.

**Yakuniy tugma:** Yangiliklarni Telegramda kuzating → https://t.me/MeningFermamUzb

### 2.7 /savollar

**H1:** Ko‘p beriladigan savollar

**Yem**
1. **Yem hisobi qanchalik aniq?** — Taxminiy. Miqdorlar namuna, zootexnik tasdig‘i kutilmoqda. Hayvoningiz holatiga qarab mutaxassis bilan maslahatlashing.
2. **Narxlarni o‘zim o‘zgartira olamanmi?** — Ha. "Yem narxlarini o‘zingiz yozing" bo‘limida har bir yemning 1 kg narxini yozing. Narx shu telefonning brauzerida saqlanadi.
3. **Qaysi hayvonlar uchun hisoblaydi?** — Sigir, buqa va qo‘y uchun.

**Davolash**
4. **Sayt aniq tashxis qo‘yadimi?** — Yo‘q. Alomat bo‘yicha ehtimoliy holat ko‘rsatiladi. Aniq tashxisni veterinar qo‘yadi.
5. **Saytdagi doza va sxema bo‘yicha davolasam bo‘ladimi?** — Ular namuna. Davolashdan oldin veterinar bilan maslahatlashing: +998 99 444 65 44.
6. **Hayvonim og‘ir ahvolda bo‘lsa nima qilay?** — Darhol veterinarga qo‘ng‘iroq qiling. Saytdagi namunaga qarab vaqt yo‘qotmang.
7. **Dori ombori nima?** — Ilovada qaysi dori qancha qolganini ko‘rsatadi va ukol qilganingizda o‘zi ayiradi. Saytdagi namuna sahifa yangilanganda boshidan boshlanadi.

**Xavfsizlik va ma’lumot**
8. **Saytga ma’lumotlarim yoziladimi?** — Yo‘q. Saytda ro‘yxatdan o‘tish yo‘q. Faqat siz yozgan yem narxlari shu telefonda saqlanadi va hech qayerga yuborilmaydi.
9. **Eslatma telefonimga keladimi?** — Saytdagi eslatma — namuna, u haqiqiy xabar yubormaydi. Ilovadagi eslatma alohida ishga tushiriladi.
10. **Ilovani qachondan ishlatsam bo‘ladi?** — Tez kunda. Yangiliklar Telegramda: @MeningFermamUzb.
11. **Qaysi hayvonlar uchun?** — Sigir, buqa, buzoq va qo‘y.

**Yakuniy tugma:** Javob topmadingizmi? Bizga yozing → /aloqa

### 2.8 /aloqa

**H1:** Biz bilan bog‘laning

Savolingiz bo‘lsa, qo‘ng‘iroq qiling yoki yozing. Har kuni 8:00 dan 21:00 gacha.

**MeningFermam**
- Telefon: +998 99 618 03 00 — [Qo‘ng‘iroq qilish]
- Telegram: @MeningFermamUzb — [Telegramda yozish]
- Instagram: @meningfermam — [Instagramda ochish]

**Veterinar**
- Telefon: +998 99 444 65 44 — [Qo‘ng‘iroq qilish]
- Telegram: @Sardorxoja_Vet — [Telegramda yozish]

> ⚠ Hayvon og‘ir ahvolda bo‘lsa, darhol veterinarga qo‘ng‘iroq qiling.

Ism hozircha yozilmaydi ("Veterinar"); ismlar va qo‘shimcha veterinarlar keyin admin paneldan qo‘shiladi.
Email va manzil hozircha ko‘rsatilmaydi (keyin admin paneldan qo‘shiladi).

### 2.9 /maxfiylik

> Egasi qabul qildi. Saytni internetga chiqarishdan oldin yurist ko‘rib chiqishi tavsiya etiladi (O‘zbekistonning "Shaxsga doir ma’lumotlar to‘g‘risida"gi qonuni).

**H1:** Maxfiylik siyosati

Yangilangan sana: [sayt nashr qilingan kun]

1. **Qisqacha.** Saytda ro‘yxatdan o‘tish, kirish yoki ma’lumot yuboradigan forma yo‘q. Biz sizdan ism, telefon raqami yoki boshqa shaxsiy ma’lumot so‘ramaymiz.
2. **Brauzeringizda nima saqlanadi.** Faqat yem hisoblagichida o‘zingiz yozgan yem narxlari. Ular shu qurilmadagi brauzer xotirasida (localStorage) saqlanadi va serverga yuborilmaydi. O‘chirish uchun "Taxminiy narxlarga qaytarish" tugmasini bosing yoki brauzer ma’lumotlarini tozalang.
3. **Nima saqlanmaydi.** Davolash, dori ombori va eslatma namunalarida bosgan amallaringiz hech qayerga yozilmaydi. Sahifa yangilanganda ular boshidan boshlanadi.
4. **Cookie va statistika.** Sayt cookie-fayl o‘rnatmaydi va tashrif statistikasini yig‘maydi. Kelajakda statistika qo‘shilsa, bu sahifa oldindan yangilanadi.
5. **Server.** Sayt joylashgan server (hosting) texnik sabablarga ko‘ra so‘rovlar jurnalini (IP manzil, vaqt, ochilgan sahifa) yuritishi mumkin. (Jurnal qancha saqlanishi hosting (Eskiz) tanlangach shu yerga yoziladi.)
6. **Biz bilan bog‘lansangiz.** Telefon, Telegram yoki Instagram orqali yozsangiz, xabaringiz o‘sha xizmatlar orqali keladi va ularning o‘z maxfiylik qoidalari amal qiladi. Xabaringizdagi ma’lumotdan faqat sizga javob berish uchun foydalanamiz.
7. **O‘zgarishlar.** Siyosat o‘zgarsa, shu sahifada yangi sana bilan e’lon qilinadi.
8. **Aloqa.** +998 99 618 03 00 · Telegram @MeningFermamUzb

### 2.10 /shartlar

> Egasi qabul qildi. 6-band (javobgarlik) bo‘yicha yurist fikri tavsiya etiladi.

**H1:** Foydalanish shartlari

1. **Sayt nima.** Bu MeningFermam ilovasi qanday ishlashini ko‘rsatadigan tanishtiruv sayti. Saytdagi hisoblar, hayvon raqamlari, dorilar va eslatmalar — namuna.
2. **Veterinar o‘rnini bosmaydi.** Saytdagi alomatlar, sxemalar va dozalar tashxis yoki davolash buyurtmasi emas. Hayvonni davolashdan oldin veterinar bilan maslahatlashing. Shoshilinch holatda darhol veterinarga murojaat qiling.
3. **Yem hisobi.** Hisob taxminiy. Yem miqdorlari namuna, zootexnik tasdig‘i kutilmoqda. Narxlar taxminiy va bozorga qarab farq qiladi. Sut, vazn yoki daromad oshishi va’da qilinmaydi.
4. **Namunalar.** Dori ombori, davolash va eslatma namunalari haqiqiy hisob yuritmaydi, xabar yubormaydi va sahifa yangilanganda boshidan boshlanadi.
5. **Funksiyalar holati.** "Jarayonda" va "Tez kunda" deb belgilangan funksiyalar hali to‘liq ishga tushmagan; ularning muddati va’da qilinmaydi.
6. **Javobgarlik.** Saytdagi namunaviy ma’lumotlarga asoslanib, mutaxassis bilan maslahatlashmasdan qilingan davolash yoki yem o‘zgarishlari uchun MeningFermam javob bermaydi.
7. **Mualliflik huquqi.** Logo, dizayn va matnlar MeningFermam’ga tegishli. Ruxsatsiz nusxa ko‘chirmang.
8. **Tashrif qoidalari.** Saytdan qonuniy maqsadda foydalaning. Saytning ishlashiga xalaqit beradigan harakatlar (avtomatik ko‘p so‘rov yuborish, buzishga urinish) taqiqlanadi.
9. **O‘zgarishlar va aloqa.** Shartlar o‘zgarsa, shu sahifada yangi sana bilan e’lon qilinadi. Savollar uchun: +998 99 618 03 00.

### 2.11 404

**H1:** Sahifa topilmadi

Bu manzilda sahifa yo‘q. Manzilda xato bo‘lishi mumkin.

**Tugma:** Bosh sahifaga qaytish → /
