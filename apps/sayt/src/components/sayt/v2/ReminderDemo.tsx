"use client";
import { useEffect, useRef, useState } from "react";
import { eslatma as T } from "@/content/bosh";

type Stage = "wait" | "shown" | "later" | "done";

// Eslatma maketi (TZ v3.1 §4.6; Q15, F-06). Haqiqiy push/SMS yubormaydi. "Keyinroq" va "Berdim" faqat maket holatini
// o'zgartiradi; holat matni screen reader uchun e'lon qilinadi. Reduced-motion'da bildirishnoma darhol ko'rinadi.
export function ReminderDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("wait");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const play = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimeout(timer.current);
    setStage("wait");
    timer.current = setTimeout(() => setStage("shown"), reduce ? 0 : 900);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { play(); io.disconnect(); }
    });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(timer.current); };
  }, []);

  return (
    <div className="phone tilt">
      <div className="scr lock">
        <div className="bar" aria-hidden="true"><span>●●● 4G</span><span>100%</span></div>
        <div className="clock"><b>{T.time}</b><small>{T.date}</small></div>
        <div className="scb" ref={ref}>
          {(stage === "shown" || stage === "done") && (
            <div className="noti">
              <div className="nh"><i aria-hidden="true">🐄</i>{T.app}</div>
              <b>{T.noti}</b><br />{T.notiText}
              <div className="act">
                <button type="button" disabled={stage === "done"} onClick={() => setStage("later")}>{T.later}</button>
                <button className="gave" type="button" disabled={stage === "done"} onClick={() => setStage("done")}>{stage === "done" ? T.gaveDone : T.gave}</button>
              </div>
            </div>
          )}
          <div role="status">
            {stage === "later" && <div className="done">{T.laterDone}</div>}
            {stage === "done" && <div className="done">{T.doneMsg}</div>}
          </div>
          {(stage === "later" || stage === "done") && <button type="button" className="replay" onClick={play}>{T.replay}</button>}
        </div>
      </div>
    </div>
  );
}
