"use client";

import Link from "next/link";
import { useState } from "react";
import { evaluateFormula, type CmsTool, type CmsWebsite, type InnerPage } from "@meningfermam/content";
import { BlocksEditor } from "./blocks-editor";
import { Checkbox, Field, ListControls, reordered, sectionId, Select } from "./editor-controls";
import { DraftForm } from "./editors";

const homeTitles: Record<string, string> = {
  site: "Sayt nomi va umumiy yozuvlar", start: "Ilova haqida oynasi", problems: "Muammolar kartochkalari", nav: "Menyu va pastki havolalar", hero: "Birinchi ekran", yem: "Yem hisobi",
  eslatma: "Eslatma namunasi", statistika: "Sut va nasab", yakun: "Yakuniy taklif", loopText: "Animatsiya tugmalari",
};
const fieldTitles: Record<string, string> = {
  name: "Nomi", title: "Sarlavha", text: "Matn", label: "Yozuv", href: "Havola", id: "Kod", key: "Kod", icon: "Belgi", emoji: "Belgi", sub: "Qo‘shimcha matn",
  h1: "Asosiy sarlavha", h1em: "Ajratilgan sarlavha", seal: "Yuqori belgi", tagline: "Qisqa ta’rif", legal: "Huquqiy izoh", close: "Yopish tugmasi",
  cta: "Asosiy tugma", floats: "Qisqa kartochkalar", trust: "Ishonch kartochkasi", tags: "Belgilar", links: "Asosiy menyu", tabbar: "Mobil menyu",
  footerSections: "Pastdagi bo‘limlar", footerGuides: "Pastdagi qo‘llanmalar", vet: "Veterinar uslubida ajratish", sos: "Shoshilinch uslubida ajratish",
  ask: "Savol ko‘rinishidagi belgi", animal: "Hayvon yozuvi", weight: "Vazn yozuvi", perDay: "Kunlik natija yozuvi", perMonth: "Oylik natija yozuvi",
  salt: "Tuz yozuvi", saltUnit: "Tuz birligi", pricesSummary: "Narxlar oynasi yozuvi", pricesHint: "Narxlar yordami", pricesReset: "Narxlarni tiklash tugmasi",
  priceUnit: "Narx birligi", priceError: "Narx xatosi", priceNotSaved: "Saqlash xabari", fine: "Hisob ostidagi izoh", time: "Vaqt", date: "Sana",
  app: "Ilova yozuvi", noti: "Bildirishnoma sarlavhasi", notiText: "Bildirishnoma matni", later: "Keyinroq tugmasi", laterDone: "Keyinroq bosilganda",
  gave: "Berildi tugmasi", gaveDone: "Bajarilgan tugma", doneMsg: "Bajarilgan xabari", replay: "Qayta ko‘rsatish tugmasi", chip: "Yuqori belgi",
  milkTitle: "Sut sarlavhasi", milk: "Sut qatorlari", milkNote: "Sut izohi", pedigreeTitle: "Nasab sarlavhasi", grand: "Bobo va buvilar", parents: "Ota va ona",
  self: "Hayvonning o‘zi", no: "Ogohlantirish", yes: "Tavsiya yozuvi", pause: "To‘xtatish", play: "Davom ettirish", w: "Ustun kengligi (%)", v: "Qiymat",
  low: "Kamaygan natija", stats: "Ko‘rsatkichlar", rows: "Qatorlar", history: "Tarix", head: "Sarlavha", body: "Matn", note: "Izoh", value: "Qiymat",
  total: "Jami", subtitle: "Qo‘shimcha sarlavha", badge: "Belgi", description: "Tavsif", phone: "Telefon", telegram: "Telegram", empty: "Bo‘sh holat xabari", topic: "Mavzu", question: "Savol", items: "Bandlar", job: "Ish", paper: "Daftardagi holat", status: "Holat", feature: "Funksiya kodi",
  on: "Namuna holati", pr: "Jarayondagi holat", soon: "Rejadagi holat", who: "Hayvon tanlash savoli", what: "Alomat tanlash savoli", probable: "Ehtimoliy holat yozuvi",
  callVet: "Veterinarni chaqirish tugmasi", urgent: "Shoshilinch xabar", plan: "Sxema yozuvi", drugs: "Dorilar yozuvi", certified: "Namuna belgisi", treat: "Davolash hisobi yozuvi",
  vetOnly: "Veterinar zarurligi haqidagi xabar", done: "Bosqichni bajarish tugmasi", finished: "Bosqichlar tugagan xabar", needDrug: "Dori zarurligi xabari", notInStock: "Dori yo‘qligi xabari",
  blocked: "Dori yetmagandagi xabar", recorded: "Bajarilgan bosqich xabari", newVial: "Flakon ochilgan xabar", toStore: "Omborga o‘tish tugmasi", pharmacyTitle: "Vetapteka sarlavhasi",
  pharmacy: "Vetapteka tavsifi", repeatHint: "Takroriy kun izohi", sampleUnitHint: "Namuna birligi izohi", reset: "Boshidan ko‘rsatish tugmasi", lowTag: "Kam qoldiq belgisi", sampleUnit: "Namuna birligi izohi",
};

