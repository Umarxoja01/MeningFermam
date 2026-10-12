// Kirish sozlamalari (ADMIN_TZ §4.1–4.2; S-6). Bir joyda — testlar ham shu qiymatlarni ishlatadi.
const MIN = 60_000;

export const AUTH = {
  /** Harakatsizlik muddati. */
  idleMs: 30 * MIN,
  /** Umumiy sessiya muddati. */
  absoluteMs: 12 * 60 * MIN,
  /** Parol to'g'ri, kod kutilayotgan yoki sozlash bosqichi. */
  pendingMs: 10 * MIN,
  /** lastSeen'ni har so'rovda emas, shuncha vaqtda bir yangilash. */
  touchEveryMs: MIN,
  /** Shuncha ketma-ket xatodan keyin hisob bloklanadi. */
  maxFails: 5,
  /** Birinchi blok; keyingilari 2 baravar uzun (24 soatgacha). */
  lockBaseMs: 15 * MIN,
  lockMaxMs: 24 * 60 * MIN,
  /** IP bo'yicha: shu oynada shuncha xato — vaqtincha rad. */
  ipWindowMs: 15 * MIN,
  ipMaxFails: 30,
  /** Kod bosqichida ruxsat etilgan urinishlar (keyin sessiya yopiladi). */
  mfaMaxAttempts: 5,
  recoveryCodes: 10,
  /** Brauzer cookie nomi: __Host- — faqat HTTPS, faqat shu domen, Path=/. */
  cookie: "__Host-mf_admin",
  issuer: "MeningFermam admin",
} as const;
