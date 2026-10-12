import { describe, expect, it } from "vitest";
import { contactsSchema, featuresSchema, findContentIssues, innerPageSchema, problemsSchema, symptomSchema } from "../src";

const contacts = {
  hours: "Har kuni 8:00–21:00",
  phone: "+998996180300",
  telegram: "MeningFermamUzb",
  instagram: "meningfermam",
  email: null,
  address: null,
  vets: [{ title: "Veterinar", name: null, phone: "+998994446544", telegram: "Sardorxoja_Vet" }],
};

describe("aloqa sxemasi", () => {
  it("to'g'ri qiymat o'tadi", () => expect(contactsSchema.safeParse(contacts).success).toBe(true));
  it("soxta yoki noto'g'ri telefon rad etiladi", () => {
    for (const phone of ["+998 __ ___ __ __", "998996180300", "+99899618030", "+998996180300x"]) {
      expect(contactsSchema.safeParse({ ...contacts, phone }).success).toBe(false);
    }
  });
  it("noto'g'ri email va bo'sh veterinar ro'yxati rad etiladi", () => {
    expect(contactsSchema.safeParse({ ...contacts, email: "info@" }).success).toBe(false);
    expect(contactsSchema.safeParse({ ...contacts, vets: [] }).success).toBe(false);
    expect(contactsSchema.safeParse({ ...contacts, email: "info@meningfermam.uz" }).success).toBe(true);
  });
  it("bo'sh joyli matn bo'sh deb hisoblanadi", () => {
    expect(contactsSchema.safeParse({ ...contacts, hours: "   " }).success).toBe(false);
  });
});

describe("funksiyalar holati", () => {
  const f = (id: string, kind: "on" | "pr" | "soon") => ({ id, kind, emoji: "⏰", title: "X" });
  it("har tabda kamida bitta, id takrorlanmaydi", () => {
    expect(featuresSchema.safeParse([f("a1", "on"), f("b1", "pr"), f("c1", "soon")]).success).toBe(true);
    expect(featuresSchema.safeParse([f("a1", "on"), f("b1", "pr")]).success).toBe(false);
    expect(featuresSchema.safeParse([f("a1", "on"), f("a1", "pr"), f("c1", "soon")]).success).toBe(false);
  });
});

describe("muammo kartochkalari", () => {
  const p = { emoji: "🥛", topic: "Sigir", question: "Savol", href: "#yem" };
  it("aynan 9 ta", () => {
    expect(problemsSchema.safeParse(Array(9).fill(p)).success).toBe(true);
    expect(problemsSchema.safeParse(Array(8).fill(p)).success).toBe(false);
  });
  it("tashqi havola emas, faqat bo'lim (#...)", () => {
    expect(problemsSchema.safeParse([...Array(8).fill(p), { ...p, href: "https://x.uz" }]).success).toBe(false);
  });
});

describe("ichki sahifa", () => {
  it("noma'lum blok va noto'g'ri tugma manzili rad etiladi", () => {
    const base = { h1: "Sarlavha", intro: "Kirish matni", blocks: [{ type: "p", text: "Matn" }], cta: { label: "Aloqa", href: "/aloqa" } };
    expect(innerPageSchema.safeParse(base).success).toBe(true);
    expect(innerPageSchema.safeParse({ ...base, blocks: [{ type: "html", text: "<b>x</b>" }] }).success).toBe(false);
    expect(innerPageSchema.safeParse({ ...base, cta: { label: "X", href: "javascript:alert(1)" } }).success).toBe(false);
  });
});

describe("klinik namuna", () => {
  const s = { id: "sigir-dam", sign: "Qorni shishib ketdi", name: "Qorin dam", easy: "Izoh", urgent: true, plan: [["Darhol", "Veterinar"]], drugs: [], rx: [], days: 0 };
  it("shoshilinch alomatda davolash namunasi bo'lmaydi", () => {
    expect(symptomSchema.safeParse(s).success).toBe(true);
    expect(symptomSchema.safeParse({ ...s, rx: [{ drug: "melo", amount: 2.5, perKg: 100, note: "x" }], days: 1 }).success).toBe(false);
  });
  it("takroriy kunlar o'sish tartibida va kursning oxirgi kuniga mos bo'lishi kerak", () => {
    const course = { ...s, urgent: false, rx: [{ drug: "iver", amount: 1, perKg: 50, note: "namuna" }], days: 10, treatmentDays: [1, 10] };
    expect(symptomSchema.safeParse(course).success).toBe(true);
    for (const treatmentDays of [[], [1, 1, 10], [10, 1], [1, 9], [1, 11]]) {
      expect(symptomSchema.safeParse({ ...course, treatmentDays }).success).toBe(false);
    }
    expect(symptomSchema.safeParse({ ...s, treatmentDays: [1] }).success).toBe(false);
  });
});

describe("kontent qoidalari", () => {
  it("taqiqlangan iboralarni topadi", () => {
    expect(findContentIssues({ a: "Xizmat bepul" }).map((i) => i.rule)).toEqual(["narx"]);
    expect(findContentIssues(["+998 __ ___ __ __"]).map((i) => i.rule)).toEqual(["soxta-kontakt"]);
    expect(findContentIssues("≈ +81 kg 3 oyda").map((i) => i.rule)).toEqual(["prognoz"]);
    expect(findContentIssues("ularda dori borligi")).toEqual([]);
    expect(findContentIssues(contacts)).toEqual([]);
  });
});
