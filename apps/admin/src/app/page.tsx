import Link from "next/link";
import { authCtx, requireUser } from "@/lib/auth/next";
import { getState } from "@/lib/content/service";
import { logoutAction } from "./actions";
import { sections } from "./kontent/sections";

// Saytni boshqarish: tahrir, qoralama va nashr holati.
export default async function Page() {
  const u = await requireUser();
  const canEdit = u.roles.includes("admin") || u.roles.includes("editor");
  const { db } = await authCtx();
  const states = canEdit ? await Promise.all(sections.map((s) => getState({ db }, s.type, s.key))) : [];
  return (
    <main className="wrap wide">
      <div className="top">
        <div><p className="eyebrow">MeningFermam · boshqaruv</p><h1>Xush kelibsiz, {u.name}</h1></div>
        <nav>
          <Link className="btn ghost" href="/hisob">Hisob</Link>
          {canEdit && <Link className="btn ghost" href="/media">Rasm va video</Link>}
          <form action={logoutAction}><button className="btn ghost" type="submit">Chiqish</button></form>
        </nav>
      </div>
      {canEdit ? (
        <section className="card">
          <h2>Saytni tahrirlash</h2>
          <p className="muted">Dizayn, matnlar, bo‘limlar va sahifalarni shu yerdan boshqaring. Avval qoralama saqlang, keyin tekshirib nashr qiling.</p>
          <ul className="sections">
            {sections.map((s, i) => {
              const st = states[i]!;
              const pending = st.latest && !st.latest.published;
              return (
                <li key={s.slug}>
                  <Link href={`/kontent/${s.slug}`}><b>{s.title}</b></Link>
                  <small>{s.hint}</small>
                  <small>
                    {st.published ? `Saytda: ${st.published.number}-versiya` : "Hali nashr qilinmagan"}
                    {pending ? ` · nashrni kutmoqda: ${st.latest!.number}-versiya` : ""}
                  </small>
                </li>
              );
            })}
          </ul>
          <div className="workflow" aria-label="Tahrirlash tartibi"><span><b>1</b> Tahrirlang</span><span><b>2</b> Qoralama saqlang</span><span><b>3</b> Nashr qiling</span></div>
          <p className="hint">Har nashr tarixda qoladi. Kerak bo‘lsa eski versiyadan yangi qoralama yaratib, saytni avvalgi ko‘rinishga qaytarishingiz mumkin.</p>
        </section>
      ) : (
        <section className="card"><p className="muted">Sizning rolingiz uchun bu bosqichda tahrirlanadigan bo‘lim yo‘q.</p></section>
      )}
    </main>
  );
}
