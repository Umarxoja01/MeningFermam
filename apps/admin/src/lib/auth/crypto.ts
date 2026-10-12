// Kriptografik yordamchilar: faqat Node.js crypto (o'zimiz algoritm yozmaymiz; ADMIN_TZ §4.1).
import { createCipheriv, createDecipheriv, createHash, createHmac, hkdfSync, randomBytes } from "node:crypto";

/** Brauzerga beriladigan tasodifiy token (256 bit). */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

/** Yuqori entropiyali token xeshi (bazada faqat xesh saqlanadi). */
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export type Keys = { enc: Buffer; mac: Buffer };

/** ADMIN_ENC_KEY — 32 baytli kalit (base64). Undan shifrlash va HMAC uchun alohida kalitlar chiqariladi. */
export function keysFrom(base64: string | undefined): Keys {
  const raw = base64 ? Buffer.from(base64, "base64") : Buffer.alloc(0);
  if (raw.length !== 32) throw new Error("ADMIN_ENC_KEY 32 baytli base64 kalit bo'lishi kerak (openssl rand -base64 32)");
  const derive = (info: string) => Buffer.from(hkdfSync("sha256", raw, Buffer.alloc(0), info, 32));
  return { enc: derive("mf-admin-enc-v1"), mac: derive("mf-admin-mac-v1") };
}

/** AES-256-GCM: "v1.<iv|tag|matn>" (base64url). */
export function encrypt(keys: Keys, plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", keys.enc, iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1.${Buffer.concat([iv, c.getAuthTag(), body]).toString("base64url")}`;
}

export function decrypt(keys: Keys, sealed: string) {
  if (!sealed.startsWith("v1.")) throw new Error("noma'lum shifr versiyasi");
  const buf = Buffer.from(sealed.slice(3), "base64url");
  const d = createDecipheriv("aes-256-gcm", keys.enc, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

/** Zaxira kodlar uchun HMAC (aniq qidirish mumkin, kalitsiz tiklab bo'lmaydi). */
export const mac = (keys: Keys, s: string) => createHmac("sha256", keys.mac).update(s).digest("hex");
