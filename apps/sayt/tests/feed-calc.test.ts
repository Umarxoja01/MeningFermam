import { describe, expect, it } from "vitest";
import { amountText, animalKeys, animals, calculateFeed, half } from "@/lib/feed-calc";
import { defaultPrices } from "@/lib/prices";
import { money } from "@/lib/format";

describe("yem hisoblagich — TZ v3.1 §4.3 qabul raqamlari (Q05, Q06)", () => {
  it("sigir 400 kg, 10 litr, taxminiy narxlar: 36 400 so'm/kun, 1 092 000 so'm/oy", () => {
    const r = calculateFeed("sigir", 400, 10, defaultPrices);
    expect(r.rows.map((x) => [x.key, x.amount])).toEqual([
      ["beda", "5 kg"], ["silos", "9 kg"], ["somon", "2 yarim kg"], ["arpa", "2 kg"], ["kepak", "1 kg"], ["kunjara", "yarim kg"],
    ]);
    expect(r.perDay).toBe(36400);
    expect(r.perMonth).toBe(1092000);
    expect(r.salt).toBe(2);
  });

  it("beda narxi +100: 36 900 so'm/kun", () => {
    expect(calculateFeed("sigir", 400, 10, { ...defaultPrices, beda: 2600 }).perDay).toBe(36900);
  });

  it("yaxlitlash qoidasi: 100 so'mga, yarmi yuqoriga (36 350 → 36 400; 36 850 → 36 900)", () => {
    // ikkala qabul raqami aynan .5 chegarada; boshqa yaxlitlash usuli natijani o'zgartiradi
    const raw = (p: typeof defaultPrices) => calculateFeed("sigir", 400, 10, p).rows.reduce((s, x) => s + x.kg * p[x.key], 0);
    expect(raw(defaultPrices)).toBe(36350);
    expect(raw({ ...defaultPrices, beda: 2600 })).toBe(36850);
  });

  it("0 narx qabul qilinadi", () => {
    const zero = { beda: 0, silos: 0, somon: 0, arpa: 0, kepak: 0, kunjara: 0 };
    expect(calculateFeed("sigir", 400, 10, zero)).toMatchObject({ perDay: 0, perMonth: 0 });
  });
});

describe("zot olib tashlangan (Q04, Y-02) va prognoz yo'q (Q08, Y-01)", () => {
  it("hisob funksiyasida zot parametri yo'q", () => {
    expect(calculateFeed.length).toBe(4); // hayvon, vazn, holat, narxlar
    for (const a of Object.values(animals)) expect(Object.keys(a)).not.toContain("breeds");
  });

  it("natijada prognoz maydoni yo'q", () => {
    for (const k of animalKeys) {
      const a = animals[k];
      const r = calculateFeed(k, a.defaultWeight, a.defaultGoal, defaultPrices) as Record<string, unknown>;
      expect(Object.keys(r).sort()).toEqual(["perDay", "perMonth", "rows", "salt"]);
    }
  });
});

describe("tanlovlar (Q07)", () => {
  it("TZ v3.1 dagi vazn va holat variantlari", () => {
    expect(animals.sigir.weights).toEqual([300, 400, 500, 600]);
    expect(animals.buqa.weights).toEqual([300, 400, 500, 600]);
    expect(animals.qoy.weights).toEqual([30, 45, 60, 75]);
    expect(animals.sigir.goals.map((g) => g.value)).toEqual([5, 10, 15, 20, 25]);
    expect(animals.buqa.goals.map((g) => g.label)).toEqual(["Kam", "O‘rtacha", "Ko‘p"]);
    expect(animals.qoy.goals.map((g) => g.label)).toEqual(["Oddiy", "Ko‘proq"]);
  });

  it("standart tanlov variantlar ichida", () => {
    for (const a of Object.values(animals)) {
      expect(a.weights).toContain(a.defaultWeight);
      expect(a.goals.map((g) => g.value)).toContain(a.defaultGoal);
    }
  });

  it("barcha kombinatsiyalarda NaN yoki manfiy xarajat yo'q", () => {
    for (const k of animalKeys) for (const w of animals[k].weights) for (const g of animals[k].goals) {
      const r = calculateFeed(k, w, g.value, defaultPrices);
      expect(Number.isFinite(r.perDay) && r.perDay > 0).toBe(true);
      expect(Number.isFinite(r.perMonth) && r.perMonth >= 0).toBe(true);
      expect(r.rows.length).toBeGreaterThan(0);
    }
  });

  it("noto'g'ri narx kelib qolsa ham NaN chiqmaydi (taxminiy narx olinadi)", () => {
    const bad = { ...defaultPrices, beda: Number.NaN, arpa: -5, kepak: Number.POSITIVE_INFINITY };
    expect(calculateFeed("sigir", 400, 10, bad).perDay).toBe(36400);
  });
});

describe("fermer tilida format (§7)", () => {
  it("miqdor va pul", () => {
    expect(half(2.6)).toBe(2.5);
    expect(amountText(0.4)).toBe("yarim kg");
    expect(amountText(2.6)).toBe("2 yarim kg");
    expect(amountText(3.2)).toBe("3 kg");
    expect(money(36400)).toBe("36 400");
    expect(money(1092000)).toBe("1 092 000");
  });
});
