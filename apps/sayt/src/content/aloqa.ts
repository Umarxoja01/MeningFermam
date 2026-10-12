// Aloqa ma'lumotlari (egasi tasdiqlagan, 2026-10-12). Hammasi ochiq ma'lumot; o'zgartirish — shu faylda (email, manzil, veterinarlar).
// Yo'q qiymat (null) saytda ko'rsatilmaydi — soxta shablon chiqmaydi (TZ v3.1 §4.9, Q18).

// Turlar va tekshiruv qoidalari umumiy paketda (packages/content); `npm test` ularni tekshiradi.
import type { Contacts, Vet } from "@meningfermam/content";

export type { Contacts, Vet };

export const contacts: Contacts = {
  hours: "Har kuni 8:00–21:00",
  phone: "+998996180300",
  telegram: "MeningFermamUzb",
  instagram: "meningfermam",
  email: null,
  address: null,
  vets: [{ title: "Veterinar", name: null, phone: "+998994446544", telegram: "Sardorxoja_Vet" }],
};

/** "Veterinar chaqirish" tugmasi uchun birinchi veterinar. */
export const primaryVet = (): Vet | null => contacts.vets[0] ?? null;
