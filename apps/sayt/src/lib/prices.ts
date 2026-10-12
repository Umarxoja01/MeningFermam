// Yem narxlari: taxminiy qiymatlar, tekshiruv va brauzer xotirasi (TZ v3.1 §2.3, §4.3; F-10).
// Faqat shu narxlar localStorage'da saqlanadi. Xotira ishlamasa yoki buzilgan bo'lsa, sayt baribir ishlaydi.

export type FeedKey = "beda" | "silos" | "somon" | "arpa" | "kepak" | "kunjara";
export type Prices = Record<FeedKey, number>;

export const FEED_KEYS: readonly FeedKey[] = ["beda", "silos", "somon", "arpa", "kepak", "kunjara"];

export const feedNames: Record<FeedKey, string> = {
  beda: "Beda", silos: "Silos", somon: "Somon", arpa: "Arpa", kepak: "Kepak", kunjara: "Kunjara",
};

/** Taxminiy narxlar, so'm/kg (TZ v3.1 §4.3). */
export const defaultPrices: Prices = { beda: 2500, silos: 900, somon: 1200, arpa: 4000, kepak: 2500, kunjara: 4500 };

export const PRICE_MIN = 0;
export const PRICE_MAX = 100_000;
export const PRICE_STEP = 100;
export const STORAGE_KEY = "mf-narx";

/** 0 dan 100 000 gacha butun son. 0 to'g'ri qiymat (o'z yemi). */
export function isValidPrice(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= PRICE_MIN && v <= PRICE_MAX;
}

export type ParsedPrice = { ok: true; value: number } | { ok: false; reason: "empty" | "invalid" };

/** Fermer yozgan matn. Raqam guruhlari orasidagi probel ruxsat ("2 500"); harf, vergul, minus — noto'g'ri. */
export function parsePriceInput(raw: string): ParsedPrice {
  const s = raw.replace(/[\s  ]/g, "");
  if (!s) return { ok: false, reason: "empty" };
  if (!/^\d{1,7}$/.test(s)) return { ok: false, reason: "invalid" };
  const value = Number(s);
  return isValidPrice(value) ? { ok: true, value } : { ok: false, reason: "invalid" };
}

/** −/+ tugmasi: chegaradan chiqmaydi, manfiy bo'lmaydi. */
export function stepPrice(current: number, delta: number) {
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, current + delta));
}

type ReadStore = Pick<Storage, "getItem">;
type WriteStore = Pick<Storage, "setItem" | "removeItem">;

/** Saqlangan narxlar: har bir yem alohida tekshiriladi; noto'g'risi o'rniga taxminiy narx. */
export function loadPrices(store: ReadStore | null): Prices {
  const out: Prices = { ...defaultPrices };
  if (!store) return out;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return out;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return out;
    for (const k of FEED_KEYS) {
      const v = (data as Record<string, unknown>)[k];
      if (isValidPrice(v)) out[k] = v;
    }
  } catch {
    // buzilgan JSON yoki xotiraga ruxsat yo'q: taxminiy narxlar
  }
  return out;
}

/** Faqat to'g'ri qiymatlar yoziladi. Xotira ishlamasa false (sahifa ishlashda davom etadi). */
export function savePrices(store: WriteStore | null, prices: Prices): boolean {
  if (!store) return false;
  const clean: Partial<Prices> = {};
  for (const k of FEED_KEYS) if (isValidPrice(prices[k])) clean[k] = prices[k];
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(clean));
    return true;
  } catch {
    return false;
  }
}

/** "Taxminiy narxlarga qaytarish": saqlangan narxlar o'chiriladi. */
export function clearPrices(store: WriteStore | null): boolean {
  if (!store) return false;
  try {
    store.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Brauzer xotirasi; yopiq rejim yoki taqiqlangan bo'lsa null. */
export function browserStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__mf";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}
