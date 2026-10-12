// Funksiyalar holati — yagona manba (TZ v3.1 §4.8, F-09). Bosh sahifa tablari, /daftardan-farqi va /tez-orada shu yerdan oladi.
// Audit tuzatishi (2026-10-12): on — ko'rsatiladigan namuna, ishga tushgan ilova funksiyasi emas.

import type { Feature, StatusKind } from "@meningfermam/content";

export type { Feature, StatusKind };

export const statusLabels: Record<StatusKind, string> = { on: "Namuna", pr: "Jarayonda", soon: "Rejada" };
export const statusTabLabels: Record<StatusKind, string> = { on: "🧪 Namuna", pr: "⏳ Jarayonda", soon: "📋 Rejada" };
export const statusOrder: StatusKind[] = ["on", "pr", "soon"];

export const features: Feature[] = [
  { id: "eslatma", kind: "on", emoji: "⏰", title: "Dori eslatmasi" },
  { id: "nasab", kind: "on", emoji: "🧬", title: "Nasab va juftlash" },
  { id: "statistika", kind: "on", emoji: "📊", title: "Sut va statistika" },
  { id: "vet", kind: "on", emoji: "🩺", title: "Veterinar bilan aloqa" },
  { id: "yem", kind: "pr", emoji: "🌾", title: "Yem hisoblagich" },
  { id: "sxema", kind: "pr", emoji: "💊", title: "Dori va sxema" },
  { id: "ombor", kind: "pr", emoji: "🧴", title: "Dori ombori" },
  { id: "vetapteka", kind: "soon", emoji: "📍", title: "Eng yaqin vetapteka", note: "Yaqindagi vetaptekalar va ularda dori borligi." },
  { id: "emlash", kind: "soon", emoji: "💉", title: "Emlash kalendari", note: "Qaysi hayvonni qachon emlash kerakligi." },
  { id: "tugish", kind: "soon", emoji: "🍼", title: "Tug‘ish eslatmasi", note: "Tug‘ish vaqti yaqinlashganda eslatma." },
];

export const featureById = (id: string) => features.find((f) => f.id === id);
export const featuresByKind = (kind: StatusKind) => features.filter((f) => f.kind === kind);

export const holatHead = { chip: "Ilova hali ishga tushmagan", title: "Saytdagi namunalar va ilova rejalari" };
