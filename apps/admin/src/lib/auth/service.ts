// Kirish xizmati (ADMIN_TZ §4.1–4.3, §4.8; AQ01–AQ03, AQ12, AQ13). Next.js'ga bog'liq emas: baza, kalitlar va soat
// tashqaridan beriladi — muddat va bloklar testda aniq sinaladi.
import { schema, type Db } from "@meningfermam/db";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { AUTH } from "./config";
import { decrypt, encrypt, mac, randomToken, sha256, type Keys } from "./crypto";
import { hashPassword, passwordProblems, verifyPassword } from "./password";
import { newTotpSecret, totpUri, verifyTotp } from "./totp";

const { adminUser, userRole, session, loginAttempt, recoveryCode, auditEvent } = schema;

export type Role = "admin" | "editor" | "clinical";
export type AuthCtx = {
  db: Db;
  keys: Keys;
  now?: () => Date;
  /** Sizib chiqqan parol tekshiruvi (PWNED_CHECK); berilmasa o'tkazib yuboriladi. */
  pwnedCheck?: (pw: string) => Promise<boolean | null>;
};
export type ClientMeta = { ip?: string | null; userAgent?: string | null };
export type SessionUser = { id: number; login: string; name: string; roles: Role[]; sessionId: number };

const nowOf = (c: AuthCtx) => (c.now ? c.now() : new Date());
const plus = (d: Date, ms: number) => new Date(d.getTime() + ms);

/** "+998 99 618 03 00", "998996180300", "996180300" → "+998996180300"; aks holda null. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("998")) return `+${d}`;
  if (d.length === 9) return `+998${d}`;
  return null;
}

/** IP manzilni qisqartirish (shaxsiy ma'lumot kamroq): IPv4 /24, IPv6 /48. */
export function ipPrefix(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const v = ip.trim().replace(/^::ffff:/, "");
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/.exec(v);
  if (v4) return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  if (v.includes(":")) return `${v.split(":").slice(0, 3).join(":")}::/48`;
  return null;
}

async function audit(c: AuthCtx, e: { userId?: number | null; action: string; objectType?: string; objectId?: string; ip?: string | null; result: "ok" | "denied" | "error" }) {
  await c.db.insert(auditEvent).values({
    at: nowOf(c), userId: e.userId ?? null, action: e.action, objectType: e.objectType ?? null, objectId: e.objectId ?? null, ipPrefix: e.ip ?? null, result: e.result,
  });
}

async function createSession(c: AuthCtx, db: Db, userId: number, stage: "mfa" | "setup" | "full", meta: ClientMeta) {
  const now = nowOf(c);
  const token = randomToken();
  const [row] = await db.insert(session).values({
    userId, tokenHash: sha256(token), stage, createdAt: now, lastSeenAt: now,
    expiresAt: plus(now, stage === "full" ? AUTH.absoluteMs : AUTH.pendingMs),
    ipPrefix: ipPrefix(meta.ip), userAgent: meta.userAgent?.slice(0, 200) ?? null,
  }).returning({ id: session.id });
  return { token, id: row!.id };
}

/** Xato: ketma-ket 5 tadan keyin blok; har keyingi blok 2 baravar uzun (24 soatgacha). */
async function registerFailure(c: AuthCtx, u: typeof adminUser.$inferSelect, ip: string | null) {
  const now = nowOf(c);
  const fails = u.failedLogins + 1;
  if (fails >= AUTH.maxFails) {
    const ms = Math.min(AUTH.lockBaseMs * 2 ** u.lockCount, AUTH.lockMaxMs);
    await c.db.update(adminUser).set({ failedLogins: 0, lockCount: u.lockCount + 1, lockedUntil: plus(now, ms) }).where(eq(adminUser.id, u.id));
    await audit(c, { userId: u.id, action: "account_locked", ip, result: "denied" });
  } else {
    await c.db.update(adminUser).set({ failedLogins: fails }).where(eq(adminUser.id, u.id));
  }
}

