"use client";

import type { Block, WidgetName } from "@meningfermam/content";
import { Field, ListControls, reordered, Select } from "./editor-controls";

export const widgetOptions: { value: WidgetName; label: string }[] = [
  { value: "feed", label: "Yem hisoblagichi" }, { value: "sick", label: "Kasallik va davolash namunasi" },
  { value: "store", label: "Dori ombori namunasi" }, { value: "urgentVet", label: "Veterinarga tez bog‘lanish" },
  { value: "pedigree", label: "Nasab daraxti namunasi" }, { value: "farmStats", label: "Sut statistikasi namunasi" },
  { value: "animalCard", label: "Hayvon kartochkasi namunasi" }, { value: "compare", label: "Daftar bilan solishtirish" },
  { value: "soonList", label: "Rejalashtirilgan funksiyalar" }, { value: "contacts", label: "Aloqa ma’lumotlari" },
];

const blockTitles: Record<Block["type"], string> = { h2: "Sarlavha", p: "Matn", steps: "Qadamlar", list: "Ro‘yxat", note: "Izoh", widget: "Tayyor funksiya", image: "Rasm", button: "Tugma", calculator: "O‘z hisoblagichim" };

export function makeBlock(type: Block["type"]): Block {
  if (type === "h2") return { type, text: "Yangi sarlavha" };
  if (type === "p") return { type, text: "Matnni shu yerga yozing." };
  if (type === "steps" || type === "list") return { type, items: [{ text: "Birinchi band" }] };
  if (type === "note") return { type, tone: "info", text: "Izohni shu yerga yozing." };
  if (type === "image") return { type, src: "/brand/logo.webp", alt: "Rasm tavsifi" };
  if (type === "button") return { type, label: "Batafsil", href: "/aloqa" };
  if (type === "calculator") return { type, toolId: "hisob" };
  return { type: "widget", name: "feed" };
}

function ItemsEditor({ block, onChange }: { block: Extract<Block, { type: "steps" | "list" }>; onChange: (block: Block) => void }) {
  const limit = block.type === "steps" ? 20 : 30;
  return <div className="block-list">
    {block.items.map((item, i) => <fieldset className="item" key={i}>
      <legend>{i + 1}-band</legend>
      <Field label="Band sarlavhasi (ixtiyoriy)" value={item.title ?? ""} maxLength={80} onChange={(title) => onChange({ ...block, items: block.items.map((x, j) => j === i ? { ...x, title: title || undefined } : x) })} />
      <Field label="Band matni" value={item.text} multiline maxLength={800} onChange={(text) => onChange({ ...block, items: block.items.map((x, j) => j === i ? { ...x, text } : x) })} />
      <ListControls index={i} length={block.items.length} label={`${i + 1}-band`} onMove={(a, b) => onChange({ ...block, items: reordered(block.items, a, b) })} removable={block.items.length > 1} onRemove={() => onChange({ ...block, items: block.items.filter((_, j) => i !== j) })} />
    </fieldset>)}
    <button className="btn ghost small" type="button" disabled={block.items.length >= limit} onClick={() => onChange({ ...block, items: [...block.items, { text: "Yangi band" }] })}>+ Band qo‘shish</button>
  </div>;
}

export function BlockFields({ block, onChange, tools = [] }: { block: Block; onChange: (block: Block) => void; tools?: { id: string; title: string }[] }) {
  switch (block.type) {
    case "h2": return <Field label="Sarlavha" value={block.text} maxLength={120} onChange={(text) => onChange({ ...block, text })} />;
    case "p": return <Field label="Matn" value={block.text} multiline maxLength={2000} onChange={(text) => onChange({ ...block, text })} />;
    case "steps": case "list": return <ItemsEditor block={block} onChange={onChange} />;
    case "widget": return <Select label="Qo‘shiladigan tayyor funksiya" value={block.name} options={widgetOptions} onChange={(name) => onChange({ ...block, name })} help="Mavjud ishlaydigan namuna sahifaga qo‘shiladi. Yangi hisoblash qoidasini dasturchi yaratadi." />;
    case "image": return <><Field label="Rasm manzili" value={block.src} onChange={(src) => onChange({ ...block, src })} help="Media bo‘limidagi rasm manzilini qo‘ying yoki https:// manzil yozing." /><Field label="Rasm tavsifi" value={block.alt} maxLength={200} onChange={(alt) => onChange({ ...block, alt })} help="Rasm ko‘rinmasa yoki ovozli o‘quvchi ishlatilsa, shu tavsif o‘qiladi." /></>;
    case "button": return <><Field label="Tugma yozuvi" value={block.label} maxLength={60} onChange={(label) => onChange({ ...block, label })} /><Field label="Tugma havolasi" value={block.href} onChange={(href) => onChange({ ...block, href })} placeholder="/aloqa" /></>;
    case "calculator": return <Select label="Hisoblagich" value={block.toolId} options={tools.map((tool) => ({ value: tool.id, label: tool.title || tool.id }))} onChange={(toolId) => onChange({ ...block, toolId })} help="Yangi hisoblagichni avval Hisoblagichlar tabida yarating." />;
    case "note": return <>
      <Select label="Izoh turi" value={block.tone} options={[{ value: "info", label: "Ma’lumot" }, { value: "warn", label: "Diqqat" }]} onChange={(tone) => onChange({ ...block, tone })} />
      <Field label="Izoh sarlavhasi (ixtiyoriy)" value={block.title ?? ""} maxLength={60} onChange={(title) => onChange({ ...block, title: title || undefined })} />
      <Field label="Izoh matni" value={block.text} multiline maxLength={800} onChange={(text) => onChange({ ...block, text })} />
    </>;
  }
}

export function BlocksEditor({ blocks, onChange, tools = [] }: { blocks: Block[]; onChange: (blocks: Block[]) => void; tools?: { id: string; title: string }[] }) {
  return <div className="block-list">
    {blocks.length === 0 && <p className="editor-empty">Sahifaga matn, sarlavha yoki tayyor funksiya qo‘shing.</p>}
    {blocks.map((block, i) => <fieldset className="item" key={i}>
      <legend>{i + 1}. {blockTitles[block.type]}</legend>
      <BlockFields block={block} tools={tools} onChange={(next) => onChange(blocks.map((x, j) => j === i ? next : x))} />
      <ListControls index={i} length={blocks.length} label={`${i + 1}-blok`} onMove={(a, b) => onChange(reordered(blocks, a, b))} onRemove={() => onChange(blocks.filter((_, j) => i !== j))} />
    </fieldset>)}
    <div className="add-blocks" aria-label="Blok qo‘shish">
      {(["h2", "p", "steps", "list", "note", "widget", "image", "button", "calculator"] as const).map((type) => <button className="btn ghost small" key={type} type="button" disabled={blocks.length >= 60 || (type === "calculator" && tools.length === 0)} onClick={() => onChange([...blocks, type === "calculator" ? { type, toolId: tools[0]!.id } : makeBlock(type)])}>+ {blockTitles[type]}</button>)}
    </div>
  </div>;
}
