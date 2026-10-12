// "Molim kasal" namunasi (TZ v3.1 §4.4). Demo v12 dagi barcha ma'lumot saqlangan (egasi qarori, 2026-10-12).
// Alomat avtomatik tashxis emas: nom "Ehtimoliy holat (namuna)" bilan ko'rsatiladi.
import type { Rx, Symptom } from "@meningfermam/content";
import type { CaseDef } from "../lib/drug-store";

export type { Symptom };

export type SickAnimalKey = "sigir" | "buzoq" | "buqa" | "qoy";

const r = (drug: string, amount: number, perKg: number, note: string): Rx => ({ drug, amount, perKg, note });

export const sickAnimals: Record<SickAnimalKey, { label: string; icon: string; patient: string; weights: readonly number[]; symptoms: readonly Symptom[] }> = {
  sigir: {
    label: "🐄 Sigir", icon: "🐄", patient: "Sigir № 0213", weights: [300, 400, 500, 600],
    symptoms: [
      { id: "sigir-mastit", sign: "Yelini shishdi", name: "Mastit", easy: "Yelinga mikrob tushgan. Kechiktirsangiz, o‘sha chorak sut bermay qo‘yadi.", urgent: false,
        plan: [["1–3 kun", "Yelin shpritsi, har sog‘imdan keyin"], ["1–3 kun", "Yallig‘lanishga qarshi ukol"], ["4-kun", "Veterinar ko‘radi"]],
        drugs: ["Yelin shpritsi", "Yallig‘lanishga qarshi ukol"],
        rx: [r("yelin", 1, 0, "Har sog‘imdan keyin"), r("melo", 2.5, 100, "Yallig‘lanishga qarshi")], days: 3 },
      { id: "sigir-dam", sign: "Qorni shishib ketdi", name: "Qorin dam bo‘lishi", easy: "Qorinda gaz to‘plangan. Juda tez xavfli bo‘ladi.", urgent: true,
        plan: [["Darhol", "Veterinar chaqiring"], ["Kutguncha", "Yurgizing, yem bermang"]],
        drugs: ["Gaz chiqaruvchi dori (veterinar beradi)"], rx: [], days: 0 },
      { id: "sigir-isitma", sign: "Yem yemayapti, isitma", name: "Isitma", easy: "Haroratini o‘lchang. 39,5 dan yuqori bo‘lsa, kasal.", urgent: false,
        plan: [["1-kun", "Harorat, veterinarga yozing"], ["1–3 kun", "Isitma tushiruvchi ukol"]],
        drugs: ["Isitma tushiruvchi ukol", "Vitamin"],
        rx: [r("melo", 2.5, 100, "Isitmani tushiradi"), r("vit", 1, 50, "Kuch beradi")], days: 3 },
    ],
  },
  buzoq: {
    label: "🐮 Buzoq", icon: "🐮", patient: "Buzoq № 0305", weights: [50, 80, 120, 150],
    symptoms: [
      { id: "buzoq-ich", sign: "Ichi ketyapti", name: "Ich ketishi", easy: "Eng xavflisi: tanasidan suv chiqib ketadi. Suvni qaytarish kerak.", urgent: false,
        plan: [["1–3 kun", "Suv-tuz eritmasi, kuniga 3 marta"], ["1–3 kun", "Ichak dorisi"], ["1-kun", "Sutni kamaytiring"]],
        drugs: ["Suv-tuz kukuni", "Ichak dorisi"],
        rx: [r("suvtuz", 1, 0, "Suvni qaytaradi"), r("ichak", 1, 0, "Ichni to‘xtatadi")], days: 3 },
      { id: "buzoq-yotal", sign: "Yo‘talyapti", name: "Shamollash", easy: "Kechiktirilsa, o‘pkaga tushadi.", urgent: false,
        plan: [["1–5 kun", "Antibiotik ukol"], ["Har kuni", "Issiq, shamolsiz joy"]],
        drugs: ["Antibiotik ukol", "Isitma tushiruvchi"],
        rx: [r("antib", 1, 10, "Antibiotik"), r("melo", 2.5, 100, "Isitmani tushiradi")], days: 5 },
    ],
  },
  buqa: {
    label: "🐂 Buqa", icon: "🐂", patient: "Buqa № 0118", weights: [300, 400, 500, 600],
    symptoms: [
      { id: "buqa-gijja", sign: "Yeydi, lekin semirmaydi", name: "Gijja", easy: "Yegan yemini gijja yeydi. Shuning uchun o‘zini oqlamaydi.", urgent: false,
        plan: [["1-kun", "Gijjaga qarshi dori"], ["14-kun", "Takror"], ["Har 3 oy", "Oldini olish"]],
        drugs: ["Gijjaga qarshi dori", "Vitamin"],
        rx: [r("iver", 1, 50, "Gijjaga qarshi"), r("vit", 1, 50, "Kuch beradi")], days: 14, treatmentDays: [1, 14] },
      { id: "buqa-tuyoq", sign: "Oqsoqlanyapti", name: "Tuyoq chirishi", easy: "Og‘riqdan yemay qo‘yadi, vazn yo‘qotadi.", urgent: false,
        plan: [["1-kun", "Tuyoqni tozalash"], ["1–3 kun", "Antibiotik ukol"]],
        drugs: ["Antibiotik ukol", "Tuyoq spreyi"],
        rx: [r("antib", 1, 10, "Antibiotik"), r("sprey", 1, 0, "Tuyoqqa sepiladi")], days: 3 },
    ],
  },
  qoy: {
    label: "🐑 Qo‘y", icon: "🐑", patient: "Qo‘y № 0542", weights: [30, 45, 60, 75],
    symptoms: [
      { id: "qoy-qotir", sign: "Juni to‘kilyapti", name: "Qo‘tir", easy: "Butun suruvga tez yuqadi. Hammasini birga davolang.", urgent: false,
        plan: [["1-kun", "Kanaga qarshi ukol"], ["10-kun", "Takror"]],
        drugs: ["Kanaga qarshi ukol"],
        rx: [r("iver", 1, 50, "Kanaga qarshi")], days: 10, treatmentDays: [1, 10] },
      { id: "qoy-entero", sign: "Birdan o‘lib qolyapti", name: "Enterotoksemiya", easy: "Juda tez o‘tadi. Emlash bilan oldini olinadi.", urgent: true,
        plan: [["Darhol", "Veterinar chaqiring"], ["Butun suruv", "Emlash"]],
        drugs: ["Vaksina (veterinar qiladi)"], rx: [], days: 0 },
    ],
  },
};