const scopeTitles: Record<string, string> = { problemsHead: "Muammolar bo‘limi", holatHead: "Funksiyalar bo‘limi", statusLabels: "Holat belgilari", statusTabLabels: "Holat tablari", kasalText: "Molim kasal namunasi", omborText: "Dori ombori" };

function LabelFields({ labels, onChange }: { labels: CmsWebsite["labels"]; onChange: (labels: CmsWebsite["labels"]) => void }) {
  const scopes = [...new Set(Object.keys(labels).map((key) => key.split(".")[0]!))];
  return <>{scopes.map((scope) => <details className="card editor-accordion" key={scope}><summary>{scopeTitles[scope] ?? labelForKey(scope)}</summary><div className="accordion-body">
    {Object.entries(labels).filter(([key]) => key.startsWith(`${scope}.`)).map(([key, value]) => <Field key={key} label={fieldTitles[key.slice(scope.length + 1)] ?? labelForKey(key.slice(scope.length + 1))} value={value} onChange={(text) => onChange({ ...labels, [key]: text })} multiline={multilineField(key)} maxLength={2000} />)}
  </div></details>)}</>;
}

function listSettings(path: string): { template: unknown; max: number; min?: number } | undefined {
  const templates: Record<string, { template: unknown; max: number; min?: number }> = {
    problems: { template: { emoji: "🌾", topic: "Yangi mavzu", question: "Savolni yozing", href: "#yem" }, max: 30, min: 1 },
    "nav.links": { template: { href: "/aloqa", label: "Aloqa", vet: false }, max: 12 },
    "nav.tabbar": { template: { id: "yangi-menyu", href: "/aloqa", icon: "📞", label: "Aloqa", sos: false }, max: 6 },
    "nav.footerSections": { template: { href: "/aloqa", label: "Aloqa" }, max: 20 },
    "nav.footerGuides": { template: { href: "/aloqa", label: "Aloqa" }, max: 30 },
    "hero.floats": { template: { icon: "🌾", title: "Yangi kartochka", text: "Qisqa izoh" }, max: 3 },
    "hero.trust.tags": { template: "Yangi belgi", max: 4 },
    "statistika.milk": { template: { id: "№ 0000", w: 50, v: "0 L", low: false }, max: 30 },
    "statistika.grand": { template: ["№ 0000", "bobosi"], max: 8 },
    "statistika.parents": { template: ["№ 0000", "otasi"], max: 4 },
    "farmStats.items": { template: { label: "Yangi ko‘rsatkich", value: "0" }, max: 30 },
    "animalCard.rows": { template: { label: "Yangi qator", value: "Qiymat" }, max: 30 },
    compareRows: { template: { job: "Yangi ish", paper: "Daftarda", app: "Saytda", feature: "" }, max: 40 },
  };
  return templates[path];
}

function fieldLimit(path: string): number {
  if (/(?:href|Url|src)$/.test(path)) return 500;
  if (/(?:icon|emoji)$/.test(path)) return 8;
  if (/^problems\.\d+\.topic$/.test(path)) return 30;
  if (/^problems\.\d+\.question$/.test(path)) return 90;
  const limits: Record<string, number> = { "hero.seal": 120, "hero.h1": 80, "hero.h1em": 80, "hero.sub": 240, "hero.cta.label": 40, "hero.trust.title": 200, "hero.trust.text": 240 };
  if (limits[path]) return limits[path]!;
  if (/^hero\.floats\.\d+\.title$/.test(path)) return 40;
  if (/^hero\.floats\.\d+\.text$/.test(path)) return 60;
  if (/^hero\.trust\.tags\.\d+$/.test(path)) return 40;
  if (/^nav\.(?:footerSections|footerGuides)\.\d+\.label$/.test(path)) return 60;
  if (/^nav\.tabbar\.\d+\.(?:id|label)$/.test(path) || /^statistika\.(?:milk\.\d+\.(?:id|v)|grand\.\d+\.\d+|parents\.\d+\.\d+|self)$/.test(path)) return 40;
  if (/^nav\.links\.\d+\.label$/.test(path)) return 80;
  return 2000;
}

