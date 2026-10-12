// Kontent qoidalari (TZ v3.1 §4, §7): soxta kontakt, xizmat narxi da'vosi, prognoz va h.k. Sayt testlari shu qoidalarni ishlatadi.

export type ContentRule = { id: string; why: string; re: RegExp };

export const contentRules: readonly ContentRule[] = [
  { id: "narx", why: "Xizmat narxi da'vosi (bepul/pullik) tasdiqlanmagan", re: /\b(bepul|pullik)\b/i },
  { id: "kafolat", why: "“100% ishlaydi” kabi kafolat", re: /100\s?% ishlaydi/i },
  { id: "eslatma", why: "Eslatma albatta keladi degan va'da (T-02)", re: /qolib ketmaydi|ertaga eslatma keladi/i },
  { id: "prognoz", why: "Sut/vazn oshishi prognozi (Y-01)", re: /\+\s?\d+\s?kg|sut \+\s?\d|vazni saqlanadi|ko‘payadi/i },
  { id: "soxta-kontakt", why: "Soxta kontakt shabloni (F-07)", re: /\+998 _|_{3,}|info@meningfermam\.uz|@meningfermam_bot/i },
  { id: "vetapteka", why: "Uydirma vetapteka ma'lumoti (K-03)", re: /\d+,\d km|hozir ochiq|dori bor\b/i },
  { id: "muddat", why: "Tasdiqlanmagan yaroqlilik muddati (§4.5)", re: /kun ichida ishlating/i },
  { id: "demo-yorliq", why: "Demo yorlig'i", re: /Video joyi/ },
];

export type ContentIssue = { rule: string; why: string; match: string };

/** Istalgan kontent qiymatidagi barcha matnlarni qoidalar bilan tekshiradi. Funksiyalar namunaviy argument bilan chaqiriladi. */
export function findContentIssues(value: unknown): ContentIssue[] {
  const text = JSON.stringify(value, (_k, v) => (typeof v === "function" ? v("X", "Y") : v)) ?? "";
  const out: ContentIssue[] = [];
  for (const r of contentRules) {
    const m = r.re.exec(text);
    if (m) out.push({ rule: r.id, why: r.why, match: m[0] });
  }
  return out;
}
