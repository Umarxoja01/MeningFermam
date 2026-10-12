import { describe, expect, it } from "vitest";
import { evaluateFormula, FormulaError } from "../src/calculator";

describe("xavfsiz hisoblash formulasi", () => {
  it("ustuvorlik, qavs, kasr va unary ishoralar bilan hisoblaydi", () => {
    expect(evaluateFormula("2 + 3 * 4", {})).toBe(14);
    expect(evaluateFormula("(2 + 3) * 4", {})).toBe(20);
    expect(evaluateFormula("-.5 + +3.25", {})).toBe(2.75);
    expect(evaluateFormula("sut * narx - (yem + boshqa)", { sut: 20, narx: 4000, yem: 25000, boshqa: 5000 })).toBe(50000);
    expect(evaluateFormula("10 / 2 / 5", {})).toBe(1);
    expect(evaluateFormula("10 - 3 - 2", {})).toBe(5);
  });

  it.each(["", " ", "()", "1+", "1 2", "2(3)", "(1+2", "1+2)", "1**2", "1//2", "1..2"])("buzilgan sintaksis rad etiladi: %j", (formula) => {
    expect(() => evaluateFormula(formula, {})).toThrow(FormulaError);
  });

  it.each(["process.exit()", "globalThis.alert(1)", "x.constructor", "x['a']", "x=1", "1;2", "Math.max(x,2)", "1e10", "`${x}`", "(()=>1)()"])("kod yoki tashqi murojaat bajarilmaydi: %j", (formula) => {
    expect(() => evaluateFormula(formula, { x: 3 })).toThrow(FormulaError);
  });

  it("noma’lum, meros olingan va xavfli maydonlar rad etiladi", () => {
    expect(() => evaluateFormula("b", { a: 1 })).toThrow(/topilmadi/);
    expect(() => evaluateFormula("inherited", Object.create({ inherited: 1 }) as Record<string, number>)).toThrow(/topilmadi/);
    expect(() => evaluateFormula("constructor", { constructor: 1 })).toThrow(/topilmadi/);
    expect(() => evaluateFormula("__proto__", Object.create(null) as Record<string, number>)).toThrow(/topilmadi/);
  });

  it("nolga bo‘lish hamda cheksiz oraliq natija rad etiladi", () => {
    expect(() => evaluateFormula("1 / (x-x)", { x: 3 })).toThrow(/Nolga/);
    expect(() => evaluateFormula("1 / x", { x: -0 })).toThrow(/Nolga/);
    expect(() => evaluateFormula("x * x / x", { x: Number.MAX_VALUE })).toThrow(/juda katta/);
    expect(() => evaluateFormula("x", { x: Number.NaN })).toThrow(FormulaError);
    expect(() => evaluateFormula("x", { x: Number.POSITIVE_INFINITY })).toThrow(FormulaError);
    expect(() => evaluateFormula("x", { x: "2" } as unknown as Record<string, number>)).toThrow(FormulaError);
  });

  it("belgi va token chegaralari rekursiyani ham cheklaydi", () => {
    expect(() => evaluateFormula(" ".repeat(200) + "1", {})).toThrow(/200/);
    expect(() => evaluateFormula("1+".repeat(50) + "1", {})).toThrow(/murakkab/);
    expect(() => evaluateFormula("-".repeat(100) + "1", {})).toThrow(/murakkab/);
    expect(evaluateFormula("(".repeat(49) + "1" + ")".repeat(49), {})).toBe(1);
  });
});
