"use client";
import { drugs, omborText as T } from "@/content/ombor";
import { total } from "@/lib/drug-store";
import { useDemoStore } from "./DemoStore";

// Dori ombori (TZ v3.1 §4.5; Q12, Q13). Telefonda 1, planshetda 2, kompyuterda 3 ustun (CSS).
// Yaroqlilik qoldiq miqdoriga tenglashtirilmaydi: "muddat tasdiqlanmagan".
export function DrugStore() {
  const { state, dispatch } = useDemoStore();

  return (
    <div className="store tilt soft-tilt rv">
      <ul className="stock" aria-live="polite">
        {Object.values(drugs).map((d) => {
          const e = state.stock[d.key]!;
          const t = total(e, d);
          const one = d.unit === "ml" ? "1 flakon" : `1 ${d.unit}`;
          const addLabel = d.unit === "namuna birligi" ? `+ ${one} qo‘shish` : `+ ${one} oldim`;
          const info = !t ? T.empty
            : d.unit !== "ml" ? `${t} ${d.unit}`
            : `${[e.closed ? `${e.closed} ta yopiq flakon` : "", e.open ? "1 ta ochilgan" : ""].filter(Boolean).join(" + ")} · 1 flakon ${d.vial} ml`;
          const isHit = state.hit.includes(d.key);
          // o'zgargan kartochka qisqa yonadi; klass nomi har amalda almashib animatsiya qayta boshlanadi (fokus saqlanadi)
          return (
            <li key={d.key} className={isHit ? (state.tick % 2 ? "hit-a" : "hit-b") : undefined}>
              <div className="sh"><b>{d.name}</b><span>{t} {d.unit}</span></div>
              {d.unit === "ml" && (
                <div className="vials" aria-hidden="true">
                  {e.open > 0 && <span className="vial open"><i style={{ height: `${Math.round((e.open / d.vial) * 100)}%` }} /></span>}
                  {Array.from({ length: e.closed }, (_, i) => <span key={i} className="vial"><i style={{ height: "100%" }} /></span>)}
                </div>
              )}
              <small>{info}</small>
              {d.unit === "namuna birligi" && <small>{T.sampleUnit}</small>}
              {(e.open > 0 && d.unit === "ml") || t <= d.vial / 2 ? (
                <div className="tags">
                  {e.open > 0 && d.unit === "ml" && <span className="dtag op">{T.openTag(e.open)}</span>}
                  {t <= d.vial / 2 && <span className="dtag low">{T.lowTag}</span>}
                </div>
              ) : null}
              <button type="button" className="addv" aria-label={`${addLabel}: ${d.name}`} onClick={() => dispatch({ type: "addVial", drug: d.key })}>{addLabel}</button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="reset" style={{ margin: 0 }} onClick={() => dispatch({ type: "reset" })}>{T.reset}</button>
    </div>
  );
}
