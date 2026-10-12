import { describe, expect, it } from "vitest";
import * as aloqa from "@/content/aloqa";
import * as bosh from "@/content/bosh";
import * as holat from "@/content/holat";
import * as kasallik from "@/content/kasallik";
import * as muammolar from "@/content/muammolar";
import * as ombor from "@/content/ombor";
import * as sahifalar from "@/content/sahifalar";
import * as savollar from "@/content/savollar";
import * as seo from "@/content/seo";
import { defaultPrices } from "@/lib/prices";
import {
  contactsSchema, drugDefSchema, faqGroupsSchema, featuresSchema, findContentIssues, heroSchema, innerPageSchema, pricesSchema, problemsSchema, seoSchema, sickAnimalSchema,
} from "@meningfermam/content";

// Kontent qoidalari (TZ v3.1 §4, §7, §11.1). Butun kontent matn sifatida tekshiriladi.
const all = JSON.stringify([aloqa, bosh, holat, kasallik, muammolar, ombor, sahifalar, savollar, seo], (_k, v) => (typeof v === "function" ? v("X", "Y") : v));

describe("taqiqlangan da'volar va soxta ma'lumot yo'q (umumiy qoidalar: packages/content)", () => {
  it("butun kontent qoidalardan o'tadi", () => expect(findContentIssues(JSON.parse(all))).toEqual([]));
});

describe("kontent umumiy sxemalarga mos (admin panel shu sxemalar bilan saqlaydi)", () => {
  it("aloqa", () => expect(contactsSchema.parse(aloqa.contacts)).toBeTruthy());
  it("funksiyalar holati", () => expect(featuresSchema.parse(holat.features)).toBeTruthy());
  it("savol-javob", () => expect(faqGroupsSchema.parse(savollar.faqGroups)).toBeTruthy());
  it("muammo kartochkalari", () => expect(problemsSchema.parse(muammolar.problems)).toBeTruthy());
  it("hero", () => expect(heroSchema.parse(bosh.hero)).toBeTruthy());
  it("ichki sahifalar", () => { for (const p of Object.values(sahifalar.pages)) innerPageSchema.parse(p); });
  it("SEO", () => expect(seoSchema.parse(seo.seo)).toBeTruthy());
  it("yem narxlari", () => expect(pricesSchema.parse(defaultPrices)).toEqual(defaultPrices));
  it("klinik namunalar", () => {
    for (const a of Object.values(kasallik.sickAnimals)) sickAnimalSchema.parse(a);
    for (const d of Object.values(ombor.drugs)) drugDefSchema.parse(d);
  });
});

describe("aloqa (Q18)", () => {
  it("telefonlar +998XXXXXXXXX, yo'q qiymat null (shablon emas)", () => {
    const c = aloqa.contacts;
    for (const p of [c.phone, ...c.vets.map((v) => v.phone)]) expect(p).toMatch(/^\+998\d{9}$/);
    for (const h of [c.telegram, c.instagram, ...c.vets.map((v) => v.telegram)]) if (h) expect(h).toMatch(/^[A-Za-z0-9_]{5,32}$/);
    expect(c.email === null || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(c.email)).toBe(true);
    expect(c.vets.length).toBeGreaterThan(0);
  });
});

describe("bosh sahifa (§4)", () => {
  it("H1 aynan va yagona CTA → #yem (Q03)", () => {
    expect(`${bosh.hero.h1} ${bosh.hero.h1em}`).toBe("Hayvoningiz gapira olmaydi. Uning o‘rniga biz aytamiz.");
    expect(bosh.hero.cta.href).toBe("#yem");
  });
  it("9 kartochka, 8-chi “Vazn” → #yem, “Zot” yo'q (Q01)", () => {
    expect(muammolar.problems).toHaveLength(9);
    expect(muammolar.problems[7]).toMatchObject({ topic: "Vazn", question: "Molimning vazniga qarab qancha yem kerak?", href: "#yem" });
    expect(muammolar.problems.some((p) => p.topic === "Zot")).toBe(false);
  });
  it("TZ dagi sarlavhalar", () => {
    expect(bosh.yem.title).toBe("Yem qancha ketyapti va necha pulga tushyapti");
    expect(bosh.eslatma.title).toBe("Dori eslatmasi qanday ishlaydi?");
    expect(bosh.yakun.title).toBe("Namunalarni ko‘rdingiz. Savolingiz bormi?");
    expect(kasallik.kasalText.title).toBe("Bosing. Namuna ko‘rinishini va veterinar bilan bog‘lanishni ko‘ring.");
  });
});

describe("funksiyalar holati — yagona manba (F-09)", () => {
  it("3 tab, har birida kamida bitta funksiya; /daftardan-farqi holatlari shu manbadan", () => {
    for (const k of holat.statusOrder) expect(holat.featuresByKind(k).length).toBeGreaterThan(0);
    for (const r of sahifalar.compareRows) expect(holat.featureById(r.feature)).toBeDefined();
    expect(holat.features.some((f) => /Sut daftari/.test(f.title))).toBe(false); // egasi qarori
  });
});

describe("Molim kasal namunasi (Q09, Q10)", () => {
  it("shoshilinch alomatda mustaqil davolash namunasi yo'q", () => {
    for (const a of Object.values(kasallik.sickAnimals)) for (const s of a.symptoms) if (s.urgent) expect(s.rx).toHaveLength(0);
  });
  it("har bir sxemadagi dori namuna omboriga qo'shilishi mumkin; kurs kamida 1 kun", () => {
    for (const c of Object.values(kasallik.cases)) {
      expect(c.days).toBeGreaterThanOrEqual(1);
      for (const r of c.rx) {
        expect(r.drug in ombor.drugs).toBe(true);
        expect(r.drug in ombor.initialStock).toBe(true);
      }
    }
  });
  it("vetapteka “Tez kunda”", () => expect(kasallik.kasalText.pharmacy).toMatch(/^Tez kunda/));
});

describe("sahifalar va SEO (Q19, Q22)", () => {
  it("11 ommaviy URL", () => {
    expect(seo.pagePaths).toEqual(["/", "/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/daftardan-farqi", "/tez-orada", "/savollar", "/aloqa", "/maxfiylik", "/shartlar"]);
    expect(Object.keys(sahifalar.pages).sort()).toEqual(seo.pagePaths.filter((p) => p !== "/").sort());
  });
  it("TZ §5 dagi ikki meta tavsif aynan", () => {
    expect(seo.seo["/yem-rejasi"].description).toBe("Kunlik yem, aralashma va xarajat haqida namuna hisob.");
    expect(seo.seo["/savollar"].description).toBe("Yem rejasi, davolash va xavfsizlik savollariga javoblar.");
  });
  it("har sahifada H1 va yakuniy tugma bor; title takrorlanmaydi", () => {
    for (const p of Object.values(sahifalar.pages)) { expect(p.h1.length).toBeGreaterThan(5); expect(p.cta.label.length).toBeGreaterThan(2); }
    const titles = Object.values(seo.seo).map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