function multilineField(path: string): boolean {
  return /(?:^|\.)(?:text|sub|tagline|legal|fine|intro|description|notiText|doneMsg|laterDone|priceError|priceNotSaved|probable|urgent|vetOnly|blocked|recorded|newVial|pharmacy|repeatHint|sampleUnitHint|sampleUnit|urgentVetText)$/.test(path);
}

/** Tuzilgan qiymatlar matn/raqam/belgi boshqaruvlariga ajratiladi, JSON yozish talab qilinmaydi. */
function ValueFields({ value, onChange, label, path = "" }: { value: unknown; onChange: (value: unknown) => void; label: string; path?: string }) {
  if (typeof value === "string") {
    const link = /(?:href|Url|src)$/.test(path);
    return <Field label={label} value={value} onChange={onChange} maxLength={fieldLimit(path)} multiline={!link && multilineField(path)} help={link ? "Sayt bo‘limi uchun #yem, sahifa uchun /aloqa yoki https:// manzil kiriting." : undefined} />;
  }
  if (typeof value === "number") return <Field label={label} type="number" value={value} onChange={(v) => onChange(Number(v))} />;
  if (typeof value === "boolean") return <Checkbox label={label} checked={value} onChange={onChange} />;
  if (Array.isArray(value)) {
    const tuple = /^statistika\.(?:grand|parents)\.\d+$/.test(path);
    const settings = listSettings(path);
    const canAdd = !!settings || value.length > 0;
    return <fieldset className="item"><legend>{label}</legend>
    {value.length === 0 && <p className="editor-empty">Ro‘yxat bo‘sh.</p>}
    {value.map((entry, i) => <div className="section-item" key={i}>
      <ValueFields label={tuple ? i === 0 ? "Hayvon raqami" : "Qarindoshligi" : `${i + 1}-band`} path={`${path}.${i}`} value={entry} onChange={(next) => onChange(value.map((x, j) => i === j ? next : x))} />
      {!tuple && <ListControls index={i} length={value.length} label={`${label}, ${i + 1}-band`} onMove={(a, b) => onChange(reordered(value, a, b))} removable={value.length > (settings?.min ?? 0)} onRemove={() => onChange(value.filter((_, j) => i !== j))} />}
    </div>)}
    {!tuple && <button type="button" className="btn ghost small" disabled={!canAdd || value.length >= (settings?.max ?? 60)} onClick={() => {
      const next = structuredClone(settings?.template ?? value.at(-1));
      if (path === "nav.tabbar") (next as { id: string }).id = sectionId("menyu");
      onChange([...value, next]);
    }}>+ Band qo‘shish</button>}
  </fieldset>;
  }
  if (value && typeof value === "object") {
    const optional = /^nav\.links\.\d+$/.test(path) ? "vet" : /^nav\.tabbar\.\d+$/.test(path) ? "sos" : /^statistika\.milk\.\d+$/.test(path) ? "low" : undefined;
    return <div className="editor-panel">
    {Object.entries(value).map(([key, entry]) => <ValueFields key={key} label={fieldTitles[key] ?? labelForKey(key)} path={path ? `${path}.${key}` : key} value={entry} onChange={(next) => onChange({ ...value, [key]: next })} />)}
    {optional && !(optional in value) && <Checkbox label={fieldTitles[optional]!} checked={false} onChange={(enabled) => onChange({ ...value, [optional]: enabled })} />}
  </div>;
  }
  return null;
}

function labelForKey(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_.]/g, " ").replace(/^./, (c) => c.toUpperCase());
}

