import { statistika as T } from "@/content/bosh";

// Statistika va juftlash namunasi (TZ v3.1 §4.7). Yemdan zot olib tashlanishi bu bo'limga ta'sir qilmaydi.
export function MilkCard() {
  return (
    <div className="tilt soft-tilt card rv" id="statBox">
      <h3>{T.milkTitle}</h3>
      {T.milk.map((m) => (
        <div key={m.id} className={`srow${m.low ? " low" : ""}`}>
          <span>{m.id}</span>
          <span className="tr" aria-hidden="true"><i style={{ "--w": `${m.w}%` } as React.CSSProperties} /></span>
          <span className="v">{m.v}</span>
        </div>
      ))}
      <div className="note bad">{T.milkNote}</div>
    </div>
  );
}

export function PedigreeCard() {
  return (
    <div className="tilt soft-tilt card rv" id="juftlash">
      <h3>{T.pedigreeTitle}</h3>
      <div className="row r4">{T.grand.map(([n, r]) => <div key={n} className="node">{n}<small>{r}</small></div>)}</div>
      <div className="row r2">{T.parents.map(([n, r]) => <div key={n} className="node">{n}<small>{r}</small></div>)}</div>
      <div className="node me">{T.self}</div>
      <div className="chk no">{T.no}</div>
      <div className="chk yes">{T.yes}</div>
    </div>
  );
}
