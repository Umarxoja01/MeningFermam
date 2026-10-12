import { describe, expect, it } from "vitest";
import { actionIdFor, checkDay, createReducer, doseFor, initialDemoState, isFinished, total, type Action, type DemoState, type Defs } from "@/lib/drug-store";
import { cases } from "@/content/kasallik";
import { drugs, initialStock } from "@/content/ombor";

const defs: Defs = { drugs, cases, initialStock };
const reduce = createReducer(defs);
const run = (s: DemoState, ...actions: Action[]) => actions.reduce(reduce, s);
const start = (caseId: string, weight = 400) => run(initialDemoState(defs), { type: "selectCase", caseId, weight });
const complete = (s: DemoState) => reduce(s, { type: "completeDay", actionId: actionIdFor(s.course!) });
const ml = (s: DemoState, k: string) => total(s.stock[k]!, drugs[k]!);

describe("doza matematikasi (namuna)", () => {
  it("vazn × ml / kg, kamida 1", () => {
    expect(doseFor({ drug: "melo", amount: 2.5, perKg: 100, note: "" }, 400)).toBe(10);
    expect(doseFor({ drug: "antib", amount: 1, perKg: 10, note: "" }, 50)).toBe(5);
    expect(doseFor({ drug: "iver", amount: 1, perKg: 50, note: "" }, 30)).toBe(1);
    expect(doseFor({ drug: "yelin", amount: 1, perKg: 0, note: "" }, 600)).toBe(1);
  });
});

describe("to'liq bajarish", () => {
  it("mastit 400 kg: 1 dona yelin shpritsi va 10 ml meloksikam ayiriladi, kun +1", () => {
    const s = complete(start("sigir-mastit"));
    expect(ml(s, "yelin")).toBe(5);
    expect(ml(s, "melo")).toBe(5);
    expect(s.course!.day).toBe(2);
    expect(s.last).toMatchObject({ kind: "done", finished: false });
  });

  it("ochiq flakondan olinadi: buzoq 150 kg — antibiotik 15 ml, meloksikam 4 ml", () => {
    const s = complete(start("buzoq-yotal", 150));
    expect(s.stock.antib).toEqual({ closed: 2, open: 45 });
    expect(s.stock.melo).toEqual({ closed: 0, open: 11 });
    expect(s.last).toMatchObject({ kind: "done", opened: [] });
  });

  it("ochiq flakon yetmasa yopig'i ochiladi va bu xabarda aytiladi", () => {
    const s = complete(start("buqa-gijja")); // 400 kg: ivermektin 8 ml, vitamin 8 ml; ikkalasida ochiq flakon yo'q
    expect(s.stock.iver).toEqual({ closed: 0, open: 42 });
    expect(s.stock.vit).toEqual({ closed: 2, open: 92 });
    expect(s.last).toMatchObject({ kind: "done", opened: ["iver", "vit"], finished: false });
    expect(s.course!.day).toBe(14);
  });
});

describe("qisman bajarish (Q11, K-01)", () => {
  it("bitta dori yetmasa hech narsa ayirilmaydi va kun o'tmaydi", () => {
    const s0 = start("sigir-isitma", 600); // melo 15 ml kerak, omborda 15 bor; vit 12 ml
    const s1 = complete(s0);
    expect(s1.last?.kind).toBe("done");
    const s2 = complete(s1); // 2-kun: melo 0 qoldi
    expect(s2.last).toEqual({ kind: "blocked" });
    expect(s2.stock).toEqual(s1.stock);
    expect(s2.course!.day).toBe(2);
  });

  it("namuna dorisi qo'shilmaguncha kurs bajarilmaydi", () => {
    const s = complete(start("buzoq-ich", 80));
    expect(s.last).toEqual({ kind: "blocked" });
    expect(s.stock).toEqual(initialStock);
    expect(s.course!.day).toBe(1);
  });

  it("kurs faqat hamma kun to'liq bajarilganda tugaydi", () => {
    let s = start("sigir-mastit", 300); // 3 kun: melo 7.5→8 ml; 15 ml bor → 2-kun bloklanadi
    s = complete(s);
    s = complete(s);
    expect(s.last).toEqual({ kind: "blocked" });
    s = reduce(s, { type: "addVial", drug: "melo" });
    s = complete(s);
    s = complete(s);
    expect(s.course!.day).toBe(4);
    expect(s.last).toMatchObject({ kind: "done", finished: true });
    const after = complete(s);
    expect(after).toBe(s); // tugagan kurs — hech narsa o'zgarmaydi
  });
});