const tabs = [
  { id: "design", title: "Dizayn" }, { id: "home", title: "Bosh sahifa" }, { id: "layout", title: "Bo‘limlar" },
  { id: "pages", title: "Sahifalar" }, { id: "tools", title: "Hisoblagichlar" }, { id: "labels", title: "Boshqa yozuvlar" }, { id: "seo", title: "SEO" },
] as const;
type Tab = (typeof tabs)[number]["id"];

const sectionTitles: Record<CmsWebsite["layout"][number]["type"], string> = {
  hero: "Birinchi ekran", problems: "Muammolar kartochkalari", feed: "Yem hisoblagichi", sick: "Molim kasal", store: "Dori ombori",
  reminder: "Dori eslatmasi", stats: "Sut va nasab", features: "Funksiyalar holati", final: "Yakuniy taklif", custom: "Qo‘shimcha bo‘lim", calculator: "O‘z hisoblagichim",
};

function DesignFields({ design, onChange }: { design: CmsWebsite["design"]; onChange: (design: CmsWebsite["design"]) => void }) {
  const set = (patch: Partial<CmsWebsite["design"]>) => onChange({ ...design, ...patch });
  return <>
    <section className="card"><h2>Ranglar va shrift</h2><div className="fields-grid">
      {([{ key: "primary", label: "Asosiy rang" }, { key: "primaryDark", label: "Asosiy rangning to‘q turi" }, { key: "background", label: "Sahifa foni" }, { key: "surface", label: "Kartochka foni" }, { key: "text", label: "Matn rangi" }] as const).map(({ key, label }) => <Field key={key} label={label} type="color" value={design[key]} onChange={(value) => set({ [key]: value })} />)}
      <Select label="Shrift" value={design.font} options={[{ value: "system", label: "Oddiy, aniq shrift" }, { value: "serif", label: "Kitob uslubidagi shrift" }]} onChange={(font) => set({ font })} />
      <Field label="Asosiy matn o‘lchami (px)" type="number" min={15} max={20} value={design.fontSize} onChange={(v) => set({ fontSize: Number(v) })} />
    </div></section>
    <section className="card"><h2>O‘lcham va joylashuv</h2><div className="fields-grid">
      <Field label="Saytning eng katta kengligi (px)" type="number" min={960} max={1440} value={design.maxWidth} onChange={(v) => set({ maxWidth: Number(v) })} help="Telefon ekranida sayt avtomatik torayadi." />
      <Field label="Kartochka burchaklari (px)" type="number" min={10} max={32} value={design.radius} onChange={(v) => set({ radius: Number(v) })} />
      <Field label="Bo‘limlar orasidagi masofa (px)" type="number" min={24} max={100} value={design.sectionSpacing} onChange={(v) => set({ sectionSpacing: Number(v) })} />
      <Field label="Birinchi ekrandagi rasm balandligi (px)" type="number" min={320} max={680} value={design.heroHeight} onChange={(v) => set({ heroHeight: Number(v) })} />
    </div></section>
    <section className="card"><div className="control-line"><h2>Logotip, rasm va video</h2><Link className="btn ghost small" href="/media">Media yuklash</Link></div>
      <Field label="Logotip manzili" value={design.logoUrl} onChange={(logoUrl) => set({ logoUrl })} help="Media bo‘limidagi manzilni nusxalang. Sayt ichidagi / manzil yoki https:// rasm ishlaydi." />
      <Field label="Birinchi ekran rasmi (ixtiyoriy)" value={design.heroImageUrl} onChange={(heroImageUrl) => set({ heroImageUrl })} help="Bo‘sh qolsa, saytning joriy tasviri ishlatiladi." />
      <Field label="Birinchi ekran videosi (ixtiyoriy)" value={design.heroVideoUrl} onChange={(heroVideoUrl) => set({ heroVideoUrl })} help="Video bo‘lsa, yuqoridagi rasm uning kutish tasviri bo‘ladi." />
    </section>
  </>;
}