export const sickAnimalKeys = Object.keys(sickAnimals) as SickAnimalKey[];

/** Reducer uchun kurslar: davolash namunasi bor alomatlar. */
export const cases: Record<string, CaseDef> = Object.fromEntries(
  Object.values(sickAnimals).flatMap((a) => a.symptoms.filter((s) => s.rx.length).map((s) => [s.id, { id: s.id, days: s.days, rx: s.rx, treatmentDays: s.treatmentDays }])),
);

export const kasalText = {
  chip: "🩺 Molim kasal",
  title: "Bosing. Namuna ko‘rinishini va veterinar bilan bog‘lanishni ko‘ring.",
  who: "Kim kasal?",
  what: "Nima bo‘ldi?",
  probable: "Ehtimoliy holat (namuna) — veterinarning tekshiruvi kerak",
  callVet: "Veterinar chaqirish",
  urgent: "⚠ Shoshilinch! Darhol veterinar chaqiring.",
  plan: "📅 Sxema",
  drugs: "💊 Dorilar",
  certified: "Namuna",
  treat: "💉 Davolash hisobining namunasi",
  vetOnly: "Bu davolashni veterinar qiladi. “Veterinar chaqirish” tugmasini bosing.",
  weight: "Vazni qancha?",
  done: "✓ Namuna bosqichini bajarish",
  finished: "✓ Namuna bosqichlari bajarildi",
  needDrug: "Avval dorini oling",
  notInStock: "Sizda bu dori yo‘q. Vetaptekadan oling",
  short: (need: string, have: string) => `${need} kerak, omborda ${have}. Yetmaydi`,
  blocked: "Hamma dori yetmaguncha bu kun bajarilmaydi. Ombordan hech narsa ayirilmadi.",
  recorded: "✓ Yozib qo‘yildi. Ombordan ayirildi:",
  newVial: "Yangi flakon ochildi:",
  toStore: "Omborni ko‘rish ›",
  pharmacyTitle: "📍 Eng yaqin vetapteka",
  pharmacy: "Tez kunda: yaqindagi vetaptekalar va dorilar mavjudligi",
  fine: "Bu interaktiv namuna. Sxema, doza va davolash yakunini veterinarga tekshirtiring. Tugmalar haqiqiy muolajani qayd etmaydi.",
  repeatHint: "Takroriy kun ham alohida namuna bosqichi. Uni bu yerda sinash mumkin; haqiqiy eslatma yuborilmaydi.",
  sampleUnitHint: "Namuna birligi — ombor hisobini sinash uchun. Dori dozasi, qadoq hajmi yoki qo‘llash usulini bildirmaydi.",
};
