// Dori ombori namunasi (TZ v3.1 §4.5). Demo v12 dagi tarkib. Namuna: real tavsiya yoki yaroqlilik tasdig'i emas.
import type { DrugDef, StockEntry } from "@/lib/drug-store";

export const drugs: Record<string, DrugDef> = {
  antib: { key: "antib", name: "Antibiotik ukol (Oksitetrasiklin 20%)", unit: "ml", vial: 100 },
  melo: { key: "melo", name: "Isitma va og‘riqqa qarshi (Meloksikam 2%)", unit: "ml", vial: 50 },
  iver: { key: "iver", name: "Gijja va kanaga qarshi (Ivermektin 1%)", unit: "ml", vial: 50 },
  vit: { key: "vit", name: "Vitamin (A, D, E)", unit: "ml", vial: 100 },
  yelin: { key: "yelin", name: "Yelin shpritsi", unit: "dona", vial: 1 },
  // Mahsulot/qadoq ma'lum emas: real doza yoki hajm o'rniga faqat namuna hisobi.
  suvtuz: { key: "suvtuz", name: "Suv-tuz kukuni (namuna)", unit: "namuna birligi", vial: 1 },
  ichak: { key: "ichak", name: "Ichak dorisi (namuna)", unit: "namuna birligi", vial: 1 },
  sprey: { key: "sprey", name: "Tuyoq spreyi (namuna)", unit: "namuna birligi", vial: 1 },
};

export const initialStock: Record<string, StockEntry> = {
  antib: { closed: 2, open: 60 },
  melo: { closed: 0, open: 15 },
  iver: { closed: 1, open: 0 },
  vit: { closed: 3, open: 0 },
  yelin: { closed: 6, open: 0 },
  suvtuz: { closed: 0, open: 0 },
  ichak: { closed: 0, open: 0 },
  sprey: { closed: 0, open: 0 },
};

/** Eski kontentning oddiy dori nomlari; barcha turlari endi namuna omborida bor. */
export const otherDrugNames: Record<string, string> = {
  suvtuz: "Suv-tuz kukuni",
  ichak: "Ichak dorisi",
  sprey: "Tuyoq spreyi",
};

export const omborText = {
  ask: "“Qaysi dori qancha qoldi, bilmayman”",
  title: "Dori ombori: qancha bor, qancha qoldi",
  sub: "Namuna omboriga qo‘shing va sarf hisobini sinang. Bu haqiqiy ombor emas; sahifani qayta yuklasangiz, namuna boshidan boshlanadi.",
  reset: "Omborni boshidan ko‘rsatish",
  lowTag: "Kam qoldi",
  /** Yaroqlilik qoldiq miqdoriga tenglashtirilmaydi (TZ §4.5). */
  openTag: (ml: number) => `Ochilgan: ${ml} ml · muddat tasdiqlanmagan`,
  empty: "Tugadi",
  sampleUnit: "Namuna birligi haqiqiy doza yoki qadoq hajmini bildirmaydi.",
};
