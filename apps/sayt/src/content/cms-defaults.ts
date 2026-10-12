import { cmsWebsiteSchema } from "@meningfermam/content";
import { eslatma, hero, loopText, nav, site, start, statistika, yakun, yem } from "./bosh";
import { holatHead, statusLabels, statusTabLabels } from "./holat";
import { kasalText } from "./kasallik";
import { problems, problemsHead } from "./muammolar";
import { omborText } from "./ombor";
import { animalCard, compareHead, compareRows, farmStats, notFoundText, pages, soonExtra, urgentVetText } from "./sahifalar";
import { seo } from "./seo";

const labels: Record<string, string> = {};
function addLabels(scope: string, values: object) {
  for (const [key, value] of Object.entries(values)) if (typeof value === "string") labels[`${scope}.${key}`] = value;
}
addLabels("holatHead", holatHead);
addLabels("statusLabels", statusLabels);
addLabels("statusTabLabels", statusTabLabels);
addLabels("kasalText", kasalText);
addLabels("omborText", omborText);
addLabels("problemsHead", problemsHead);

/** Nashr yo'q bo'lsa oldingi sayt ko'rinishi saqlanadi; dastlab shu nusxa admin uchun import qilinadi. */
export const defaultWebsite = cmsWebsiteSchema.parse({
  home: { site, start, problems, nav, hero, yem, eslatma, statistika, yakun, loopText },
  design: { primary: "#357a4e", primaryDark: "#2f6e46", background: "#ffffff", surface: "#ffffff", text: "#1f2b23", font: "system", fontSize: 17, radius: 22, maxWidth: 1160, sectionSpacing: 44, heroHeight: 640, logoUrl: "/brand/logo.webp", heroImageUrl: "", heroVideoUrl: "" },
  layout: [
    { id: "hero", type: "hero", enabled: true }, { id: "muammo", type: "problems", enabled: true },
    { id: "yem", type: "feed", enabled: true }, { id: "kasal", type: "sick", enabled: true }, { id: "ombor", type: "store", enabled: true },
    { id: "eslatma", type: "reminder", enabled: true }, { id: "statistika", type: "stats", enabled: true },
    { id: "holat", type: "features", enabled: true }, { id: "oxiri", type: "final", enabled: true },
  ],
  pages, seo, labels,
  widgets: { farmStats, animalCard, compareHead, compareRows, soonExtra, urgentVetText, notFoundText },
  tools: [],
});