async function recentFails(c: AuthCtx, where: ReturnType<typeof eq>, windowMs: number) {
  const [r] = await c.db.select({ n: count() }).from(loginAttempt)
    .where(and(where, eq(loginAttempt.ok, false), gt(loginAttempt.at, new Date(nowOf(c).getTime() - windowMs))));
  return r?.n ?? 0;
}

export type LoginResult = { ok: true; token: string; stage: "mfa" | "setup" } | { ok: false; error: "invalid" | "limited" };

/** 1-qadam: telefon + parol. Xato xabari umumiy; login mavjudligi javob yoki vaqt orqali bilinmaydi. */
export async function login(c: AuthCtx, input: { login: string; password: string } & ClientMeta): Promise<LoginResult> {
  const now = nowOf(c);
  const ip = ipPrefix(input.ip);
  const phone = normalizePhone(input.login);
  const key = phone ?? input.login.slice(0, 40);

  const ipLimited = ip ? (await recentFails(c, eq(loginAttempt.ipPrefix, ip), AUTH.ipWindowMs)) >= AUTH.ipMaxFails : false;
  const [u] = phone && !ipLimited ? await c.db.select().from(adminUser).where(eq(adminUser.login, phone)) : [];
  const passOk = await verifyPassword(u?.passwordHash ?? null, input.password);
  const locked = !!u?.lockedUntil && u.lockedUntil > now;
  // mavjud bo'lmagan login uchun ham bir xil "cheklangan" javob (hisob borligini bilib bo'lmasin)
  const phantomLimited = !u && (await recentFails(c, eq(loginAttempt.login, key), AUTH.lockBaseMs)) >= AUTH.maxFails;

  if (ipLimited || !u || !u.active || locked || !passOk) {
    await c.db.insert(loginAttempt).values({ login: key, ipPrefix: ip, ok: false, at: now });
    if (u && u.active && !locked && !ipLimited) await registerFailure(c, u, ip);
    await audit(c, { userId: u?.id, action: ipLimited ? "login_ip_limited" : "login_password", ip, result: "denied" });
    return { ok: false, error: ipLimited || locked || phantomLimited ? "limited" : "invalid" };
  }

  await c.db.insert(loginAttempt).values({ login: key, ipPrefix: ip, ok: true, at: now });
  await c.db.update(adminUser).set({ failedLogins: 0 }).where(eq(adminUser.id, u.id));
  const stage = u.totpEnabled ? "mfa" : "setup";
  const s = await createSession(c, c.db, u.id, stage, input);
  await audit(c, { userId: u.id, action: "login_password", ip, result: "ok" });
  return { ok: true, token: s.token, stage };
}

/** Oraliq sessiya (kod yoki sozlash bosqichi). Muddati o'tgan bo'lsa o'chiriladi. */
async function pending(c: AuthCtx, token: string | undefined, stage: "mfa" | "setup") {
  if (!token) return null;
  const [row] = await c.db.select({ s: session, u: adminUser }).from(session).innerJoin(adminUser, eq(session.userId, adminUser.id))
    .where(eq(session.tokenHash, sha256(token)));
  if (!row) return null;
  if (row.s.stage !== stage || row.s.expiresAt <= nowOf(c) || !row.u.active) {
    if (row.s.stage !== "full") await c.db.delete(session).where(eq(session.id, row.s.id));
    return null;
  }
  return row;
}

/** Oraliq sessiyani yopib, yangi tokenli to'liq sessiya ochish (session fixation'ga qarshi). */
async function promote(c: AuthCtx, row: { s: typeof session.$inferSelect; u: typeof adminUser.$inferSelect }, meta: ClientMeta, extra: Partial<typeof adminUser.$inferInsert>) {
  return c.db.transaction(async (tx) => {
    await tx.delete(session).where(eq(session.id, row.s.id));
    await tx.update(adminUser).set({ ...extra, failedLogins: 0, lockCount: 0, lockedUntil: null, lastLoginAt: nowOf(c) }).where(eq(adminUser.id, row.u.id));
    return createSession(c, tx as unknown as Db, row.u.id, "full", meta);
  });
}

