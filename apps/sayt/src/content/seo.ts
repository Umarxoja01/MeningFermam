// Sahifa sarlavhalari va tavsiflari (TZ v3.1 §9.4; docs/MATNLAR_QORALAMA.md 1-bo'lim). ★ — TZ §5 dan aynan.
export type PagePath = "/" | "/yem-rejasi" | "/davolash-rejasi" | "/nasab-daraxti" | "/statistika" | "/daftardan-farqi" | "/tez-orada" | "/savollar" | "/aloqa" | "/maxfiylik" | "/shartlar";

export const seo: Record<PagePath, { title: string; description: string }> = {
  "/": { title: "MeningFermam — chorvador uchun namuna sayt", description: "Yem xarajatining taxminiy hisobi, dori ombori, eslatma, sut va nasab namunalari. Veterinar bilan aloqa. Ilova hali ishga tushmagan." },
  "/yem-rejasi": { title: "Yem rejasi va xarajat hisobi", description: "Kunlik yem, aralashma va xarajat haqida namuna hisob." }, // ★
  "/davolash-rejasi": { title: "Davolash rejasi — interaktiv namuna", description: "Alomat, sxema va dori omborining interaktiv namunasi. Haqiqiy davolash uchun veterinarga murojaat qiling." },
  "/nasab-daraxti": { title: "Nasab daraxti — namuna", description: "Oldindan tayyorlangan ota-ona va bobo-buvi nasab daraxti. Juftlash qarorini mutaxassis bilan qabul qiling." },
  "/statistika": { title: "Sut statistikasi va hayvon kartochkasi — namuna", description: "Kunlik sut, ferma bo‘yicha jami, hayvon va davolash tarixining tayyor namunalari. Sof foyda yoki zarar hisoblanmaydi." },
  "/daftardan-farqi": { title: "Daftar va saytdagi namunalar", description: "Daftardagi ishlar bilan hozirgi saytdagi namunalarni solishtiring. Ilova hali ishga tushmagan." },
  "/tez-orada": { title: "Ilova uchun rejalashtirilgan funksiyalar", description: "Vetapteka, emlash kalendari, tug‘ish eslatmasi va ilovaga kirish rejalari. Ishga tushish sanasi belgilanmagan." },
  "/savollar": { title: "Savol-javob", description: "Yem rejasi, davolash va xavfsizlik savollariga javoblar." }, // ★
  "/aloqa": { title: "Aloqa", description: "MeningFermam bilan bog‘lanish: telefon, Telegram va Instagram. Har kuni 8:00–21:00." },
  "/maxfiylik": { title: "Maxfiylik siyosati", description: "MeningFermam sayti qanday ma’lumotni saqlaydi va qanday ma’lumotni saqlamaydi." },
  "/shartlar": { title: "Foydalanish shartlari", description: "Sayt namunaviy ekanligi, veterinar ko‘rigini almashtirmasligi va foydalanish qoidalari." },
};

export const pagePaths = Object.keys(seo) as PagePath[];

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://meningfermam.uz").replace(/\/$/, "");
