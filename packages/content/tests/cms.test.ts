import { describe, expect, it } from "vitest";
import { cmsWebsiteSchema, cmsToolSchema } from "../src";
import { defaultWebsite } from "../../../apps/sayt/src/content/cms-defaults";

const tool = { id: "xarajat", title: "Hisob", description: "", inputs: [{ key: "son", label: "Son", min: 0, max: 100, step: 1, defaultValue: 2, unit: "" }], formula: "son * 10", resultLabel: "Natija", resultUnit: "so‘m" };
describe("sayt CMS chegaralari", () => {
  it("boshlang'ich sayt va yangi hisoblagich o'tadi", () => {
    expect(cmsWebsiteSchema.safeParse(defaultWebsite).success).toBe(true);
    expect(cmsToolSchema.safeParse(tool).success).toBe(true);
  });
  it("noma'lum maydon, kod va buzilgan formula saqlanmaydi", () => {
    for (const formula of ["yoq * 2", "son +", "son / (son-son)", "alert(1)", "constructor"]) expect(cmsToolSchema.safeParse({ ...tool, formula }).success).toBe(false);
  });
  it("bosh sahifa SEO va ko'rinadigan bo'lim kerak", () => {
    const missingSeo = structuredClone(defaultWebsite); delete missingSeo.seo["/"];
    expect(cmsWebsiteSchema.safeParse(missingSeo).success).toBe(false);
    expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, layout: defaultWebsite.layout.map((s) => ({ ...s, enabled: false })) }).success).toBe(false);
  });
  it("takroriy bo'lim va yo'q hisoblagichga havola rad etiladi", () => {
    expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, layout: [...defaultWebsite.layout, defaultWebsite.layout[0]] }).success).toBe(false);
    expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, layout: [...defaultWebsite.layout, { id: "yangi-hisob", type: "calculator", enabled: true, toolId: "yoq" }] }).success).toBe(false);
  });
  it("CSS/kod manzili va tizim sahifalarini qo'shish rad etiladi", () => {
    expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, design: { ...defaultWebsite.design, primary: "red;display:none" } }).success).toBe(false);
    for (const logoUrl of ["javascript:alert(1)", "//x.uz/a.png"]) expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, design: { ...defaultWebsite.design, logoUrl } }).success).toBe(false);
    expect(cmsWebsiteSchema.safeParse({ ...defaultWebsite, pages: { ...defaultWebsite.pages, "/admin": defaultWebsite.pages["/aloqa"] } }).success).toBe(false);
  });
});
