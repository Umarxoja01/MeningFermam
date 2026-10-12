"use client";
import { useId, useRef, useState } from "react";
import { contacts } from "@/content/aloqa";
import { kasalText as T, sickAnimalKeys, sickAnimals, type SickAnimalKey } from "@/content/kasallik";
import { drugs, otherDrugNames } from "@/content/ombor";
import { actionIdFor, checkDay, isFinished, treatmentDaysFor } from "@/lib/drug-store";
import { phoneText, telHref, telegramHref } from "@/lib/format";
import { demoDefs, useDemoStore } from "./DemoStore";

// "Molim kasal" (TZ v3.1 §4.4; Q09–Q11, Q14). Alomat → ehtimoliy holat (namuna), sxema, dorilar, ombor bo'yicha davolash.
// Shoshilinch alomatda veterinarga murojaat birinchi o'rinda, davolash boshqaruvi ko'rsatilmaydi.
// "Bajarildi": kunning hamma dorisi yetganda faol; takroriy bosish bir marta hisoblanadi.
export function SickHelper({ storeHref = "#ombor" }: { storeHref?: string }) {
  const id = useId();
  const { state, dispatch } = useDemoStore();
  const [animalKey, setAnimalKey] = useState<SickAnimalKey>("sigir");
  const [idx, setIdx] = useState(0);
  const animal = sickAnimals[animalKey];
  const s = animal.symptoms[idx] ?? animal.symptoms[0]!;
  const vet = contacts.vets[0];
  // tez ikki marta bosish (double-click) ikkinchi kunni ham bajarib yubormasin: bajarilgach tugma qisqa vaqt qulflanadi
  const [locked, setLocked] = useState(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const choose = (k: SickAnimalKey, i: number) => {
    setAnimalKey(k);
    setIdx(i);
    const sym = sickAnimals[k].symptoms[i];
    if (sym?.rx.length) dispatch({ type: "selectCase", caseId: sym.id, weight: sickAnimals[k].weights[1]! });
  };

  const course = state.course?.caseId === s.id ? state.course : null;
  const caseDef = demoDefs.cases[s.id];
  const checks = course && caseDef ? checkDay(demoDefs, state.stock, caseDef, course.weight) : [];
  const allOk = checks.length > 0 && checks.every((c) => c.ok);
  const finished = course ? isFinished(demoDefs, course) : false;
  const scheduledDays = caseDef ? treatmentDaysFor(caseDef) : [];
  const name = (k: string) => drugs[k]?.name ?? otherDrugNames[k] ?? k;

  return (
    <div className="tilt soft-tilt sick rv">
      <div className="pick">
        <div className="fld" role="group" aria-labelledby={`${id}-who`}>
          <span id={`${id}-who`}>{T.who}</span>
          <div className="opts">
            {sickAnimalKeys.map((k) => <button key={k} type="button" aria-pressed={k === animalKey} onClick={() => choose(k, 0)}>{sickAnimals[k].label}</button>)}
          </div>
        </div>
        <div className="fld" role="group" aria-labelledby={`${id}-what`}>
          <span id={`${id}-what`}>{T.what}</span>
          <div className="dlist">
            {animal.symptoms.map((x, i) => <button key={x.id} type="button" aria-pressed={i === idx} onClick={() => choose(animalKey, i)}>{x.sign}</button>)}
          </div>
        </div>
      </div>

      <div className="res" aria-live="polite">
        {s.urgent && vet && (
          <div className="urgent" role="alert">
            {T.urgent}{" "}
            <a className="tel-inline" href={telHref(vet.phone)}>{phoneText(vet.phone)}</a>
          </div>
        )}
        <div className="res-h">
          <div>
            <h3>{s.name}</h3>
            <p className="probable">{T.probable}</p>
          </div>
          {vet && (
            <div className="vetcall">
              <a className="btn red" href={telHref(vet.phone)} aria-label={`${T.callVet}: ${phoneText(vet.phone)}`}>{T.callVet}</a>
              {vet.telegram && <a className="tg" href={telegramHref(vet.telegram)} target="_blank" rel="noopener">Telegram: @{vet.telegram}</a>}
            </div>
          )}
        </div>
        <div className="easy"><span aria-hidden="true">💡</span><span>{s.easy}</span></div>
        <div className="cols">
          <div className="box">
            <h4>{T.plan}</h4>
            <ul className="tl">
              {s.plan.map(([when, what], n) => <li key={`${s.id}${n}`} className="slidein" style={{ animationDelay: `${n * 0.1}s` }}><b>{when}</b><span>{what}</span></li>)}
            </ul>
          </div>
          <div className="box">
            <h4>{T.drugs}</h4>
            <div style={{ display: "grid", gap: 12 }}>
              {s.drugs.map((g, n) => (
                <div key={`${s.id}${g}`} className="drug slidein" style={{ animationDelay: `${n * 0.1}s` }}>
                  <i aria-hidden="true">💊</i><span><b>{g}</b><span className="okb">{T.certified}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="box treat">
          <h4>{T.treat}</h4>
          <div className="patient">
            <span style={{ fontSize: 26 }} aria-hidden="true">{animal.icon}</span>
            <span><b>{animal.patient}</b><br /><small className="fine">{s.name}</small></span>
          </div>
          {!s.rx.length || !course ? (
            <p className="miss-note">{T.vetOnly}</p>
          ) : (
            <div className="tbody">
              <div className="fld" role="group" aria-labelledby={`${id}-wt`}>
                <span id={`${id}-wt`}>{T.weight}</span>
                <div className="opts">
                  {animal.weights.map((w) => <button key={w} type="button" aria-pressed={w === course.weight} onClick={() => dispatch({ type: "setWeight", weight: w })}>{w} kg</button>)}
                </div>
              </div>
              <div className="fld">
                <span className="lbl">{s.treatmentDays
                  ? `${Math.min(course.day, s.days)}-kun · namuna kunlari: ${scheduledDays.join(", ")}`
                  : s.days > 1 ? `${Math.min(course.day, s.days)}-kun, jami ${s.days} kun` : "1 marta"}</span>
                {s.treatmentDays && <p className="fine">{T.repeatHint}</p>}
                <ul className="rx">
                  {checks.map((c) => {
                    const unit = c.unit ?? "";
                    if (c.have === null) return (
                      <li key={c.rx.drug} className="no"><i aria-hidden="true">✗</i><span><b>{name(c.rx.drug)}</b><small>{c.rx.note}</small><span className="miss">{T.notInStock}</span></span></li>
                    );
                    if (!c.ok) return (
                      <li key={c.rx.drug} className="no"><i aria-hidden="true">!</i><span><b>{name(c.rx.drug)}</b><small>{c.rx.note}</small><span className="miss">{T.short(`${c.need} ${unit}`, `${c.have} ${unit}`)}</span></span></li>
                    );
                    return (
                      <li key={c.rx.drug}><i aria-hidden="true">💉</i><span><b>{name(c.rx.drug)}</b><small>{c.rx.note}{c.rx.perKg ? ` · ${course.weight} kg ga` : ""}</small><span className="dose">{c.need} {unit}</span></span></li>
                    );
                  })}
                </ul>
                {checks.some((c) => c.unit === "namuna birligi") && <p className="fine">{T.sampleUnitHint}</p>}
              </div>
              <button
                type="button"
                className="btn rxdone"
                disabled={finished || !allOk || locked}
                onClick={() => {
                  if (locked) return;
                  dispatch({ type: "completeDay", actionId: actionIdFor(course) });
                  setLocked(true);
                  clearTimeout(lockTimer.current);
                  lockTimer.current = setTimeout(() => setLocked(false), 1200);
                }}
              >
                {finished ? T.finished : allOk ? T.done : T.needDrug}
              </button>
              <div role="status">
                {state.last?.kind === "done" && (
                  <div className="msg">
                    {T.recorded} {state.last.parts.map((p) => `${name(p.drug)}: ${p.qty} ${drugs[p.drug]?.unit ?? ""}`).join(", ")}.
                    {state.last.opened.length > 0 && ` ${T.newVial} ${state.last.opened.map(name).join(", ")}.`}{" "}
                    <a href={storeHref}>{T.toStore}</a>
                  </div>
                )}
                {state.last?.kind === "blocked" && <div className="msg warnmsg">{T.blocked}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="box">
          <h4>{T.pharmacyTitle}</h4>
          <p className="soonbox">{T.pharmacy}</p>
        </div>
        <p className="fine">{T.fine}</p>
      </div>
    </div>
  );
}
