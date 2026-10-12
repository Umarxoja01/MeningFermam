import type { CmsWebsite, Contacts, Feature } from "@meningfermam/content";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authCtx, requireUser } from "@/lib/auth/next";
import { diff, getState, getVersion } from "@/lib/content/service";
import { restoreAction, submitAction } from "../actions";
import { ContactsEditor, FaqEditor, FeaturesEditor, PublishForm } from "../editors";
import { sectionOf } from "../sections";
import { WebsiteEditor } from "../website-editor";
import { defaultWebsite } from "../../../../../sayt/src/content/cms-defaults";

const fmt = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" });
const STATUS: Record<string, string> = { draft: "Qoralama", review: "Ko‘rib chiqishda", returned: "Qaytarildi", approved: "Tasdiqlangan" };
const show = (v: unknown) => (v === undefined ? "—" : v === null ? "(bo‘sh)" : typeof v === "string" ? v : JSON.stringify(v));

export default async function Page({ params, searchParams }: { params: Promise<{ tur: string }>; searchParams: Promise<{ farq?: string }> }) {
  const u = await requireUser(["admin", "editor"]);
  const { tur } = await params;
  const sec = sectionOf(tur);
  if (!sec) notFound();
  const { db } = await authCtx();
  const st = await getState({ db }, sec.type, sec.key);
  const isAdmin = u.roles.includes("admin");
  const base = st.latest?.number ?? 0;

  // key={base}: yangi versiya (masalan, tiklash) paydo bo'lsa tahrirlovchi undan qayta boshlanadi
  // farq: tanlangan versiya ↔ saytdagi (nashr qilingan) versiya
  const farqN = Number((await searchParams).farq);
  const farqV = Number.isInteger(farqN) && farqN > 0 ? await getVersion({ db }, sec.type, sec.key, farqN) : null;
  const changes = farqV ? diff(st.published?.data ?? null, farqV.data) : null;

  return (
    <main className="wrap wide">
      <div className="top">
        <h1>{sec.title}</h1>
        <nav><Link className="btn ghost" href="/">Bosh ekran</Link></nav>
      </div>

      <section className="card status">
        {st.published
          ? <p>Saytda: <b>{st.published.number}-versiya</b> · nashr: {fmt.format(st.published.publishedAt)}, {st.published.publishedBy}</p>
          : <p>Hali nashr qilinmagan.</p>}
        {st.latest && !st.latest.published && (
          <>
            <p>Oxirgi: <b>{st.latest.number}-versiya</b> — {STATUS[st.latest.status] ?? st.latest.status} ({st.latest.authorName}). Saytda hali ko‘rinmaydi.</p>
            {isAdmin
              ? <PublishForm tur={sec.slug} number={st.latest.number} />
              : st.latest.status === "draft" && (
                <form action={submitAction}>
                  <input type="hidden" name="tur" value={sec.slug} /><input type="hidden" name="number" value={st.latest.number} />
                  <button className="btn" type="submit">Administratorga ko‘rib chiqishga yuborish</button>
                </form>
              )}
          </>
        )}
        <p className="hint">Qoralama saytni o‘zgartirmaydi. Nashr qilingan versiya CMS ulangan saytda ko‘rinadi.</p>
      </section>

      {sec.type === "website" ? (
        <WebsiteEditor key={base} tur={sec.slug} base={base} initial={st.latest ? st.latest.data as CmsWebsite : defaultWebsite} />
      ) : !st.latest ? (
        <section className="card">
          <p>Bu bo‘limda hali kontent yo‘q. Saytdagi joriy qiymatlarni yuklash uchun serverda bir marta:</p>
          <pre className="cmd">npm run content:seed -w apps/admin -- --by {u.login}</pre>
        </section>
      ) : sec.type === "contacts" ? (
        <ContactsEditor key={base} tur={sec.slug} base={base} initial={st.latest.data as Contacts} />
      ) : sec.type === "features" ? (
        <FeaturesEditor key={base} tur={sec.slug} base={base} initial={st.latest.data as Feature[]} />
      ) : (
        <FaqEditor key={base} tur={sec.slug} base={base} initial={st.latest.data as { title: string; items: { q: string; a: string }[] }[]} />
      )}

      {changes && farqV && (
        <section className="card" id="farq">
          <h2>{farqV.number}-versiya ↔ saytdagi versiya: {changes.length ? `${changes.length} ta o‘zgarish` : "farq yo‘q"}</h2>
          {changes.length > 0 && (
            <table className="diff">
              <thead><tr><th scope="col">Maydon</th><th scope="col">Saytda</th><th scope="col">{farqV.number}-versiyada</th></tr></thead>
              <tbody>{changes.slice(0, 100).map((ch) => <tr key={ch.path}><th scope="row">{ch.path}</th><td>{show(ch.before)}</td><td>{show(ch.after)}</td></tr>)}</tbody>
            </table>
          )}
        </section>
      )}

      {st.versions.length > 0 && (
        <section className="card">
          <h2>Versiyalar tarixi</h2>
          <ul className="versions">
            {st.versions.map((v) => (
              <li key={v.id}>
                <span><b>{v.number}-versiya</b> · {STATUS[v.status] ?? v.status}{v.published ? " · saytda" : ""}</span>
                <small>{v.authorName}, {fmt.format(v.createdAt)}</small>
                <span className="vact">
                  <Link className="btn ghost small" href={`/kontent/${sec.slug}?farq=${v.number}#farq`}>Farqni ko‘rish</Link>
                  {v.number !== base && (
                    <form action={restoreAction}>
                      <input type="hidden" name="tur" value={sec.slug} /><input type="hidden" name="from" value={v.number} /><input type="hidden" name="base" value={base} />
                      <button className="btn ghost small" type="submit">Shu versiyadan qoralama</button>
                    </form>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="hint">Eski versiyaga qaytish yangi qoralama yaratadi; tarix o‘chmaydi. Saytga chiqishi uchun uni nashr qiling.</p>
        </section>
      )}
    </main>
  );
}
