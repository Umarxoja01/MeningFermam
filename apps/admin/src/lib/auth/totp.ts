// Ikki bosqichli kirish: TOTP (RFC 6238, 6 raqam, 30 s) — otpauth kutubxonasi. Kod qayta ishlatilmaydi (oxirgi qadam saqlanadi).
import { Secret, TOTP } from "otpauth";
import { AUTH } from "./config";

export const newTotpSecret = () => new Secret({ size: 20 }).base32;

/** Telefon ilovasi uchun otpauth:// manzil (QR shu manzildan chiziladi). */
export const totpUri = (secretBase32: string, label: string) =>
  new TOTP({ issuer: AUTH.issuer, label, secret: Secret.fromBase32(secretBase32), digits: 6, period: 30 }).toString();

/**
 * Kodni tekshirish: ±1 qadam (soat farqi). Qabul qilingan qadam qaytariladi; u lastStep'dan katta bo'lishi shart —
 * bitta kodni ikki marta ishlatib bo'lmaydi (replay). Noto'g'ri bo'lsa null.
 */
export function verifyTotp(secretBase32: string, code: string, now: number, lastStep: number | null): number | null {
  const token = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) return null;
  const delta = TOTP.validate({ token, secret: Secret.fromBase32(secretBase32), digits: 6, period: 30, timestamp: now, window: 1 });
  if (delta === null) return null;
  const step = TOTP.counter({ period: 30, timestamp: now }) + delta;
  if (lastStep !== null && step <= lastStep) return null;
  return step;
}

/** Testlar va E2E uchun: berilgan vaqtdagi kod. */
export const totpAt = (secretBase32: string, now: number) => TOTP.generate({ secret: Secret.fromBase32(secretBase32), digits: 6, period: 30, timestamp: now });
