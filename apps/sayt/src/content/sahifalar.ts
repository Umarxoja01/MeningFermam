// Ichki sahifalar matni (TZ v3.1 §5; audit tuzatishlari tasdiqlangan, 2026-10-12).
// Tuzilma: sarlavha, kirish, bloklar, yakuniy tugma (packages/content sxemasi bilan tekshiriladi).

// Blok turlari umumiy paketda; "widget" — nomi bo'yicha chiziladigan interaktiv qism.
import type { Block, InnerPage, WidgetName } from "@meningfermam/content";

export type { Block, InnerPage, WidgetName };

export const pages = {
  "/yem-rejasi": {
    h1: "Yem rejasi: qancha yem va necha pul",
    intro: "Hayvoningiz turini, vaznini va sutini (yoki qancha boqmoqchi ekaningizni) tanlang. Sayt kuniga qancha yem kerakligini va qancha pul ketishini taxminan hisoblab beradi.",
    blocks: [
      { type: "widget", name: "feed" },
      { type: "h2", text: "Qanday hisoblanadi?" },
      { type: "steps", items: [
        { text: "Hayvonni tanlaysiz: sigir, buqa yoki qo‘y." },
        { text: "Vaznini tanlaysiz. Sigirda — kuniga necha litr sut berishini, buqada — qancha boqmoqchi ekaningizni (kam, o‘rtacha, ko‘p), qo‘yda — oddiy yoki ko‘proq." },
        { text: "Har bir yem yarim kilogrammgacha yaxlitlanadi: “5 kg”, “2 yarim kg”." },
        { text: "Har bir yem miqdori 1 kg narxiga ko‘paytiriladi va hammasi qo‘shiladi. Kunlik summa 100 so‘mgacha yaxlitlanadi, oylik summa 30 kun bo‘yicha hisoblanadi." },
      ] },
      { type: "h2", text: "Narxni o‘zingiz yozing" },
      { type: "p", text: "Taxminiy narxlar (1 kg uchun): beda 2 500, silos 900, somon 1 200, arpa 4 000, kepak 2 500, kunjara 4 500 so‘m. Bozoringizdagi narxni yozing — sayt uni shu telefonda eslab qoladi. O‘z yemingiz bo‘lsa, 0 yozishingiz mumkin. “Taxminiy narxlarga qaytarish” tugmasi siz yozgan narxlarni o‘chiradi." },
      { type: "note", tone: "info", title: "Muhim", text: "Yem miqdorlari — namuna, zootexnik tasdig‘i kutilmoqda. Hisob sut yoki vazn qancha oshishini aytmaydi. Hayvoningiz kasal, bo‘g‘oz yoki yosh bo‘lsa, veterinar yoki zootexnik bilan maslahatlashing." },
    ],
    cta: { label: "Davolash namunasini ko‘rish", href: "/davolash-rejasi" },
  },
  "/davolash-rejasi": {
    h1: "Davolash rejasi: interaktiv namuna",
    intro: "Quyidagi namuna alomat, sxema va dori ombori qanday bog‘lanishini ko‘rsatadi. Hayvon raqamlari, dorilar va dozalar — namuna. Ilova hali ishga tushmagan; haqiqiy davolash uchun veterinarga murojaat qiling.",
    blocks: [
      { type: "widget", name: "urgentVet" },
      { type: "widget", name: "sick" },
      { type: "widget", name: "store" },
      { type: "h2", text: "Namunani qanday sinab ko‘rish mumkin?" },
      { type: "steps", items: [
        { title: "Kim kasal?", text: "Namuna uchun sigir, buzoq, buqa yoki qo‘yni tanlaysiz." },
        { title: "Nima bo‘ldi?", text: "Alomat tugmasini tanlaysiz. Ko‘rsatilgan ehtimoliy holat — namuna; aniq tashxisni veterinar qo‘yadi." },
        { title: "Sxema va dorilar.", text: "Namunadagi reja kunlari, dorilar va vaznga bog‘liq miqdor ko‘rsatiladi. Bu haqiqiy hayvonni davolash uchun yo‘riqnoma emas." },
        { title: "Ombor (namuna).", text: "Sayt namuna qoldig‘i yetishini tekshiradi. Yetmasa, dori omboridagi qo‘shish tugmasi orqali namunani to‘ldirasiz; qoldiq yetmaguncha bosqich bajarilmaydi." },
        { title: "“Namuna bosqichini bajarish”.", text: "Tugmani bossangiz, namuna dorisi qoldiqdan ayiriladi va keyingi reja kuniga o‘tiladi. Oxirida “Namuna bosqichlari bajarildi” chiqadi. Bu hayvoningiz davolanganini tasdiqlamaydi." },
      ] },
      { type: "h2", text: "Eslatma" },
      { type: "p", text: "Haqiqiy dori eslatmasi kelajakdagi ilova uchun rejalashtirilgan. Saytdagi namuna telefoningizga xabar yubormaydi." },
      { type: "note", tone: "info", title: "Muhim", text: "Sxema va dozalar — namuna. Davolashdan oldin veterinar bilan maslahatlashing. Saytda bosgan amallaringiz sahifa yangilanganda boshidan boshlanadi." },
    ],
    cta: { label: "Veterinarga qo‘ng‘iroq qilish", href: "vet:tel" },
  },
  "/nasab-daraxti": {
    h1: "Nasab daraxti: kim kimning qarindoshi",
    intro: "Bu sahifada oldindan tayyorlangan nasab daraxti namunasi bor: hayvonning ota-onasi va bobo-buvisi quloq raqami bilan ko‘rsatilgan. Saytda o‘z hayvoningiz nasabini kiritish yoki juftlashni tekshirish imkoniyati hali yo‘q.",
    blocks: [
      { type: "widget", name: "pedigree" },
      { type: "h2", text: "Ilova uchun rejalashtirilgan imkoniyatlar" },
      { type: "steps", items: [
        { text: "Buzoqning onasi va otasini quloq raqami bilan yozish." },
        { text: "Kiritilgan ma’lumotlardan nasab daraxtini chizish." },
        { text: "Juftlashdan oldin nasabdagi yaqin qarindoshlikni ko‘rsatish. Yakuniy qarorni mutaxassis bilan qabul qilish." },
      ] },
      { type: "note", tone: "info", title: "Muhim", text: "Bu namuna. Nasl tanlash bo‘yicha yakuniy qarorni zootexnik yoki veterinar bilan qabul qiling." },
    ],
    cta: { label: "Statistikani ko‘rish", href: "/statistika" },
  },
  "/statistika": {
    h1: "Sut statistikasi va hayvon kartochkasi — namuna",
    intro: "Kunlik sut, ferma bo‘yicha jami va hayvon kartochkasining oldindan tayyorlangan namunalarini ko‘ring. Bu sayt sof foyda yoki zararni hisoblamaydi, o‘z hayvonlaringiz yozuvlarini ham yig‘maydi.",
    blocks: [
      { type: "widget", name: "farmStats" },
      { type: "widget", name: "animalCard" },
      { type: "note", tone: "info", title: "Muhim", text: "Raqamlar va tarix — namuna. Kelajakdagi ilovada foydalanuvchi kiritgan sut va hayvon yozuvlaridan statistikani hisoblash rejalashtirilgan." },
    ],
    cta: { label: "Daftardan farqini ko‘ring", href: "/daftardan-farqi" },
  },
  "/daftardan-farqi": {
    h1: "Daftar bilan MeningFermam farqi",
    intro: "Daftardagi ishlar bilan saytda ko‘rsatilgan namunalarni solishtiring. Ilova hali ishga tushmagan; jadvaldagi “Namuna” haqiqiy ferma yozuvlarini yuritish yoki telefon eslatmasi ishlashini anglatmaydi.",
    blocks: [{ type: "widget", name: "compare" }],
    cta: { label: "Rejalashtirilgan funksiyalar", href: "/tez-orada" },
  },
  "/tez-orada": {
    h1: "Ilova uchun rejalashtirilgan funksiyalar",
    intro: "Bu imkoniyatlar hali ishga tushmagan. Ularni ilovaga qo‘shish rejalashtirilgan, tayyor bo‘lish sanasi belgilanmagan.",
    blocks: [{ type: "widget", name: "soonList" }],
    cta: { label: "Yangiliklarni Telegramda kuzating", href: "telegram:" },
  },
  "/savollar": {
    h1: "Ko‘p beriladigan savollar",
    intro: "Yem, davolash va saytdagi ma’lumotlar haqida qisqa javoblar.",
    blocks: [],
    cta: { label: "Javob topmadingizmi? Bizga yozing", href: "/aloqa" },
  },
  "/aloqa": {
    h1: "Biz bilan bog‘laning",
    intro: "Savolingiz bo‘lsa, qo‘ng‘iroq qiling yoki yozing.",
    blocks: [
      { type: "widget", name: "contacts" },
      { type: "note", tone: "warn", text: "Hayvon og‘ir ahvolda bo‘lsa, darhol veterinarga qo‘ng‘iroq qiling." },
    ],
    cta: { label: "Bosh sahifaga qaytish", href: "/" },
  },
  "/maxfiylik": {
    h1: "Maxfiylik siyosati",
    intro: "Bu sahifa sayt qanday ma’lumotni saqlashi va qanday ma’lumotni saqlamasligi haqida.",
    blocks: [
      { type: "h2", text: "Qisqacha" },
      { type: "p", text: "Saytda ro‘yxatdan o‘tish, kirish yoki ma’lumot yuboradigan forma yo‘q. Biz sizdan ism, telefon raqami yoki boshqa shaxsiy ma’lumot so‘ramaymiz." },
      { type: "h2", text: "Brauzeringizda nima saqlanadi" },
      { type: "p", text: "Faqat yem hisoblagichida o‘zingiz yozgan yem narxlari. Ular shu qurilmadagi brauzer xotirasida (localStorage) saqlanadi va serverga yuborilmaydi. O‘chirish uchun “Taxminiy narxlarga qaytarish” tugmasini bosing yoki brauzer ma’lumotlarini tozalang." },
      { type: "h2", text: "Nima saqlanmaydi" },
      { type: "p", text: "Davolash, dori ombori va eslatma namunalarida bosgan amallaringiz hech qayerga yozilmaydi. Sahifa yangilanganda ular boshidan boshlanadi." },
      { type: "h2", text: "Cookie va statistika" },
      { type: "p", text: "Sayt cookie-fayl o‘rnatmaydi va tashrif statistikasini yig‘maydi. Kelajakda statistika qo‘shilsa, bu sahifa oldindan yangilanadi." },
      { type: "h2", text: "Server" },
      { type: "p", text: "Sayt joylashgan server (hosting) texnik sabablarga ko‘ra so‘rovlar jurnalini (IP manzil, vaqt, ochilgan sahifa) yuritishi mumkin. Jurnal qancha saqlanishi hosting tanlangach shu yerga yoziladi." },
      { type: "h2", text: "Biz bilan bog‘lansangiz" },
      { type: "p", text: "Telefon, Telegram yoki Instagram orqali yozsangiz, xabaringiz o‘sha xizmatlar orqali keladi va ularning o‘z maxfiylik qoidalari amal qiladi. Xabaringizdagi ma’lumotdan faqat sizga javob berish uchun foydalanamiz." },
      { type: "h2", text: "O‘zgarishlar" },
      { type: "p", text: "Siyosat o‘zgarsa, shu sahifada yangi sana bilan e’lon qilinadi." },
    ],
    cta: { label: "Aloqa", href: "/aloqa" },
  },
  "/shartlar": {
    h1: "Foydalanish shartlari",
    intro: "Saytdan foydalanishdan oldin quyidagilarni o‘qing.",
    blocks: [
      { type: "h2", text: "Sayt nima" },
      { type: "p", text: "Bu MeningFermam uchun tanishtiruv sayti; ilova hali ishga tushmagan. Saytdagi hisoblar, hayvon raqamlari, dorilar va eslatmalar — namuna. Saytda hisob ochish va haqiqiy hayvon yozuvlarini yuritish imkoniyati yo‘q." },
      { type: "h2", text: "Veterinar o‘rnini bosmaydi" },
      { type: "p", text: "Saytdagi alomatlar, sxemalar va dozalar tashxis yoki davolash buyurtmasi emas. Hayvonni davolashdan oldin veterinar bilan maslahatlashing. Shoshilinch holatda darhol veterinarga murojaat qiling." },
      { type: "h2", text: "Yem hisobi" },
      { type: "p", text: "Hisob taxminiy. Yem miqdorlari namuna, zootexnik tasdig‘i kutilmoqda. Narxlar taxminiy va bozorga qarab farq qiladi. Sut, vazn yoki daromad oshishi va’da qilinmaydi." },
      { type: "h2", text: "Namunalar" },
      { type: "p", text: "Dori ombori, davolash va eslatma namunalari haqiqiy hisob yuritmaydi, xabar yubormaydi va sahifa yangilanganda boshidan boshlanadi." },
      { type: "h2", text: "Funksiyalar holati" },
      { type: "p", text: "“Namuna” — funksiya qanday ko‘rinishini shu saytda ko‘rsatadigan misol, ishga tushgan ilova emas. “Jarayonda” va “Rejada” — ilova uchun rejalashtirilgan ishlar; ularning muddati va’da qilinmaydi." },
      { type: "h2", text: "Javobgarlik" },
      { type: "p", text: "Saytdagi namunaviy ma’lumotlarga asoslanib, mutaxassis bilan maslahatlashmasdan qilingan davolash yoki yem o‘zgarishlari uchun MeningFermam javob bermaydi." },
      { type: "h2", text: "Mualliflik huquqi" },
      { type: "p", text: "Logo, dizayn va matnlar MeningFermam’ga tegishli. Ruxsatsiz nusxa ko‘chirmang." },
      { type: "h2", text: "Tashrif qoidalari" },
      { type: "p", text: "Saytdan qonuniy maqsadda foydalaning. Saytning ishlashiga xalaqit beradigan harakatlar (avtomatik ko‘p so‘rov yuborish, buzishga urinish) taqiqlanadi." },
      { type: "h2", text: "O‘zgarishlar va aloqa" },
      { type: "p", text: "Shartlar o‘zgarsa, shu sahifada yangi sana bilan e’lon qilinadi. Savollar uchun aloqa sahifasiga o‘ting." },
    ],
    cta: { label: "Aloqa", href: "/aloqa" },
  },
} satisfies Record<string, InnerPage>;