async function mfaFailure(c: AuthCtx, row: { s: typeof session.$inferSelect; u: typeof adminUser.$inferSelect }, ip: string | null, action: string) {
  const attempts = row.s.mfaAttempts + 1;
  if (attempts >= AUTH.mfaMaxAttempts) await c.db.delete(session).where(eq(session.id, row.s.id));
  else await c.db.update(session).set({ mfaAttempts: attempts }).where(eq(session.id, row.s.id));
  await registerFailure(c, row.u, ip);
  await audit(c, { userId: row.u.id, action, ip, result: "denied" });
  return { ok: false as const, error: attempts >= AUTH.mfaMaxAttempts ? ("expired" as const) : ("invalid" as const) };
}

const RECOVERY_RE = /^[a-z2-7]{4}-?[a-z2-7]{4}$/i;
const normRecovery = (s: string) => s.trim().toLowerCase().replace("-", "");

export type MfaResult = { ok: true; token: string } | { ok: false; error: "invalid" | "expired" | "limited" };

/** 2-qadam: telefondagi ilova kodi yoki zaxira kod. */
export async function verifyMfa(c: AuthCtx, input: { token: string | undefined; code: string } & ClientMeta): Promise<MfaResult> {
  const ip = ipPrefix(input.ip);
  const row = await pending(c, input.token, "mfa");
  if (!row) return { ok: false, error: "expired" };
  if (row.u.lockedUntil && row.u.lockedUntil > nowOf(c)) {
    await c.db.delete(session).where(eq(session.id, row.s.id));
    return { ok: false, error: "limited" };
  }
  const code = input.code.trim();
  if (/^\d{3}\s?\d{3}$/.test(code) && row.u.totpSecretEnc) {
    const step = verifyTotp(decrypt(c.keys, row.u.totpSecretEnc), code, nowOf(c).getTime(), row.u.totpLastStep);
    if (step === null) return mfaFailure(c, row, ip, "login_mfa");
    const s = await promote(c, row, input, { totpLastStep: step });
    await audit(c, { userId: row.u.id, action: "login", ip, result: "ok" });
    return { ok: true, token: s.token };
  }
  if (RECOVERY_RE.test(code)) {
    const used = await c.db.update(recoveryCode).set({ usedAt: nowOf(c) })
      .where(and(eq(recoveryCode.userId, row.u.id), eq(recoveryCode.codeHash, mac(c.keys, normRecovery(code))), isNull(recoveryCode.usedAt)))
      .returning({ id: recoveryCode.id });
    if (!used.length) return mfaFailure(c, row, ip, "login_recovery");
    const s = await promote(c, row, input, {});
    await audit(c, { userId: row.u.id, action: "login_recovery_code", ip, result: "ok" });
    return { ok: true, token: s.token };
  }
  return mfaFailure(c, row, ip, "login_mfa");
}

/** Birinchi kirish: ikki bosqichli kirishni sozlash uchun sir (QR). Tasdiqlanmaguncha yoqilmaydi. */
export async function beginSetup(c: AuthCtx, token: string | undefined) {
  const row = await pending(c, token, "setup");
  if (!row || row.u.totpEnabled) return null;
  let secret: string;
  if (row.u.totpSecretEnc) secret = decrypt(c.keys, row.u.totpSecretEnc);
  else {
    secret = newTotpSecret();
    await c.db.update(adminUser).set({ totpSecretEnc: encrypt(c.keys, secret) }).where(eq(adminUser.id, row.u.id));
  }
  return { secret, uri: totpUri(secret, row.u.login), login: row.u.login };
}

