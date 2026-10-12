// Bosh sahifa va umumiy qobiq matnlari (TZ v3.1 §4, §6). O'zgartirish: shu faylni tahrirlang, keyin `npm test` va `npm run build`.
// Audit tuzatishlari (2026-10-12): joriy namuna sayt va hali ishga tushmagan ilova aniq ajratiladi.

export const site = {
  name: "MeningFermam",
  tagline: "Chorvadorning telefondagi yordamchisi — hozircha namuna sayt.",
  legal: "Veterinar ko‘rigini almashtirmaydi",
};

export const nav = {
  links: [
    { href: "/#muammo", label: "Muammolar" },
    { href: "/#yem", label: "Yem" },
    { href: "/#kasal", label: "🩺 Molim kasal", vet: true },
    { href: "/#ombor", label: "Dori ombori" },
    { href: "/#eslatma", label: "Eslatma" },
    { href: "/#holat", label: "Funksiyalar" },
    { href: "#aloqa", label: "Aloqa" },
  ],
  tabbar: [
    { id: "yem", href: "/#yem", icon: "🌾", label: "Yem" },
    { id: "kasal", href: "/#kasal", icon: "🩺", label: "Molim kasal", sos: true },
    { id: "ombor", href: "/#ombor", icon: "💊", label: "Dorilar" },
    { id: "aloqa", href: "#aloqa", icon: "📞", label: "Aloqa" },
  ],
  footerSections: [
    { href: "/#kasal", label: "Molim kasal" },
    { href: "/#ombor", label: "Dori ombori" },
    { href: "/#yem", label: "Yem" },
    { href: "/#eslatma", label: "Eslatma" },
    { href: "/#statistika", label: "Statistika" },
  ],
  footerGuides: [
    { href: "/yem-rejasi", label: "Yem hisobi haqida" },
    { href: "/davolash-rejasi", label: "Davolash namunasi" },
    { href: "/nasab-daraxti", label: "Nasab daraxti" },
    { href: "/statistika", label: "Sut statistikasi" },
    { href: "/daftardan-farqi", label: "Daftardan farqi" },
    { href: "/tez-orada", label: "Rejalashtirilgan funksiyalar" },
    { href: "/savollar", label: "Savol-javob" },
  ],
};

/** Ma'lumot oynasi: ilova hali ishga tushmagan, saytga kirish/ro'yxatdan o'tish yo'q. */
export const start = {
  label: "Ilova haqida",
  title: "Ilova hali ishga tushmagan",
  text: "Hozir sayt orqali namunalarni sinab ko‘rishingiz mumkin. Ilovaning ochilish sanasi hali belgilanmagan. Savol va yangiliklar uchun:",
  close: "Yopish",
};

export const hero = {
  seal: "Tanishtiruv sayti · Hisoblar va davolash — namuna",
  h1: "Hayvoningiz gapira olmaydi.",
  h1em: "Uning o‘rniga biz aytamiz.",
  sub: "Yem xarajatini taxminan hisoblang, dori ombori va eslatma namunalarini sinab ko‘ring. Ilova hali ishga tushmagan.",
  cta: { label: "Yem hisobini sinab ko‘ring ›", href: "#yem" },
  floats: [
    { icon: "🌾", title: "Yem xarajati", text: "kuniga necha pul" },
    { icon: "🩺", title: "Veterinar bilan aloqa", text: "telefon va Telegram orqali" },
    { icon: "📍", title: "Vetapteka", text: "rejalashtirilgan" },
  ],
  trust: {
    title: "Namunalarni sinab ko‘ring, davolash uchun veterinarga bog‘laning",
    text: "Yem miqdorlari, sxema va dozalar — namuna. Mutaxassis tekshiruvi haqidagi tasdiq berilmaydi. Veterinar bilan telefon yoki Telegram orqali bog‘lanishingiz mumkin.",
    tags: ["🌾 Taxminiy yem hisobi", "🧪 Interaktiv namunalar", "📞 Veterinar bilan aloqa"],
  },
};

export const yem = {
  ask: "“Yemga qancha pul ketyapti?”",
  title: "Yem qancha ketyapti va necha pulga tushyapti",
  sub: "Hayvon turi va vazniga qarab taxminiy yem miqdori hamda xarajatini hisoblang",
  animal: "Hayvon",
  weight: "Vazni",
  perDay: "1 boshga kuniga",
  perMonth: "1 boshga oyiga",
  salt: "Tuz",
  saltUnit: "osh qoshiq",
  pricesSummary: "💰 Yem narxlarini o‘zingiz yozing",
  pricesHint: "bozoringizdagi narx",
  pricesReset: "Taxminiy narxlarga qaytarish",
  priceUnit: "so‘m/kg",
  priceError: "Faqat butun son, 0 dan 100 000 gacha",
  priceNotSaved: "Narx bu brauzerda saqlanmaydi, lekin hisob ishlaydi.",
  fine: "Narxni yozmasangiz, taxminiy narx olinadi. Yem miqdorlari — namuna, zootexnik tasdig‘i kutilmoqda.",
};

export const eslatma = {
  ask: "“Ukolning 2-kunini unutdim”",
  title: "Dori eslatmasi qanday ishlaydi?",
  sub: "Bu namuna: telefoningizga haqiqiy xabar yubormaydi va dori berilganini saqlamaydi.",
  time: "08:00",
  date: "Seshanba, 14-oktabr",
  app: "MeningFermam · hozir",
  noti: "💊 Dori vaqti: sigir № 0412",
  notiText: "Yelin shpritsi, 1 dona · 3-kun, 5 kundan",
  later: "Keyinroq",
  laterDone: "⏰ Namuna: keyinroq eslatish tanlandi. Haqiqiy xabar yuborilmaydi.",
  gave: "✓ Berdim",
  gaveDone: "✓ Berildi",
  doneMsg: "✓ Namuna: “Berildi” belgilandi. Bu yozuv saqlanmaydi va keyingi xabar yuborilmaydi.",
  replay: "Namunani qayta ko‘rsatish",
};

export const statistika = {
  chip: "Sut va nasab — namuna",
  title: "Kunlik sut va hayvonning nasabini ko‘ring.",
  milkTitle: "📊 Sut, kuniga (namuna)",
  milk: [
    { id: "№ 0412", w: 92, v: "12 L" },
    { id: "№ 0388", w: 78, v: "10 L" },
    { id: "№ 0415", w: 70, v: "9 L" },
    { id: "№ 0377", w: 38, v: "5 L", low: true },
  ],
  milkNote: "! № 0377: sut kamaydi",
  pedigreeTitle: "🧬 Nasab (namuna)",
  grand: [["№ 0102", "bobosi"], ["№ 0115", "buvisi"], ["№ 0098", "bobosi"], ["№ 0120", "buvisi"]] as const,
  parents: [["№ 0230", "otasi"], ["№ 0241", "onasi"]] as const,
  self: "№ 0412",
  no: "✗ № 0230 — otasi: yaqin qarindosh",
  yes: "№ 0507 bilan juftlash: nasabni mutaxassis tekshirishi kerak",
};

export const yakun = {
  title: "Namunalarni ko‘rdingiz. Savolingiz bormi?",
  sub: "Ilova hali ishga tushmagan. Savollaringizni Telegramda yozing; yangiliklar ham shu yerda e’lon qilinadi.",
};

export const loopText = { pause: "To‘xtatish", play: "Davom ettirish" };