export type InnerPath = keyof typeof pages;

/** /davolash-rejasi tepasidagi shoshilinch ogohlantirish; oxiriga veterinar raqami qo'shiladi. */
export const urgentVetText = "⚠ Hayvon og‘ir ahvolda bo‘lsa — qorni shishib ketsa, yiqilib qolsa yoki suruvda to‘satdan o‘lim bo‘lsa — darhol veterinarga qo‘ng‘iroq qiling:";

export const notFoundText = { h1: "Sahifa topilmadi", text: "Bu manzilda sahifa yo‘q. Manzilda xato bo‘lishi mumkin.", cta: "Bosh sahifaga qaytish" };

/** /statistika namunalari (egasi tasdiqlagan). */
export const farmStats = {
  title: "Ferma bo‘yicha (namuna)",
  items: [
    { label: "Sog‘in sigirlar", value: "4 bosh" },
    { label: "Jami sut", value: "kuniga 36 litr" },
    { label: "O‘rtacha", value: "bir sigirdan 9 litr" },
    { label: "Diqqat talab qiladi", value: "1 bosh (№ 0377)" },
  ],
};

export const animalCard = {
  title: "Hayvon kartochkasi (namuna): № 0377",
  rows: [
    { label: "Turi", value: "sigir" },
    { label: "Yoshi", value: "5 yosh" },
    { label: "Kunlik sut", value: "5 litr (oldin 9 litr edi)" },
    { label: "Kasallik tarixi", value: "avgust — yelini shishgan, veterinar ko‘rgan" },
    { label: "Davolash tarixi", value: "3 kunlik kurs, tugallangan" },
  ],
};

