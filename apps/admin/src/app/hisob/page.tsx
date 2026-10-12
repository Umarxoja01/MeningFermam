import Link from "next/link";
import { authCtx, requireUser } from "@/lib/auth/next";
import { listSessions } from "@/lib/auth/service";
import { logoutAllAction } from "../actions";
import { PasswordForm } from "../forms";

const fmt = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" });

export default async function Page() {
  const u = await requireUser();
  const sessions = await listSessions(await authCtx(), u.id);
  return (
    <main className="wrap wide">
      <div className="top">
        <h1>Hisob</h1>
        <nav><Link className="btn ghost" href="/">Bosh ekran</Link></nav>
      </div>
      <section className="card">
        <h2>{u.name}</h2>
        <p className="muted">{u.login} · rol: {u.roles.join(", ")}</p>
      </section>
      <section className="card">
        <h2>Faol sessiyalar ({sessions.length})</h2>
        <ul className="sessions">
          {sessions.map((s) => (
            <li key={s.id}>
              <span>{s.userAgent?.slice(0, 80) ?? "Noma’lum qurilma"}{s.id === u.sessionId ? " — shu qurilma" : ""}</span>
              <small>Kirgan: {fmt.format(s.createdAt)} · oxirgi faollik: {fmt.format(s.lastSeenAt)}{s.ipPrefix ? ` · ${s.ipPrefix}` : ""}</small>
            </li>
          ))}
        </ul>
        <form action={logoutAllAction}><button className="btn danger" type="submit">Hamma qurilmalardan chiqish</button></form>
      </section>
      <section className="card">
        <h2>Parolni o‘zgartirish</h2>
        <PasswordForm />
      </section>
    </main>
  );
}
