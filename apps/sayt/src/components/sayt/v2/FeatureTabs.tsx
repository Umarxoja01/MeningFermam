"use client";
import { applyLabels, useSiteContent } from "./CmsProvider";
import { useId, useRef, useState } from "react";
import { statusLabels as defaultLabels, statusOrder, statusTabLabels as defaultTabLabels } from "@/content/holat";

// Funksiyalar holati (TZ v3.1 §4.8; Q16, F-04). Sichqoncha/touch, Tab, ←/→, Home/End; role=tablist/tab/tabpanel.
export function FeatureTabs() {
  const { features, website: { labels } } = useSiteContent();
  const statusLabels = applyLabels("statusLabels", defaultLabels, labels);
  const statusTabLabels = applyLabels("statusTabLabels", defaultTabLabels, labels);
  const id = useId();
  const [cur, setCur] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number) => {
    const i = (n + statusOrder.length) % statusOrder.length;
    setCur(i);
    btns.current[i]?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(cur + 1);
    else if (e.key === "ArrowLeft") go(cur - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(statusOrder.length - 1);
    else return;
    e.preventDefault();
  };
  const kind = statusOrder[cur]!;
  return (
    <>
      <div className="tabs rv" role="tablist" aria-label="Funksiyalar holati" onKeyDown={onKey}>
        {statusOrder.map((k, n) => (
          <button
            key={k}
            ref={(el) => { btns.current[n] = el; }}
            type="button"
            role="tab"
            id={`${id}-t${n}`}
            aria-selected={n === cur}
            aria-controls={`${id}-p`}
            tabIndex={n === cur ? 0 : -1}
            onClick={() => setCur(n)}
          >
            {statusTabLabels[k]}
          </button>
        ))}
      </div>
      <div className="st-grid" id={`${id}-p`} role="tabpanel" aria-labelledby={`${id}-t${cur}`} tabIndex={0}>
        {features.filter((f) => f.kind === kind).map((f, n) => (
          <div key={f.id} className="sf" style={{ animationDelay: `${n * 0.07}s` }}>
            <i aria-hidden="true">{f.emoji}</i><span className={`badge ${f.kind}`}>{statusLabels[f.kind]}</span><b>{f.title}</b>
          </div>
        ))}
      </div>
    </>
  );
}
