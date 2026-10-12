// Parol: argon2id (sinovdan o'tgan @node-rs/argon2), siyosat va sizib chiqqan parollar tekshiruvi (ADMIN_TZ §4.1).
import { hash, verify } from "@node-rs/argon2";
import { createHash } from "node:crypto";

/** OWASP tavsiyasi: argon2id, m=19 MiB, t=2, p=1. (algorithm 2 = Argon2id; const enum isolatedModules'da import qilinmaydi.) */
const OPTS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (pw: string) => hash(pw, OPTS);

let dummyHash: Promise<string> | null = null;

/** Foydalanuvchi topilmasa ham bir xil vaqt sarflanadi (login mavjudligini vaqt orqali bilib bo'lmasin). */
export async function verifyPassword(stored: string | null, pw: string) {
  if (!stored) {
    dummyHash ??= hashPassword("mf-dummy-password-for-timing");
    await verify(await dummyHash, pw).catch(() => false);
    return false;
  }
  try {
    return await verify(stored, pw);
  } catch {
    return false;
  }
}

/** Eng ko'p uchraydigan parollar (qisqa ro'yxat; to'liq tekshiruv — isPwned). */
const COMMON = new Set([
  "123456789012", "1234567890123", "qwertyuiop12", "qwerty123456", "password1234", "passwordpassword", "111111111111",
  "000000000000", "123123123123", "iloveyou1234", "admin1234567", "administrator", "meningfermam", "meningfermam1",
  "toshkent2026", "uzbekistan12", "parol1234567", "parolparol12", "1q2w3e4r5t6y", "abcdefghijkl",
]);

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

/** Parol siyosati: muammolar ro'yxati (bo'sh — mos). */
export function passwordProblems(pw: string, ctx: { login?: string; name?: string } = {}): string[] {
  const out: string[] = [];
  if (pw.length < PASSWORD_MIN) out.push(`Parol kamida ${PASSWORD_MIN} belgi bo‘lsin`);
  if (pw.length > PASSWORD_MAX) out.push(`Parol ${PASSWORD_MAX} belgidan oshmasin`);
  const low = pw.toLowerCase();
  if (COMMON.has(low) || /^(.)\1+$/.test(pw) || /^(0123456789|1234567890)+\d*$/.test(pw)) out.push("Bu parol juda oddiy");
  const digits = ctx.login?.replace(/\D/g, "") ?? "";
  if (digits.length >= 7 && pw.replace(/\D/g, "").includes(digits.slice(-7))) out.push("Parolda telefon raqamingiz bo‘lmasin");
  if (ctx.name && ctx.name.length >= 4 && low.includes(ctx.name.toLowerCase())) out.push("Parolda ismingiz bo‘lmasin");
  return out;
}

/**
 * Have I Been Pwned (k-anonimlik: serverga faqat SHA-1 xeshning 5 belgisi yuboriladi).
 * true — sizib chiqqan; false — topilmadi; null — tekshirib bo'lmadi (internet yo'q). Yoqish: PWNED_CHECK=1.
 */
export async function isPwned(pw: string, fetchImpl: typeof fetch = fetch, timeoutMs = 3000): Promise<boolean | null> {
  const h = createHash("sha1").update(pw).digest("hex").toUpperCase();
  try {
    const res = await fetchImpl(`https://api.pwnedpasswords.com/range/${h.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const body = await res.text();
    return body.split("\n").some((line) => { const [suffix, count] = line.trim().split(":"); return suffix === h.slice(5) && Number(count) > 0; });
  } catch {
    return null;
  }
}
