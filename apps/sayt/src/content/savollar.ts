// Savol-javob (TZ v3.1 §5; docs/MATNLAR_QORALAMA.md 2.7). Xizmat narxi haqida da'vo yo'q (§7).
import type { Faq } from "@meningfermam/content";

export type { Faq };

export const faqGroups: { title: string; items: Faq[] }[] = [
  {
    title: "Yem",
    items: [
      { q: "Yem hisobi qanchalik aniq?", a: "Taxminiy. Miqdorlar namuna, zootexnik tasdig‘i kutilmoqda. Hayvoningiz holatiga qarab mutaxassis bilan maslahatlashing." },
      { q: "Narxlarni o‘zim o‘zgartira olamanmi?", a: "Ha. “Yem narxlarini o‘zingiz yozing” bo‘limida har bir yemning 1 kg narxini yozing. Narx shu telefonning brauzerida saqlanadi." },
      { q: "Qaysi hayvonlar uchun hisoblaydi?", a: "Sigir, buqa va qo‘y uchun." },
    ],
  },
  {
    title: "Davolash",
    items: [
      { q: "Sayt aniq tashxis qo‘yadimi?", a: "Yo‘q. Alomat bo‘yicha ehtimoliy holat ko‘rsatiladi. Aniq tashxisni veterinar qo‘yadi." },
      { q: "Saytdagi doza va sxema bo‘yicha davolasam bo‘ladimi?", a: "Ular namuna. Davolashdan oldin veterinar bilan maslahatlashing: {vet}." },
      { q: "Hayvonim og‘ir ahvolda bo‘lsa nima qilay?", a: "Darhol veterinarga qo‘ng‘iroq qiling. Saytdagi namunaga qarab vaqt yo‘qotmang." },
      { q: "Dori ombori nima?", a: "Saytdagi namuna dori qoldiqlarini ko‘rsatadi. Namuna bosqichini bajarsangiz, qoldiq kamayadi. Bu haqiqiy ombor hisobi emas; sahifa yangilanganda namuna boshidan boshlanadi." },
    ],
  },
  {
    title: "Xavfsizlik va ma’lumot",
    items: [
      { q: "Saytga ma’lumotlarim yoziladimi?", a: "Saytda hisob ochish va hayvon yozuvlarini kiritish imkoniyati yo‘q. Faqat siz yozgan yem narxlari shu telefonning brauzerida saqlanadi va serverga yuborilmaydi. Namunadagi hayvonlar va dorilar oldindan tayyorlangan." },
      { q: "Eslatma telefonimga keladimi?", a: "Saytdagi eslatma — namuna, u haqiqiy xabar yubormaydi. “Berildi” tanlovi ham haqiqiy davolash yozuvi sifatida saqlanmaydi." },
      { q: "Ilovani qachondan ishlatsam bo‘ladi?", a: "Ilova hali ishga tushmagan, ochilish sanasi belgilanmagan. Hozir saytdagi namunalarni sinab ko‘rishingiz mumkin. Yangiliklar Telegramda: {telegram}." },
      { q: "“Namuna” holati nimani bildiradi?", a: "Funksiya qanday ko‘rinishini shu saytda ko‘rasiz. Bu ishga tushgan ilova yoki haqiqiy ferma hisobi degani emas. “Jarayonda” va “Rejada” — ilova uchun rejalashtirilgan ishlar." },
      { q: "Qaysi hayvon foyda yoki zarar keltirishini bilsam bo‘ladimi?", a: "Bu saytda kunlik sut, nasab va hayvon kartochkasining tayyor namunalari bor. Hayvonning sof foydasi yoki zarari hisoblanmaydi." },
      { q: "Veterinarga savolim qanday boradi?", a: "Telefon yoki Telegram havolasini bosing: {vet}. Savolingizni o‘zingiz aytasiz yoki yozasiz. Saytdagi namuna hayvon ma’lumotlarini veterinarga avtomatik yubormaydi." },
      { q: "Qaysi hayvonlar uchun?", a: "Sigir, buqa, buzoq va qo‘y." },
    ],
  },
];
