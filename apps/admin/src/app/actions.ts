"use server";
// Server action'lar (ADMIN_TZ §4.3–4.5): har biri o'zi tekshiradi. Next.js server action'lari Origin'ni tekshiradi;
// cookie SameSite=Strict — boshqa saytdan yuborilgan so'rov sessiyasiz keladi.
import { redirect } from "next/navigation";
import { AUTH } from "@/lib/auth/config";
import { authCtx, clearToken, clientMeta, readToken, requireUser, setToken } from "@/lib/auth/next";
import * as auth from "@/lib/auth/service";

export type FormState = { error?: string; errors?: string[]; codes?: string[] } | null;

const MSG = {
  invalid: "Telefon raqami yoki parol noto‘g‘ri.",
  limited: "Urinishlar juda ko‘p. Birozdan keyin qayta urinib ko‘ring.",
  code: "Kod noto‘g‘ri. Ilovadagi yangi kodni kiriting.",
  expired: "Vaqt tugadi yoki urinishlar tugadi. Qaytadan kiring.",
};

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").slice(0, max);

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const r = await auth.login(await authCtx(), { login: str(fd, "login", 40), password: str(fd, "password", 200), ...(await clientMeta()) });
  if (!r.ok) return { error: MSG[r.error] };
  await setToken(r.token, AUTH.pendingMs);
  redirect(r.stage === "mfa" ? "/kirish/kod" : "/kirish/sozlash");
}

export async function mfaAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const r = await auth.verifyMfa(await authCtx(), { token: await readToken(), code: str(fd, "code", 20), ...(await clientMeta()) });
  if (!r.ok) {
    if (r.error !== "invalid") { await clearToken(); return { error: r.error === "limited" ? MSG.limited : MSG.expired }; }
    return { error: MSG.code };
  }
  await setToken(r.token, AUTH.absoluteMs);
  redirect("/");
}

export async function setupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const r = await auth.confirmSetup(await authCtx(), { token: await readToken(), code: str(fd, "code", 20), ...(await clientMeta()) });
  if (!r.ok) {
    if (r.error === "expired") { await clearToken(); return { error: MSG.expired }; }
    return { error: MSG.code };
  }
  await setToken(r.token, AUTH.absoluteMs);
  // zaxira kodlar faqat shu javobda bir marta ko'rsatiladi
  return { codes: r.recoveryCodes };
}

export async function logoutAction() {
  await auth.logout(await authCtx(), await readToken(), await clientMeta());
  await clearToken();
  redirect("/kirish");
}

export async function logoutAllAction() {
  const u = await requireUser();
  await auth.logoutAll(await authCtx(), u.id, await clientMeta());
  await clearToken();
  redirect("/kirish");
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  if (str(fd, "next") !== str(fd, "next2")) return { errors: ["Yangi parol ikki marta bir xil yozilsin"] };
  const r = await auth.changePassword(await authCtx(), { userId: u.id, current: str(fd, "current"), next: str(fd, "next"), code: str(fd, "code", 20), ...(await clientMeta()) });
  if (!r.ok) return { errors: r.errors };
  await clearToken();
  redirect("/kirish?parol=1");
}