function LayoutFields({ data, onChange }: { data: CmsWebsite; onChange: (layout: CmsWebsite["layout"]) => void }) {
  const setAt = (i: number, patch: Partial<CmsWebsite["layout"][number]>) => onChange(data.layout.map((s, j) => i === j ? { ...s, ...patch } : s));
  return <section className="card"><h2>Bosh sahifadagi bo‘limlar</h2><p className="hint">Tartibni yuqoriga/pastga tugmalari bilan almashtiring. Belgini olib tashlash bo‘limni saytda yashiradi.</p>
    {data.layout.map((s, i) => <fieldset key={s.id} className={`section-item${s.enabled ? "" : " is-hidden"}`}><legend>{i + 1}. {sectionTitles[s.type]}</legend>
      <Checkbox label="Saytda ko‘rsatish" checked={s.enabled} onChange={(enabled) => setAt(i, { enabled })} />
      <p className="hint">Bo‘limga havola: <code>#{s.id}</code></p>
      {s.type === "custom" && <>
        <Field label="Bo‘lim sarlavhasi" value={s.title ?? ""} onChange={(title) => setAt(i, { title: title || undefined })} maxLength={120} />
        <Field label="Bo‘lim matni" value={s.text ?? ""} onChange={(text) => setAt(i, { text: text || undefined })} multiline maxLength={2000} />
        <Field label="Rasm manzili (ixtiyoriy)" value={s.image ?? ""} onChange={(image) => setAt(i, { image: image || undefined })} />
        <Checkbox label="Tugma qo‘shish" checked={!!s.button} onChange={(enabled) => setAt(i, { button: enabled ? { label: "Batafsil", href: "/aloqa" } : undefined })} />
        {s.button && <div className="fields-grid"><Field label="Tugma yozuvi" value={s.button.label} maxLength={60} onChange={(label) => setAt(i, { button: { ...s.button!, label } })} /><Field label="Tugma havolasi" value={s.button.href} onChange={(href) => setAt(i, { button: { ...s.button!, href } })} /></div>}
      </>}
      {s.type === "calculator" && <Select label="Hisoblagich" value={s.toolId ?? ""} options={data.tools.map((t) => ({ value: t.id, label: t.title }))} onChange={(toolId) => setAt(i, { toolId })} />}
      <ListControls index={i} length={data.layout.length} label={sectionTitles[s.type]} onMove={(a, b) => onChange(reordered(data.layout, a, b))} onRemove={s.type === "custom" || s.type === "calculator" ? () => onChange(data.layout.filter((_, j) => i !== j)) : undefined} />
    </fieldset>)}
    <div className="add-blocks"><button type="button" className="btn ghost" disabled={data.layout.length >= 40} onClick={() => onChange([...data.layout, { id: sectionId(), type: "custom", enabled: true, title: "Yangi bo‘lim", text: "Matnni shu yerga yozing." }])}>+ Bo‘lim qo‘shish</button>
    <button type="button" className="btn ghost" disabled={data.tools.length === 0 || data.layout.length >= 40} onClick={() => onChange([...data.layout, { id: sectionId("hisob"), type: "calculator", enabled: true, toolId: data.tools[0]!.id }])}>+ Hisoblagich qo‘shish</button></div>
  </section>;
}

