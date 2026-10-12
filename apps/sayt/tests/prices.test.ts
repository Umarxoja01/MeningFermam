import { describe, expect, it } from "vitest";
import { STORAGE_KEY, clearPrices, defaultPrices, isValidPrice, loadPrices, parsePriceInput, savePrices, stepPrice } from "@/lib/prices";

function memoryStore(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    raw: m,
  };
}

const throwing = {
  getItem: () => { throw new Error("SecurityError"); },
  setItem: () => { throw new Error("QuotaExceededError"); },
  removeItem: () => { throw new Error("SecurityError"); },
};

describe("narx qiymati", () => {
  it("0..100 000 butun son to'g'ri", () => {
    for (const v of [0, 1, 2500, 100000]) expect(isValidPrice(v)).toBe(true);
    for (const v of [-1, 100001, 2.5, Number.NaN, Number.POSITIVE_INFINITY, "2500", null, undefined]) expect(isValidPrice(v)).toBe(false);
  });

  it("fermer yozgan matn", () => {
    expect(parsePriceInput("2500")).toEqual({ ok: true, value: 2500 });
    expect(parsePriceInput(" 2 500 ")).toEqual({ ok: true, value: 2500 });
    expect(parsePriceInput("0")).toEqual({ ok: true, value: 0 });
    expect(parsePriceInput("")).toEqual({ ok: false, reason: "empty" });
    expect(parsePriceInput("   ")).toEqual({ ok: false, reason: "empty" });
    for (const s of ["-100", "2,5", "2.5", "abc", "12a", "100001", "Infinity", "NaN", "1e5"]) {
      expect(parsePriceInput(s)).toEqual({ ok: false, reason: "invalid" });
    }
  });

  it("−/+ chegaradan chiqmaydi", () => {
    expect(stepPrice(0, -100)).toBe(0);
    expect(stepPrice(50, -100)).toBe(0);
    expect(stepPrice(2500, 100)).toBe(2600);
    expect(stepPrice(100000, 100)).toBe(100000);
  });
});

describe("brauzer xotirasi (Q06, F-10)", () => {
  it("saqlanadi va qayta yuklanganda tiklanadi, 0 ham", () => {
    const s = memoryStore();
    expect(savePrices(s, { ...defaultPrices, beda: 2600, silos: 0 })).toBe(true);
    expect(loadPrices(s)).toEqual({ ...defaultPrices, beda: 2600, silos: 0 });
  });

  it("buzilgan JSON — taxminiy narxlar", () => {
    expect(loadPrices(memoryStore({ [STORAGE_KEY]: "{buzuq" }))).toEqual(defaultPrices);
    expect(loadPrices(memoryStore({ [STORAGE_KEY]: "[1,2]" }))).toEqual(defaultPrices);
    expect(loadPrices(memoryStore({ [STORAGE_KEY]: "null" }))).toEqual(defaultPrices);
  });

  it("noto'g'ri qiymatlar alohida rad etiladi, to'g'rilari tiklanadi", () => {
    const raw = JSON.stringify({ beda: -5, silos: "900", somon: 1.5, arpa: 1e9, kepak: null, kunjara: 0, boshqa: 7 });
    expect(loadPrices(memoryStore({ [STORAGE_KEY]: raw }))).toEqual({ ...defaultPrices, kunjara: 0 });
  });

  it("xotira ishlamasa sahifa buzilmaydi", () => {
    expect(loadPrices(throwing)).toEqual(defaultPrices);
    expect(savePrices(throwing, defaultPrices)).toBe(false);
    expect(clearPrices(throwing)).toBe(false);
    expect(loadPrices(null)).toEqual(defaultPrices);
    expect(savePrices(null, defaultPrices)).toBe(false);
  });

  it("reset saqlangan narxlarni o'chiradi", () => {
    const s = memoryStore();
    savePrices(s, { ...defaultPrices, beda: 3000 });
    expect(clearPrices(s)).toBe(true);
    expect(s.raw.has(STORAGE_KEY)).toBe(false);
    expect(loadPrices(s)).toEqual(defaultPrices);
  });

  it("faqat narxlar saqlanadi", () => {
    const s = memoryStore();
    savePrices(s, { ...defaultPrices, beda: Number.NaN });
    expect(Object.keys(JSON.parse(s.raw.get(STORAGE_KEY)!)).sort()).toEqual(["arpa", "kepak", "kunjara", "silos", "somon"]);
  });
});