/** /daftardan-farqi: holat yagona manbadan (holat.ts) olinadi. */
export const compareRows = [
  { job: "Dori vaqti", paper: "O‘zingiz eslab qolasiz", app: "Eslatma ko‘rinishining namunasi; haqiqiy xabar yuborilmaydi", feature: "eslatma" },
  { job: "Nasab", paper: "Varaqlab qidirasiz", app: "Oldindan tayyorlangan nasab daraxti namunasi", feature: "nasab" },
  { job: "Sut yozuvlari", paper: "Har bir hayvon uchun yozasiz", app: "Sut statistikasi va hayvon tarixining namunasi", feature: "statistika" },
  { job: "Veterinarga savol", paper: "Telefon yoki Telegram orqali bog‘lanasiz", app: "Veterinarning telefon va Telegram havolalari", feature: "vet" },
  { job: "Yem xarajati", paper: "Kalkulyatorda hisoblaysiz", app: "Namuna miqdori va siz yozgan narxdan taxminiy summa hisoblanadi", feature: "yem" },
  { job: "Dori va sxema", paper: "Qog‘ozdan qidirasiz", app: "Sxema va doza namunasi; veterinar maslahati kerak", feature: "sxema" },
  { job: "Dori ombori", paper: "Omborga borib sanaysiz", app: "Namuna bosqichi bajarilganda namuna qoldig‘i kamayadi", feature: "ombor" },
  { job: "Vetapteka, emlash, tug‘ish eslatmasi", paper: "—", app: "Ilova uchun rejalashtirilgan", feature: "vetapteka" },
] as const;

export const soonExtra = { emoji: "📱", title: "Ilovaga kirish", note: "Hisob ochish va o‘z hayvonlaringiz yozuvlarini yuritish kelajakdagi ilova uchun rejalashtirilgan." };

export const compareHead = { job: "Ish", paper: "Daftarda", app: "Hozirgi saytda", status: "Holati" };