function PagesFields({ data, onChange }: { data: CmsWebsite; onChange: (data: CmsWebsite) => void }) {
  const [newPath, setNewPath] = useState("");
  const [pathError, setPathError] = useState("");
  const setPage = (path: string, patch: Partial<InnerPage>) => onChange({ ...data, pages: { ...data.pages, [path]: { ...data.pages[path]!, ...patch } } });
  const addPage = () => {
    const path = `/${newPath.trim().replace(/^\/+/, "")}`;
    if (!/^\/[a-z0-9][a-z0-9-]{1,59}$/.test(path)) { setPathError("Manzilga 2–60 ta lotin harfi, raqam yoki tire yozing: masalan /ferma-haqida."); return; }
    if (["/api", "/media", "/kirish", "/kontent", "/admin", "/_next", "/hisob", "/cms-preview"].includes(path)) { setPathError("Bu manzil tizim uchun band. Boshqa manzil tanlang."); return; }
    if (data.pages[path]) { setPathError("Bu manzil allaqachon mavjud. Boshqa manzil tanlang."); return; }
    onChange({ ...data, pages: { ...data.pages, [path]: { h1: "Yangi sahifa", intro: "Kirish matnini shu yerga yozing.", blocks: [{ type: "p", text: "Sahifa matnini yozing." }], cta: { label: "Aloqa", href: "/aloqa" } } }, seo: { ...data.seo, [path]: { title: "Yangi sahifa", description: "Sahifa haqida qisqa tavsif." } } });
    setNewPath(""); setPathError("");
  };
  const remove = (path: string) => {
    const pages = { ...data.pages }; const seo = { ...data.seo }; delete pages[path]; delete seo[path];
    const nav = { ...data.home.nav, links: data.home.nav.links.filter((x) => x.href !== path), footerGuides: data.home.nav.footerGuides.filter((x) => x.href !== path), footerSections: data.home.nav.footerSections.filter((x) => x.href !== path), tabbar: data.home.nav.tabbar.filter((x) => x.href !== path) };
    onChange({ ...data, pages, seo, home: { ...data.home, nav } });
  };
  return <>
    <section className="card"><h2>Sahifa qo‘shish</h2><Field label="Yangi sahifa manzili" value={newPath} onChange={setNewPath} placeholder="/ferma-haqida" help="Manzil boshiga / qo‘yiladi. Sahifa qo‘shilgach, pastda uning matnlarini yozing." />{pathError && <p className="field-error" role="alert">{pathError}</p>}<button type="button" className="btn ghost" disabled={Object.keys(data.pages).length >= 50} onClick={addPage}>+ Sahifa yaratish</button></section>
    {Object.entries(data.pages).map(([path, page]) => <details className="card editor-accordion" key={path}><summary>{page.h1} <span className="section-id">{path}</span></summary><div className="accordion-body">
      <Field label="Sahifa sarlavhasi" value={page.h1} maxLength={90} onChange={(h1) => setPage(path, { h1 })} />
      <Field label="Kirish matni" value={page.intro} maxLength={400} multiline onChange={(intro) => setPage(path, { intro })} />
      <h3>Sahifa tarkibi</h3><BlocksEditor blocks={page.blocks} tools={data.tools} onChange={(blocks) => setPage(path, { blocks })} />
      <fieldset className="item"><legend>Yakuniy tugma</legend><Field label="Tugma yozuvi" value={page.cta.label} maxLength={60} onChange={(label) => setPage(path, { cta: { ...page.cta, label } })} /><Field label="Tugma havolasi" value={page.cta.href} onChange={(href) => setPage(path, { cta: { ...page.cta, href } })} help="Sahifa uchun /aloqa; veterinarga vet:tel; Telegram uchun telegram:." /></fieldset>
      <Checkbox label="Pastki menyuda havolasini ko‘rsatish" checked={data.home.nav.footerGuides.some((link) => link.href === path)} onChange={(enabled) => onChange({ ...data, home: { ...data.home, nav: { ...data.home.nav, footerGuides: enabled ? [...data.home.nav.footerGuides, { href: path, label: page.h1 }] : data.home.nav.footerGuides.filter((link) => link.href !== path) } } })} />
      <button type="button" className="btn ghost danger-text" onClick={() => remove(path)}>Sahifani o‘chirish</button>
    </div></details>)}
    <p className="hint">Savol-javob va aloqa sahifalarining matnlari boshqaruvdagi alohida bo‘limlarda tahrirlanadi.</p>
  </>;
}

function formulaResult(tool: CmsTool): { value: number } | { error: string } {
  try {
    const variables = Object.fromEntries(tool.inputs.map((input) => [input.key, input.defaultValue]));
    return { value: evaluateFormula(tool.formula, variables) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Formulani tekshiring." };
  }
}

function FormulaPreview({ tool }: { tool: CmsTool }) {
  const result = formulaResult(tool);
  if ("error" in result) return <p className="field-error" role="status">{result.error}</p>;
  return <div className="preview-note" role="status"><b>Boshlang‘ich qiymatlarda namuna natija</b><p>{tool.resultLabel}: <strong>{new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 6 }).format(result.value)}</strong> {tool.resultUnit}</p></div>;
}