describe("idempotentlik (Q12)", () => {
  it("bir xil amal ikki marta bosilsa bir marta hisobdan chiqadi", () => {
    const s0 = start("sigir-mastit");
    const id = actionIdFor(s0.course!);
    const s1 = reduce(s0, { type: "completeDay", actionId: id });
    const s2 = reduce(s1, { type: "completeDay", actionId: id });
    expect(s2).toBe(s1);
    expect(ml(s2, "yelin")).toBe(5);
  });

  it("qoldiq hech qachon manfiy bo'lmaydi (tasodifiy ketma-ketlik)", () => {
    const ids = Object.keys(cases);
    let seed = 7;
    const rnd = (n: number) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed % n);
    let s = initialDemoState(defs);
    for (let i = 0; i < 3000; i++) {
      const k = rnd(10);
      if (k < 2) s = reduce(s, { type: "selectCase", caseId: ids[rnd(ids.length)]!, weight: [30, 50, 150, 300, 600][rnd(5)]! });
      else if (k < 7 && s.course) s = complete(s);
      else if (k < 8) s = reduce(s, { type: "addVial", drug: Object.keys(drugs)[rnd(5)]! });
      else if (k < 9 && s.course) s = reduce(s, { type: "setWeight", weight: [50, 300, 600][rnd(3)]! });
      else if (rnd(20) === 0) s = reduce(s, { type: "reset" });
      for (const e of Object.values(s.stock)) {
        expect(e.closed).toBeGreaterThanOrEqual(0);
        expect(e.open).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("reset (Q13)", () => {
  it("ombor va davolash kuni boshiga qaytadi", () => {
    let s = complete(start("sigir-mastit"));
    s = reduce(s, { type: "addVial", drug: "vit" });
    s = reduce(s, { type: "reset" });
    expect(s.stock).toEqual(initialStock);
    expect(s.course).toMatchObject({ caseId: "sigir-mastit", day: 1, done: [] });
    // reset'dan keyin 1-kun yana bajarilishi mumkin
    expect(complete(s).course!.day).toBe(2);
  });
});

describe("tekshiruv natijasi", () => {
  it("yetishmayotgan dori ko'rsatiladi", () => {
    const c = checkDay(defs, initialStock, cases["buqa-tuyoq"]!, 400);
    expect(c.map((x) => [x.rx.drug, x.ok, x.have])).toEqual([["antib", true, 260], ["sprey", false, 0]]);
  });
});

describe("audit regressiyasi: namuna ombori va takroriy kunlar", () => {
  it("buzoq ich ketishi: kerakli ikkala namuna birligini qo'shgach bosqich ochiladi", () => {
    let s = start("buzoq-ich", 80);
    s = reduce(s, { type: "addVial", drug: "suvtuz" });
    expect(complete(s).last).toEqual({ kind: "blocked" });
    s = reduce(s, { type: "addVial", drug: "ichak" });
    s = complete(s);
    expect(s.course!.day).toBe(2);
    expect(s.last?.kind).toBe("done");
    expect(ml(s, "suvtuz")).toBe(0);
    expect(ml(s, "ichak")).toBe(0);
  });

  it("buqa oqsoqlanishi: sprey namunasi qo'shilgach hisob ishlaydi", () => {
    let s = start("buqa-tuyoq");
    s = reduce(s, { type: "addVial", drug: "sprey" });
    s = complete(s);
    expect(s.last?.kind).toBe("done");
    expect(s.course!.day).toBe(2);
  });

  it.each([["qoy-qotir", 45, 10], ["buqa-gijja", 400, 14]] as const)("%s: birinchi bosqichdan keyin %i kg, takroriy %i-kun saqlanadi", (caseId, weight, repeatDay) => {
    const before = start(caseId, weight);
    const firstId = actionIdFor(before.course!);
    const first = complete(before);
    expect(first.course!.day).toBe(repeatDay);
    expect(isFinished(defs, first.course!)).toBe(false);
    expect(reduce(first, { type: "completeDay", actionId: firstId })).toBe(first);
    const second = complete(first);
    expect(second.course!.day).toBe(repeatDay + 1);
    expect(isFinished(defs, second.course!)).toBe(true);
    expect(second.course!.done).toHaveLength(2);
    expect(complete(second)).toBe(second);
    const reset = reduce(second, { type: "reset" });
    expect(reset.course).toMatchObject({ day: 1, done: [] });
  });
});