const B32 = "abcdefghijklmnopqrstuvwxyz234567";
function newRecoveryCode() {
  const b = randomBytes(8);
  const s = Array.from(b, (x) => B32[x % 32]).join("");
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export type SetupResult = { ok: true; token: string; recoveryCodes: string[] } | { ok: false; error: "invalid" | "expired" };

/** Sozlashni kod bilan tasdiqlash: yoqiladi, 10 ta zaxira kod bir marta ko'rsatiladi (bazada faqat HMAC). */
export async function confirmSetup(c: AuthCtx, input: { token: string | undefined; code: string } & ClientMeta): Promise<SetupResult> {
  const ip = ipPrefix(input.ip);
  const row = await pending(c, input.token, "setup");
  if (!row || row.u.totpEnabled || !row.u.totpSecretEnc) return { ok: false, error: "expired" };
  const step = verifyTotp(decrypt(c.keys, row.u.totpSecretEnc), input.code, nowOf(c).getTime(), row.u.totpLastStep);
  if (step === null) {
    const r = await mfaFailure(c, row, ip, "mfa_setup");
    return { ok: false, error: r.error === "expired" ? "expired" : "invalid" };
  }
  const codes = Array.from({ length: AUTH.recoveryCodes }, newRecoveryCode);
  await c.db.transaction(async (tx) => {
    await tx.delete(recoveryCode).where(eq(recoveryCode.userId, row.u.id));
    await tx.insert(recoveryCode).values(codes.map((k) => ({ userId: row.u.id, codeHash: mac(c.keys, normRecovery(k)), createdAt: nowOf(c) })));
  });
  const s = await promote(c, row, input, { totpEnabled: true, totpLastStep: step });
  await audit(c, { userId: row.u.id, action: "mfa_setup", ip, result: "ok" });
  return { ok: true, token: s.token, recoveryCodes: codes };
}

/** Har so'rovda: to'liq sessiya, muddat (12 soat), harakatsizlik (30 daqiqa), faol foydalanuvchi, rollar. */
export async function getSessionUser(c: AuthCtx, token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const now = nowOf(c);
  const [row] = await c.db.select({ s: session, u: adminUser }).from(session).innerJoin(adminUser, eq(session.userId, adminUser.id))
    .where(eq(session.tokenHash, sha256(token)));
  if (!row) return null;
  const idleOk = row.s.lastSeenAt.getTime() + AUTH.idleMs > now.getTime();
  if (row.s.stage !== "full" || row.s.expiresAt <= now || !idleOk || !row.u.active) {
    await c.db.delete(session).where(eq(session.id, row.s.id));
    return null;
  }
  if (now.getTime() - row.s.lastSeenAt.getTime() > AUTH.touchEveryMs) {
    await c.db.update(session).set({ lastSeenAt: now }).where(eq(session.id, row.s.id));
  }
  const roles = (await c.db.select({ role: userRole.role }).from(userRole).where(eq(userRole.userId, row.u.id))).map((r) => r.role);
  return { id: row.u.id, login: row.u.login, name: row.u.name, roles, sessionId: row.s.id };
}

export async function logout(c: AuthCtx, token: string | undefined, meta: ClientMeta = {}) {
  if (!token) return;
  const del = await c.db.delete(session).where(eq(session.tokenHash, sha256(token))).returning({ userId: session.userId });
  if (del[0]) await audit(c, { userId: del[0].userId, action: "logout", ip: ipPrefix(meta.ip), result: "ok" });
}

/** "Hamma qurilmalardan chiqish" va parol/rol o'zgarganda (AQ13). */
export async function logoutAll(c: AuthCtx, userId: number, meta: ClientMeta = {}, action = "logout_all") {
  await c.db.delete(session).where(eq(session.userId, userId));
  await audit(c, { userId, action, ip: ipPrefix(meta.ip), result: "ok" });
}

export async function listSessions(c: AuthCtx, userId: number) {
  return c.db.select({ id: session.id, createdAt: session.createdAt, lastSeenAt: session.lastSeenAt, ipPrefix: session.ipPrefix, userAgent: session.userAgent })
    .from(session).where(and(eq(session.userId, userId), eq(session.stage, "full"), gt(session.expiresAt, nowOf(c))));
}

async function checkNewPassword(c: AuthCtx, pw: string, ctx: { login: string; name: string }) {
  const problems = passwordProblems(pw, ctx);
  if (!problems.length && c.pwnedCheck && (await c.pwnedCheck(pw)) === true) problems.push("Bu parol internetda sizib chiqqan parollar ro‘yxatida bor");
  return problems;
}

export type ChangePasswordResult = { ok: true } | { ok: false; errors: string[] };

/** Parolni o'zgartirish: joriy parol + ilova kodi; keyin BARCHA sessiyalar yopiladi (AQ13). */
export async function changePassword(c: AuthCtx, input: { userId: number; current: string; next: string; code: string } & ClientMeta): Promise<ChangePasswordResult> {
  const [u] = await c.db.select().from(adminUser).where(eq(adminUser.id, input.userId));
  if (!u || !u.active) return { ok: false, errors: ["Hisob topilmadi"] };
  const ip = ipPrefix(input.ip);
  const passOk = await verifyPassword(u.passwordHash, input.current);
  const step = u.totpSecretEnc ? verifyTotp(decrypt(c.keys, u.totpSecretEnc), input.code, nowOf(c).getTime(), u.totpLastStep) : null;
  if (!passOk || step === null) {
    await registerFailure(c, u, ip);
    await audit(c, { userId: u.id, action: "password_change", ip, result: "denied" });
    return { ok: false, errors: ["Joriy parol yoki ilova kodi noto‘g‘ri"] };
  }
  const problems = await checkNewPassword(c, input.next, u);
  if (input.next === input.current) problems.push("Yangi parol eskisidan farq qilsin");
  if (problems.length) return { ok: false, errors: problems };
  await c.db.update(adminUser).set({ passwordHash: await hashPassword(input.next), passwordChangedAt: nowOf(c), totpLastStep: step, failedLogins: 0 }).where(eq(adminUser.id, u.id));
  await audit(c, { userId: u.id, action: "password_change", ip, result: "ok" });
  await logoutAll(c, u.id, input, "sessions_revoked_password");
  return { ok: true };
}

/** Birinchi (yoki keyingi) administratorni yaratish — faqat serverdagi buyruq orqali (ochiq ro'yxatdan o'tish yo'q). */
export async function createAdmin(c: AuthCtx, input: { login: string; name: string; password: string; role?: Role }) {
  const phone = normalizePhone(input.login);
  if (!phone) return { ok: false as const, errors: ["Telefon raqami +998XXXXXXXXX ko‘rinishida bo‘lsin"] };
  const name = input.name.trim();
  if (!name || name.length > 80) return { ok: false as const, errors: ["Ism 1–80 belgi bo‘lsin"] };
  const problems = await checkNewPassword(c, input.password, { login: phone, name });
  if (problems.length) return { ok: false as const, errors: problems };
  const [exists] = await c.db.select({ id: adminUser.id }).from(adminUser).where(eq(adminUser.login, phone));
  if (exists) return { ok: false as const, errors: ["Bu telefon raqami bilan foydalanuvchi bor"] };
  const passwordHash = await hashPassword(input.password);
  const id = await c.db.transaction(async (tx) => {
    const [u] = await tx.insert(adminUser).values({ login: phone, name, passwordHash, passwordChangedAt: nowOf(c), createdAt: nowOf(c) }).returning({ id: adminUser.id });
    await tx.insert(userRole).values({ userId: u!.id, role: input.role ?? "admin" });
    return u!.id;
  });
  await audit(c, { userId: id, action: "user_created", objectType: "admin_user", objectId: String(id), result: "ok" });
  return { ok: true as const, id };
}