function ToolsFields({ data, onChange }: { data: CmsWebsite; onChange: (data: CmsWebsite) => void }) {
  const setTool = (i: number, patch: Partial<CmsWebsite["tools"][number]>) => onChange({ ...data, tools: data.tools.map((t, j) => i === j ? { ...t, ...patch } : t) });
  const removeTool = (i: number) => {
    const id = data.tools[i]!.id;
    onChange({ ...data, tools: data.tools.filter((_, j) => i !== j), layout: data.layout.filter((s) => s.type !== "calculator" || s.toolId !== id), pages: Object.fromEntries(Object.entries(data.pages).map(([path, page]) => [path, { ...page, blocks: page.blocks.filter((b) => b.type !== "calculator" || b.toolId !== id) }])) });
  };
  return <>
    <section className="card"><h2>O‘z hisoblagichlaringiz</h2><p className="muted">Kiritiladigan sonlarni belgilang va hisoblash formulasini yozing. Tayyor hisoblagichni bosh sahifadagi Bo‘limlar yoki alohida Sahifalar tabida joylashtiring.</p><p className="hint">Masalan: bosh soni × kunlik xarajat × kun. Formula: <code>bosh * narx * kun</code>.</p></section>
    {data.tools.map((tool, i) => <section className="card" key={tool.id}><div className="page-heading"><h3>{tool.title || "Yangi hisoblagich"}</h3><span className="section-id">{tool.id}</span></div>
      <Field label="Hisoblagich nomi" value={tool.title} maxLength={100} onChange={(title) => setTool(i, { title })} />
      <Field label="Qisqa tavsif" value={tool.description} multiline maxLength={400} onChange={(description) => setTool(i, { description })} />
      {tool.inputs.map((input, j) => <fieldset className="item" key={j}><legend>{j + 1}-kiritiladigan son</legend>
        <div className="fields-grid"><Field label="Foydalanuvchiga ko‘rinadigan nomi" value={input.label} maxLength={80} onChange={(label) => setTool(i, { inputs: tool.inputs.map((x, k) => j === k ? { ...x, label } : x) })} /><Field label="Formuladagi nomi" value={input.key} maxLength={20} onChange={(key) => setTool(i, { inputs: tool.inputs.map((x, k) => j === k ? { ...x, key } : x) })} help="Lotin harflari: bosh, narx, kun. Bo‘sh joy ishlatmang." />
          {([{ key: "min", label: "Eng kam qiymat" }, { key: "max", label: "Eng ko‘p qiymat" }, { key: "step", label: "Qiymat qadami" }, { key: "defaultValue", label: "Boshlang‘ich qiymat" }] as const).map(({ key, label }) => <Field key={key} label={label} type="number" step="any" value={input[key]} onChange={(value) => setTool(i, { inputs: tool.inputs.map((x, k) => j === k ? { ...x, [key]: Number(value) } : x) })} />)}
          <Field label="Birligi" value={input.unit} maxLength={30} onChange={(unit) => setTool(i, { inputs: tool.inputs.map((x, k) => j === k ? { ...x, unit } : x) })} placeholder="kg, so‘m, bosh" />
        </div>
        <ListControls index={j} length={tool.inputs.length} label={`${j + 1}-son`} onMove={(a, b) => setTool(i, { inputs: reordered(tool.inputs, a, b) })} removable={tool.inputs.length > 1} onRemove={() => setTool(i, { inputs: tool.inputs.filter((_, k) => j !== k) })} />
      </fieldset>)}
      <button type="button" className="btn ghost small" disabled={tool.inputs.length >= 12} onClick={() => {
        let n = tool.inputs.length + 1; while (tool.inputs.some((x) => x.key === `son${n}`)) n++;
        setTool(i, { inputs: [...tool.inputs, { key: `son${n}`, label: `Son ${n}`, min: 0, max: 10000, step: 1, defaultValue: 1, unit: "" }] });
      }}>+ Son qo‘shish</button>
      <Field label="Hisoblash formulasi" value={tool.formula} maxLength={200} onChange={(formula) => setTool(i, { formula })} help="Yuqoridagi nomlar hamda + − * / ( ) ishlaydi. Masalan: bosh * narx * kun." />
      <div className="fields-grid"><Field label="Natija yozuvi" value={tool.resultLabel} maxLength={80} onChange={(resultLabel) => setTool(i, { resultLabel })} /><Field label="Natija birligi" value={tool.resultUnit} maxLength={30} onChange={(resultUnit) => setTool(i, { resultUnit })} /></div>
      <FormulaPreview tool={tool} />
      <ListControls index={i} length={data.tools.length} label={tool.title} onMove={(a, b) => onChange({ ...data, tools: reordered(data.tools, a, b) })} onRemove={() => removeTool(i)} />
      <p className="hint">Hisoblagich o‘chirilsa, u joylashtirilgan sahifa bloklari va bosh sahifa bo‘limlari ham qoralamadan olinadi.</p>
    </section>)}
    <button type="button" className="btn ghost" disabled={data.tools.length >= 30} onClick={() => onChange({ ...data, tools: [...data.tools, { id: sectionId("hisob"), title: "Yangi hisoblagich", description: "Qiymatlarni kiriting va natijani hisoblang.", inputs: [{ key: "bosh", label: "Bosh soni", min: 1, max: 10000, step: 1, defaultValue: 1, unit: "bosh" }, { key: "narx", label: "Bir boshga xarajat", min: 0, max: 100000000, step: 100, defaultValue: 1000, unit: "so‘m" }], formula: "bosh * narx", resultLabel: "Jami xarajat", resultUnit: "so‘m" }] })}>+ Hisoblagich yaratish</button>
  </>;
}

