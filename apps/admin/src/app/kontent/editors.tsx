"use client";
// Kontent tahrirlovchilari (ADMIN_TZ §8). Holat brauzerda; "Qoralama saqlash" butun ma'lumotni JSON sifatida yuboradi,
// server uni umumiy sxema bilan tekshiradi. Inline style yo'q (CSP).
import type { Contacts, Faq, Feature, StatusKind, Vet } from "@meningfermam/content";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { publishAction, saveDraftAction, type EditState, type PublishState } from "./actions";

function Submit({ children, className = "btn" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending}>{pending ? "Saqlanmoqda…" : children}</button>;
}

function Messages({ state }: { state: EditState | PublishState }) {
  if (!state) return null;
  if (state.ok) return <div className="ok" role="status">{state.ok}</div>;
  if (!state.error) return null;
  return (
    <div className="alert" role="alert">
      <p>{state.error}</p>
      {state.errors && <ul>{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </div>
  );
}

/** Qoralama saqlash formasi: tahrirlovchi holatini JSON qilib yuboradi. */
export function DraftForm({ tur, base, data }: { tur: string; base: number; data: unknown }) {
  const [state, action] = useActionState(saveDraftAction, null);
  return (
    <form action={action} className="form savebar">
      <input type="hidden" name="tur" value={tur} />
      <input type="hidden" name="base" value={base} />
      <input type="hidden" name="data" value={JSON.stringify(data)} />
      <Messages state={state} />
      {state?.conflict && <details className="draft-copy"><summary>O‘z tahririmni nusxalash</summary><textarea aria-label="Saqlanmagan tahrir nusxasi" readOnly value={JSON.stringify(data, null, 2)} rows={8} onFocus={(e) => e.currentTarget.select()} /><p className="hint">Nusxani saqlab qo‘ying; sahifani yangilashdan oldin tahriringizni yo‘qotmang.</p></details>}
      <Submit>Qoralama saqlash</Submit>
    </form>
  );
}

const nullIfEmpty = (s: string) => (s.trim() ? s.trim() : null);
const handle = (s: string) => nullIfEmpty(s.replace(/^@/, ""));

function Text({ label, value, onChange, placeholder, type = "text", required, multiline }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; multiline?: boolean;
}) {
  return (
    <label className="field">{label}
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} rows={3} />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />}
    </label>
  );
}

