"use server";
// Kontent amallari (ADMIN_TZ §3): har biri boshida requireUser; vakolat xizmatda ham qayta tekshiriladi.
import { revalidatePath } from "next/cache";
import { authCtx, requireUser } from "@/lib/auth/next";
import * as content from "@/lib/content/service";
import { sectionOf } from "./sections";

export type EditState = { ok?: string; error?: string; errors?: string[]; conflict?: boolean } | null;
export type PublishState = { ok?: string; error?: string; errors?: string[]; issues?: { rule: string; why: string; match: string }[] } | null;

const MAX_JSON = 500_000;

async function ctxFor() {
  const { db } = await authCtx();
  return { db };
}

export async function saveDraftAction(_prev: EditState, fd: FormData): Promise<EditState> {
  const u = await requireUser(["admin", "editor"]);
  const sec = sectionOf(String(fd.get("tur") ?? ""));
  if (!sec) return { error: "Bo‘lim topilmadi" };
  const raw = String(fd.get("data") ?? "");
  if (raw.length > MAX_JSON) return { error: "Ma’lumot juda katta" };
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return { error: "Ma’lumot buzilgan" }; }
  const r = await content.saveDraft(await ctxFor(), u, { type: sec.type, key: sec.key, data, baseNumber: Number(fd.get("base") ?? -1) });
  // sahifa faqat yangi versiya paydo bo'lganda yangilanadi: conflict yoki xatoda tahrirlovchidagi o'zgarishlar joyida qoladi
  if (r.ok && !r.unchanged) { revalidatePath(`/kontent/${sec.slug}`); revalidatePath("/"); }
  if (r.ok) return { ok: r.unchanged ? "O‘zgarish yo‘q — yangi versiya yaratilmadi." : `Qoralama saqlandi: ${r.number}-versiya. Saytda hali eski versiya turibdi — nashr qiling.` };
  if (r.error === "conflict") return { conflict: true, error: `Siz tahrirlayotgan paytda boshqa o‘zgarish saqlangan (${r.latestNumber ?? "?"}-versiya). Sizning o‘zgarishlaringiz shu oynada turibdi: ularni eslab qoling (yoki nusxalang), sahifani yangilang va qayta kiriting. Hech kimning o‘zgarishi yo‘qolmaydi.` };
  if (r.error === "forbidden") return { error: "Bu amal uchun ruxsat yo‘q" };
  return { error: "Ma’lumotda xato bor:", errors: r.errors };
}

export async function submitAction(fd: FormData) {
  const u = await requireUser(["admin", "editor"]);
  const sec = sectionOf(String(fd.get("tur") ?? ""));
  if (!sec) return;
  await content.submitForReview(await ctxFor(), u, { type: sec.type, key: sec.key, number: Number(fd.get("number")) });
  revalidatePath(`/kontent/${sec.slug}`);
}

export async function publishAction(_prev: PublishState, fd: FormData): Promise<PublishState> {
  const u = await requireUser(["admin"]);
  const sec = sectionOf(String(fd.get("tur") ?? ""));
  if (!sec) return { error: "Bo‘lim topilmadi" };
  const number = Number(fd.get("number"));
  const r = await content.publish(await ctxFor(), u, { type: sec.type, key: sec.key, number, confirmIssues: fd.get("confirm") === "1" });
  revalidatePath(`/kontent/${sec.slug}`);
  revalidatePath("/");
  if (r.ok) return { ok: `${r.number}-versiya nashr qilindi.` };
  if (r.error === "confirm") return { issues: r.issues };
  if (r.error === "invalid") return { error: "Versiyada xato bor:", errors: r.errors };
  return { error: r.error === "forbidden" ? "Nashr qilish faqat administratorga ruxsat etilgan" : "Versiya topilmadi" };
}

export async function restoreAction(fd: FormData) {
  const u = await requireUser(["admin", "editor"]);
  const sec = sectionOf(String(fd.get("tur") ?? ""));
  if (!sec) return;
  await content.restoreAsDraft(await ctxFor(), u, { type: sec.type, key: sec.key, fromNumber: Number(fd.get("from")), baseNumber: Number(fd.get("base")) });
  revalidatePath(`/kontent/${sec.slug}`);
}
