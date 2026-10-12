"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction, loginAction, mfaAction, setupAction, type FormState } from "./actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="btn" type="submit" disabled={pending}>{pending ? "Tekshirilmoqda…" : children}</button>;
}

function Errors({ state }: { state: FormState }) {
  const list = state?.errors ?? (state?.error ? [state.error] : []);
  if (!list.length) return null;
  return <div className="alert" role="alert">{list.map((e) => <p key={e}>{e}</p>)}</div>;
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="form">
      <Errors state={state} />
      <label className="field">Telefon raqami (login)
        <input name="login" type="tel" inputMode="tel" autoComplete="username" placeholder="+998 99 123 45 67" required maxLength={20} />
      </label>
      <label className="field">Parol
        <input name="password" type="password" autoComplete="current-password" required maxLength={128} />
      </label>
      <Submit>Davom etish</Submit>
    </form>
  );
}

export function MfaForm() {
  const [state, action] = useActionState(mfaAction, null);
  return (
    <form action={action} className="form">
      <Errors state={state} />
      <label className="field">Ilovadagi 6 xonali kod yoki zaxira kod
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={12} autoFocus />
      </label>
      <Submit>Kirish</Submit>
    </form>
  );
}

export function SetupForm({ done }: { done: boolean }) {
  const [state, action] = useActionState(setupAction, null);
  if (done && !state?.codes) {
    return (
      <div className="form">
        <div className="ok" role="status">Ikki bosqichli kirish allaqachon yoqilgan.</div>
        <Link className="btn" href="/">Bosh ekran</Link>
      </div>
    );
  }
  if (state?.codes) {
    return (
      <div className="form">
        <div className="ok" role="status">Ikki bosqichli kirish yoqildi.</div>
        <p><b>Zaxira kodlar.</b> Telefon yo‘qolsa, shu kodlardan biri bilan kirasiz. Har biri bir marta ishlaydi. Hozir yozib oling yoki xavfsiz joyda saqlang — ular boshqa ko‘rsatilmaydi.</p>
        <ul className="codes">{state.codes.map((c) => <li key={c}><code>{c}</code></li>)}</ul>
        <Link className="btn" href="/">Yozib oldim, davom etish</Link>
      </div>
    );
  }
  return (
    <form action={action} className="form">
      <Errors state={state} />
      <label className="field">Ilovadagi 6 xonali kod
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={7} />
      </label>
      <Submit>Tasdiqlash</Submit>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);
  return (
    <form action={action} className="form">
      <Errors state={state} />
      <label className="field">Joriy parol
        <input name="current" type="password" autoComplete="current-password" required maxLength={128} />
      </label>
      <label className="field">Yangi parol (kamida 12 belgi)
        <input name="next" type="password" autoComplete="new-password" required minLength={12} maxLength={128} />
      </label>
      <label className="field">Yangi parol yana bir marta
        <input name="next2" type="password" autoComplete="new-password" required minLength={12} maxLength={128} />
      </label>
      <label className="field">Ilovadagi 6 xonali kod
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={7} />
      </label>
      <p className="hint">Parol o‘zgargach, barcha qurilmalardan chiqasiz va yangi parol bilan qayta kirasiz.</p>
      <Submit>Parolni o‘zgartirish</Submit>
    </form>
  );
}