function Mover({ i, n, onMove, onRemove, removeLabel, canRemove = true }: { i: number; n: number; onMove: (from: number, to: number) => void; onRemove: () => void; removeLabel: string; canRemove?: boolean }) {
  return (
    <div className="mover">
      <button type="button" className="btn ghost small" onClick={() => onMove(i, i - 1)} disabled={i === 0} aria-label="Yuqoriga">↑</button>
      <button type="button" className="btn ghost small" onClick={() => onMove(i, i + 1)} disabled={i === n - 1} aria-label="Pastga">↓</button>
      <button type="button" className="btn ghost small danger-text" onClick={onRemove} disabled={!canRemove}>{removeLabel}</button>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const out = [...list];
  const [x] = out.splice(from, 1);
  out.splice(to, 0, x!);
  return out;
}

const phoneText = (e164: string) => {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
};

// ---------------- Aloqa ----------------
export function ContactsEditor({ tur, base, initial }: { tur: string; base: number; initial: Contacts }) {
  const [c, setC] = useState<Contacts>(initial);
  const set = (patch: Partial<Contacts>) => setC((x) => ({ ...x, ...patch }));
  const setVet = (i: number, patch: Partial<Vet>) => set({ vets: c.vets.map((v, j) => (j === i ? { ...v, ...patch } : v)) });
  return (
    <div className="editor">
      <section className="card">
        <h2>MeningFermam</h2>
        <Text label="Asosiy telefon (+998XXXXXXXXX)" value={c.phone} onChange={(v) => set({ phone: v.replace(/[^\d+]/g, "") })} placeholder="+998996180300" required />
        <Text label="Ish vaqti" value={c.hours} onChange={(v) => set({ hours: v })} required />
        <Text label="Telegram (@ siz)" value={c.telegram ?? ""} onChange={(v) => set({ telegram: handle(v) })} />
        <Text label="Instagram (@ siz)" value={c.instagram ?? ""} onChange={(v) => set({ instagram: handle(v) })} />
        <Text label="Email (bo‘sh — saytda ko‘rinmaydi)" type="email" value={c.email ?? ""} onChange={(v) => set({ email: nullIfEmpty(v) })} />
        <Text label="Manzil (bo‘sh — saytda ko‘rinmaydi)" value={c.address ?? ""} onChange={(v) => set({ address: nullIfEmpty(v) })} />
      </section>
      <section className="card">
        <h2>Veterinarlar</h2>
        {c.vets.map((v, i) => (
          <fieldset key={i} className="item">
            <legend>{i + 1}-veterinar</legend>
            <Text label="Sarlavha" value={v.title} onChange={(x) => setVet(i, { title: x })} required />
            <Text label="Ism (ixtiyoriy)" value={v.name ?? ""} onChange={(x) => setVet(i, { name: nullIfEmpty(x) })} />
            <Text label="Telefon (+998XXXXXXXXX)" value={v.phone} onChange={(x) => setVet(i, { phone: x.replace(/[^\d+]/g, "") })} required />
            <Text label="Telegram (@ siz, ixtiyoriy)" value={v.telegram ?? ""} onChange={(x) => setVet(i, { telegram: handle(x) })} />
            <Mover i={i} n={c.vets.length} onMove={(a, b) => set({ vets: move(c.vets, a, b) })} onRemove={() => set({ vets: c.vets.filter((_, j) => j !== i) })} removeLabel="O‘chirish" canRemove={c.vets.length > 1} />
          </fieldset>
        ))}
        {c.vets.length < 20 && (
          <button type="button" className="btn ghost" onClick={() => set({ vets: [...c.vets, { title: "Veterinar", name: null, phone: "+998", telegram: null }] })}>+ Veterinar qo‘shish</button>
        )}
      </section>
      <section className="card preview" aria-label="Saytda qanday ko‘rinadi">
        <h2>Ko‘rinish (footer)</h2>
        <div className="pv-cols">
          <div><b>Aloqa</b><ul>
            <li className="pv-big">{phoneText(c.phone)}</li><li>{c.hours}</li>
            {c.telegram && <li>Telegram: @{c.telegram}</li>}
            {c.instagram && <li>Instagram: @{c.instagram}</li>}
            {c.email && <li>{c.email}</li>}
            {c.address && <li>{c.address}</li>}
          </ul></div>
          <div><b>Veterinar</b><ul>
            {c.vets.map((v, i) => <li key={i}>{v.name ? `${v.name}: ` : ""}{phoneText(v.phone)}{v.telegram ? ` · @${v.telegram}` : ""}</li>)}
          </ul></div>
        </div>
      </section>
      <DraftForm tur={tur} base={base} data={c} />
    </div>
  );
}

// ---------------- Funksiyalar holati ----------------
const KINDS: { value: StatusKind; label: string }[] = [{ value: "on", label: "Namuna" }, { value: "pr", label: "Jarayonda" }, { value: "soon", label: "Rejada" }];

function newId(title: string, taken: Set<string>) {
  const base = title.toLowerCase().replace(/[‘’'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "funksiya";
  let id = base.length >= 2 ? base : `f-${base}`;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
}

export function FeaturesEditor({ tur, base, initial }: { tur: string; base: number; initial: Feature[] }) {
  const [list, setList] = useState<Feature[]>(initial);
  const setAt = (i: number, patch: Partial<Feature>) => setList((l) => l.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const [tab, setTab] = useState<StatusKind>("on");
  return (
    <div className="editor">
      <section className="card">
        <h2>Funksiyalar ({list.length})</h2>
        {list.map((f, i) => (
          <fieldset key={f.id} className="item">
            <legend>{f.emoji} {f.title || "Yangi funksiya"} <small className="muted">id: {f.id}</small></legend>
            <div className="row2">
              <Text label="Belgi (emoji)" value={f.emoji} onChange={(v) => setAt(i, { emoji: v.slice(0, 8) })} required />
              <label className="field">Holati
                <select value={f.kind} onChange={(e) => setAt(i, { kind: e.target.value as StatusKind })}>
                  {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </label>
            </div>
            <Text label="Nomi" value={f.title} onChange={(v) => setAt(i, { title: v })} required />
            <Text label="Izoh (ixtiyoriy, “Tez orada” sahifasida)" value={f.note ?? ""} onChange={(v) => setAt(i, { note: v.trim() ? v : undefined })} />
            <Mover i={i} n={list.length} onMove={(a, b) => setList((l) => move(l, a, b))} onRemove={() => setList((l) => l.filter((_, j) => j !== i))} removeLabel="O‘chirish" />
          </fieldset>
        ))}
        <button type="button" className="btn ghost" onClick={() => setList((l) => [...l, { id: newId(`yangi-${l.length + 1}`, new Set(l.map((x) => x.id))), kind: "soon", emoji: "✨", title: "" }])}>+ Funksiya qo‘shish</button>
        <p className="hint">Har tabda kamida bitta funksiya bo‘lishi kerak.</p>
      </section>
      <section className="card preview" aria-label="Saytda qanday ko‘rinadi">
        <h2>Ko‘rinish (bosh sahifa tablari)</h2>
        <div className="pv-tabs" role="tablist" aria-label="Ko‘rinish tablari">
          {KINDS.map((k) => <button key={k.value} type="button" role="tab" aria-selected={tab === k.value} className={tab === k.value ? "on" : ""} onClick={() => setTab(k.value)}>{k.label}</button>)}
        </div>
        <ul className="pv-grid">
          {list.filter((f) => f.kind === tab).map((f) => <li key={f.id}><span aria-hidden="true">{f.emoji}</span> <b>{f.title}</b></li>)}
        </ul>
      </section>
      <DraftForm tur={tur} base={base} data={list} />
    </div>
  );
}

// ---------------- Savol-javob ----------------
type Group = { title: string; items: Faq[] };

export function FaqEditor({ tur, base, initial }: { tur: string; base: number; initial: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initial);
  const setG = (gi: number, patch: Partial<Group>) => setGroups((gs) => gs.map((g, j) => (j === gi ? { ...g, ...patch } : g)));
  const setQ = (gi: number, qi: number, patch: Partial<Faq>) => setG(gi, { items: groups[gi]!.items.map((q, j) => (j === qi ? { ...q, ...patch } : q)) });
  return (
    <div className="editor">
      {groups.map((g, gi) => (
        <section className="card" key={gi}>
          <Text label={`${gi + 1}-guruh nomi`} value={g.title} onChange={(v) => setG(gi, { title: v })} required />
          {g.items.map((q, qi) => (
            <fieldset key={qi} className="item">
              <legend>{qi + 1}-savol</legend>
              <Text label="Savol" value={q.q} onChange={(v) => setQ(gi, qi, { q: v })} required />
              <Text label="Javob" value={q.a} onChange={(v) => setQ(gi, qi, { a: v })} required multiline />
              <Mover i={qi} n={g.items.length} onMove={(a, b) => setG(gi, { items: move(g.items, a, b) })} onRemove={() => setG(gi, { items: g.items.filter((_, j) => j !== qi) })} removeLabel="Savolni o‘chirish" canRemove={g.items.length > 1} />
            </fieldset>
          ))}
          <button type="button" className="btn ghost" onClick={() => setG(gi, { items: [...g.items, { q: "", a: "" }] })}>+ Savol qo‘shish</button>
          <Mover i={gi} n={groups.length} onMove={(a, b) => setGroups((gs) => move(gs, a, b))} onRemove={() => setGroups((gs) => gs.filter((_, j) => j !== gi))} removeLabel="Guruhni o‘chirish" canRemove={groups.length > 1} />
        </section>
      ))}
      {groups.length < 10 && <button type="button" className="btn ghost" onClick={() => setGroups((gs) => [...gs, { title: "", items: [{ q: "", a: "" }] }])}>+ Guruh qo‘shish</button>}
      <section className="card preview" aria-label="Saytda qanday ko‘rinadi">
        <h2>Ko‘rinish (/savollar)</h2>
        {groups.map((g, gi) => (
          <div key={gi} className="pv-faq">
            <b>{g.title}</b>
            {g.items.map((q, qi) => <details key={qi}><summary>{q.q}</summary><p>{q.a}</p></details>)}
          </div>
        ))}
      </section>
      <DraftForm tur={tur} base={base} data={groups} />
    </div>
  );
}

// ---------------- Nashr ----------------
export function PublishForm({ tur, number }: { tur: string; number: number }) {
  const [state, action] = useActionState(publishAction, null);
  return (
    <form action={action} className="form">
      <input type="hidden" name="tur" value={tur} />
      <input type="hidden" name="number" value={number} />
      <Messages state={state} />
      {state?.issues ? (
        <>
          <div className="alert" role="alert">
            <p>Diqqat — bu matn sayt qoidalariga zid bo‘lishi mumkin:</p>
            <ul>{state.issues.map((i) => <li key={i.rule}>{i.why}: “{i.match}”</li>)}</ul>
          </div>
          <label className="check"><input type="checkbox" name="confirm" value="1" required /> Ko‘rdim, baribir nashr qilaman (jurnalga yoziladi)</label>
          <Submit className="btn danger">Baribir nashr qilish</Submit>
        </>
      ) : (
        <Submit>{number}-versiyani nashr qilish</Submit>
      )}
    </form>
  );
}
