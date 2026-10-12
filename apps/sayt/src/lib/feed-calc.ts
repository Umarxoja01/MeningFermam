// Yem hisoblagich (TZ v3.1 §4.3). Formulalar demo v12 bilan aynan, faqat zot parametri yo'q (Y-02, egasi tasdiqlagan).
// Me'yorlar namuna: zootexnik tasdig'ini kutadi. Prognoz (sut/vazn oshishi) qaytarilmaydi (Y-01).
// Sof funksiyalar: server, brauzer va testda bir xil natija beradi.

import { defaultPrices, isValidPrice, type FeedKey, type Prices } from "./prices";

export type AnimalKey = "sigir" | "buqa" | "qoy";
export type Option = { label: string; value: number };

type FeedPart = readonly [key: FeedKey, kg: number];

export type AnimalSpec = {
  label: string;
  weights: readonly number[];
  goalLabel: string;
  goals: readonly Option[];
  /** Hayvon tanlanganda oldindan bosilgan tanlov (demo: ikkinchi tugma). */
  defaultWeight: number;
  defaultGoal: number;
  feeds: (weight: number, goal: number) => readonly FeedPart[];
  /** Tuz, osh qoshiq (namuna). */
  salt: (weight: number, goal: number) => number;
};

export const animals: Record<AnimalKey, AnimalSpec> = {
  sigir: {
    label: "🐄 Sigir",
    weights: [300, 400, 500, 600],
    goalLabel: "Hozir kuniga necha litr sut beradi?",
    goals: [5, 10, 15, 20, 25].map((l) => ({ label: `${l} litr`, value: l })),
    defaultWeight: 400,
    defaultGoal: 10,
    feeds(W, L) {
      const c = L * 0.35;
      return [["beda", W * 0.012], ["silos", W * 0.022], ["somon", W * 0.006], ["arpa", c * 0.5], ["kepak", c * 0.3], ["kunjara", c * 0.2]];
    },
    salt: (_W, L) => 1 + Math.round(L / 10),
  },
  buqa: {
    label: "🐂 Buqa",
    weights: [300, 400, 500, 600],
    goalLabel: "Qancha boqmoqchisiz?",
    goals: [{ label: "Kam", value: 0 }, { label: "O‘rtacha", value: 1 }, { label: "Ko‘p", value: 2 }],
    defaultWeight: 400,
    defaultGoal: 1,
    feeds(W, g) {
      const c = W * ([0.008, 0.011, 0.014][g] ?? 0.011);
      return [["silos", W * 0.022], ["beda", W * 0.008], ["somon", W * 0.008], ["arpa", c * 0.55], ["kepak", c * 0.3], ["kunjara", c * 0.15]];
    },
    salt: () => 2,
  },
  qoy: {
    label: "🐑 Qo‘y",
    weights: [30, 45, 60, 75],
    goalLabel: "Qancha boqmoqchisiz?",
    goals: [{ label: "Oddiy", value: 0 }, { label: "Ko‘proq", value: 1 }],
    defaultWeight: 45,
    defaultGoal: 1,
    feeds(W, g) {
      const c = W * ([0.005, 0.012][g] ?? 0.012);
      return [["beda", W * 0.02], ["somon", W * 0.01], ["arpa", c * 0.6], ["kepak", c * 0.4]];
    },
    salt: () => 0,
  },
};

export const animalKeys = Object.keys(animals) as AnimalKey[];

/** 0,5 kg ga yaxlitlash (fermer tilida: "yarim"). */
export const half = (x: number) => Math.round(x * 2) / 2;

/** "5 kg", "2 yarim kg", "yarim kg". */
export function amountText(x: number) {
  const h = half(x);
  const n = Math.floor(h);
  if (h === n) return `${n} kg`;
  return n ? `${n} yarim kg` : "yarim kg";
}

export type FeedRow = { key: FeedKey; kg: number; amount: string };
export type FeedResult = { rows: FeedRow[]; salt: number; perDay: number; perMonth: number };

/**
 * Kunlik va 30 kunlik xarajat. Har yem avval 0,5 kg ga yaxlitlanadi, keyin 1 kg narxiga ko'paytiriladi.
 * Kunlik summa 100 so'mga, oylik 1000 so'mga yaxlitlanadi; yarmi yuqoriga (Math.round). Bu qoida TZ qabul
 * raqamlarini (36 400 / 1 092 000 / 36 900) beradi va testda qotirilgan.
 * Noto'g'ri narx kelib qolsa (NaN, manfiy), o'sha yem uchun taxminiy narx olinadi: natija hech qachon NaN bo'lmaydi.
 */
export function calculateFeed(animal: AnimalKey, weight: number, goal: number, prices: Prices): FeedResult {
  const a = animals[animal];
  let day = 0;
  const rows: FeedRow[] = [];
  for (const [key, kg] of a.feeds(weight, goal)) {
    const h = half(kg);
    if (!h) continue;
    const price = isValidPrice(prices[key]) ? prices[key] : defaultPrices[key];
    day += h * price;
    rows.push({ key, kg: h, amount: amountText(kg) });
  }
  const perDay = Math.round(day / 100) * 100;
  return { rows, salt: a.salt(weight, goal), perDay, perMonth: Math.round((perDay * 30) / 1000) * 1000 };
}

