// Next.js bilan bog'lash: baza, cookie, so'rov ma'lumoti, sahifa himoyasi. Faqat serverda (ADMIN_TZ §4.3).
import "server-only";
import { openDb, type DbHandle } from "@meningfermam/db";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AUTH } from "./config";
import { keysFrom, sha256 } from "./crypto";
import { isPwned } from "./password";
import { getSessionUser, type AuthCtx, type ClientMeta, type Role, type SessionUser } from "./service";
import { schema } from "@meningfermam/db";
import { eq } from "drizzle-orm";

const databaseGlobal = globalThis as typeof globalThis & { meningFermamAdminDb?: { url: string; handle: Promise<DbHandle> } };

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} serverdagi env'da berilmagan`);
  return v;
}

/** Baza va kalitlar faqat server env'dan (DATABASE_URL, ADMIN_ENC_KEY); NEXT_PUBLIC_ emas. */
export async function authCtx(): Promise<AuthCtx> {
  const url = env("DATABASE_URL");
  if (databaseGlobal.meningFermamAdminDb?.url !== url) {
    databaseGlobal.meningFermamAdminDb = { url, handle: openDb(url) };
  }
  const { db } = await databaseGlobal.meningFermamAdminDb.handle;
  return { db, keys: keysFrom(env("ADMIN_ENC_KEY")), pwnedCheck: process.env.PWNED_CHECK === "1" ? (pw) => isPwned(pw) : undefined };
}

/** IP faqat ishonchli proxy (Caddy/nginx) orqasida olinadi: TRUST_PROXY=1. Aks holda IP cheklovi o'chiq. */
export async function clientMeta(): Promise<ClientMeta> {
  const h = await headers();
  const ip = process.env.TRUST_PROXY === "1" ? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null : null;
  return { ip, userAgent: h.get("user-agent") };
}

export async function readToken() {
  return (await cookies()).get(AUTH.cookie)?.value;
}

/** __Host- cookie: HttpOnly, Secure, SameSite=Strict, Path=/ (ADMIN_TZ §4.2). Faqat server action ichida chaqiriladi. */
export async function setToken(token: string, ttlMs: number) {
  (await cookies()).set(AUTH.cookie, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: Math.floor(ttlMs / 1000) });
}

export async function clearToken() {
  (await cookies()).delete({ name: AUTH.cookie, path: "/", secure: true, sameSite: "strict", httpOnly: true });
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = await readToken();
  if (!token) return null;
  return getSessionUser(await authCtx(), token);
}

/** Har himoyalangan sahifa va server action boshida. Standart — rad etish. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/kirish");
  if (roles && !roles.some((r) => u.roles.includes(r))) notFound();
  return u;
}

/** Oraliq sessiya bosqichi (kod/sozlash sahifalariga ruxsat uchun). */
export async function pendingStage(): Promise<"mfa" | "setup" | null> {
  const token = await readToken();
  if (!token) return null;
  const { db } = await authCtx();
  const [s] = await db.select({ stage: schema.session.stage, expiresAt: schema.session.expiresAt }).from(schema.session).where(eq(schema.session.tokenHash, sha256(token)));
  if (!s || s.expiresAt <= new Date() || s.stage === "full") return null;
  return s.stage;
}