function SeoFields({ data, onChange }: { data: CmsWebsite; onChange: (seo: CmsWebsite["seo"]) => void }) {
  return <section className="card"><h2>Qidiruv va ulashish yozuvlari</h2><p className="hint">Sarlavha va tavsif qidiruv natijalarida hamda sayt havolasi ulashilganda ko‘rinadi.</p>
    {Object.entries(data.seo).map(([path, seo]) => <fieldset className="item" key={path}><legend>{path === "/" ? "Bosh sahifa" : data.pages[path]?.h1 ?? path}</legend><p className="hint">{path}</p>
      <Field label="Qidiruvdagi sarlavha" value={seo.title} maxLength={70} onChange={(title) => onChange({ ...data.seo, [path]: { ...seo, title } })} />
      <Field label="Qisqa tavsif" value={seo.description} multiline maxLength={170} onChange={(description) => onChange({ ...data.seo, [path]: { ...seo, description } })} />
    </fieldset>)}
  </section>;
}

export function WebsiteEditor({ tur, base, initial }: { tur: string; base: number; initial: CmsWebsite }) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>("design");
  return <div className="editor">
    <nav className="editor-tabs" role="tablist" aria-label="Sayt tahriri" onKeyDown={(event) => {
      const i = tabs.findIndex((item) => `tab-${item.id}` === (event.target as HTMLElement).id);
      if (i < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (i + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      const next = tabs[nextIndex]!; setTab(next.id); document.getElementById(`tab-${next.id}`)?.focus();
    }}>
      {tabs.map((t) => <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" tabIndex={tab === t.id ? 0 : -1} aria-selected={tab === t.id} aria-controls="website-panel" onClick={() => setTab(t.id)}>{t.title}</button>)}
    </nav>
    <div className="editor-panel" role="tabpanel" id="website-panel" aria-labelledby={`tab-${tab}`}>
      {tab === "design" && <DesignFields design={data.design} onChange={(design) => setData({ ...data, design })} />}
      {tab === "home" && Object.entries(data.home).map(([key, value]) => <details className="card editor-accordion" key={key}><summary>{homeTitles[key] ?? labelForKey(key)}</summary><div className="accordion-body"><ValueFields value={value} label={homeTitles[key] ?? key} path={key} onChange={(next) => setData({ ...data, home: { ...data.home, [key]: next } })} /></div></details>)}
      {tab === "layout" && <LayoutFields data={data} onChange={(layout) => setData({ ...data, layout })} />}
      {tab === "pages" && <PagesFields data={data} onChange={setData} />}
      {tab === "tools" && <ToolsFields data={data} onChange={setData} />}
      {tab === "labels" && <><LabelFields labels={data.labels} onChange={(labels) => setData({ ...data, labels })} />
        {Object.entries(data.widgets).map(([key, value]) => <details className="card editor-accordion" key={key}><summary>{({ farmStats: "Ferma statistikasi", animalCard: "Hayvon kartochkasi", compareHead: "Daftar bilan taqqoslash sarlavhasi", compareRows: "Daftar bilan taqqoslash qatorlari", soonExtra: "Kelajakdagi funksiyalar yozuvlari", urgentVetText: "Shoshilinch aloqa yozuvlari", notFoundText: "Topilmagan sahifa yozuvlari" } as Record<string, string>)[key] ?? labelForKey(key)}</summary><div className="accordion-body"><ValueFields value={value} path={key} label={labelForKey(key)} onChange={(next) => setData({ ...data, widgets: { ...data.widgets, [key]: next } })} /></div></details>)}</>}
      {tab === "seo" && <SeoFields data={data} onChange={(seo) => setData({ ...data, seo })} />}
    </div>
    <DraftForm tur={tur} base={base} data={data} />
  </div>;
}
