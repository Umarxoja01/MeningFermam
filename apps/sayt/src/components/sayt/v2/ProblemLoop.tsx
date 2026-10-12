"use client";
import { useEffect, useRef, useState } from "react";
import { loopText } from "@/content/bosh";
import { problems, problemsHead } from "@/content/muammolar";
import { useReducedMotion } from "@/lib/use-media";

// Muammo kartochkalari lentasi (TZ v3.1 §4.1; Q01, Q02; F-02, F-03).
// Sekin chapga aylanadi; sichqoncha ustida sekinlashadi; surish mumkin va surish kartochkani bosmaydi;
// "To'xtatish / Davom ettirish"; ekrandan chiqqanda pauza; reduced-motion'da avtomatik harakat yo'q;
// Tab bilan kartochkaga o'tilganda lenta to'xtaydi va kartochka ko'rinadigan joyga keladi.
export function ProblemLoop() {
  const loopRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  /** Foydalanuvchi tanlovi; tanlamagan bo'lsa reduced-motion'da to'xtagan turadi. */
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduce;
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const toggle = () => setUserPaused(!paused);

  useEffect(() => {
    const loop = loopRef.current, track = trackRef.current;
    if (!loop || !track) return;
    const speed = 0.45;
    let x = 0, target = speed, cur = speed, half = track.scrollWidth / 2, raf = 0;
    let visible = true, focused = false;
    let drag: { x: number; o: number; moved: boolean } | null = null;

    const wrap = () => { if (half) x = ((x % half) + half) % half; };
    const paint = () => { track.style.transform = `translateX(${-x}px)`; };
    const measure = () => { half = track.scrollWidth / 2; };
    const frame = () => {
      cur += (target - cur) * 0.05;
      if (!drag && !pausedRef.current && visible && !focused) x += cur;
      wrap();
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; });
    io.observe(loop);

    const onEnter = () => { target = speed * 0.15; };
    const onLeave = () => { target = speed; };
    const onDown = (e: PointerEvent) => { drag = { x: e.clientX, o: x, moved: false }; };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const d = e.clientX - drag.x;
      if (Math.abs(d) > 5) drag.moved = true;
      x = drag.o - d;
    };
    const onUp = () => { setTimeout(() => { drag = null; }, 0); };
    const onClick = (e: MouseEvent) => { if (drag?.moved) { e.preventDefault(); e.stopPropagation(); } };
    const onFocusIn = (e: FocusEvent) => {
      focused = true;
      const card = (e.target as HTMLElement).closest<HTMLElement>(".pc");
      // faqat klaviatura fokusida va kartochka to'liq ko'rinmasa suramiz: sichqoncha bosganda kartochka kursor ostidan qochmasin
      if (!card || !card.matches(":focus-visible")) return;
      const r = card.getBoundingClientRect(), lr = loop.getBoundingClientRect();
      if (r.left >= lr.left && r.right <= lr.right) return;
      x = card.offsetLeft - 16; wrap(); paint();
    };
    const onFocusOut = () => { focused = false; };
    // brauzerning o'zi fokus uchun overflow'ni siljitmasin
    const onScrollReset = () => { loop.scrollLeft = 0; };

    addEventListener("resize", measure);
    loop.addEventListener("mouseenter", onEnter);
    loop.addEventListener("mouseleave", onLeave);
    loop.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    loop.addEventListener("click", onClick, true);
    loop.addEventListener("focusin", onFocusIn);
    loop.addEventListener("focusout", onFocusOut);
    loop.addEventListener("scroll", onScrollReset);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", measure);
      loop.removeEventListener("mouseenter", onEnter);
      loop.removeEventListener("mouseleave", onLeave);
      loop.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      loop.removeEventListener("click", onClick, true);
      loop.removeEventListener("focusin", onFocusIn);
      loop.removeEventListener("focusout", onFocusOut);
      loop.removeEventListener("scroll", onScrollReset);
    };
  }, []);

  const card = (p: (typeof problems)[number], i: number, copy: boolean) => (
    <a key={`${copy ? "b" : "a"}${i}`} className="pc tilt" href={p.href} draggable={false} tabIndex={copy ? -1 : undefined} aria-hidden={copy || undefined}>
      <span className="em" aria-hidden="true">{p.emoji}</span>
      <span><small>{p.topic}</small><br /><b>“{p.question}”</b></span>
      <span className="go" aria-hidden="true">›</span>
    </a>
  );

  return (
    <section id="muammo" style={{ paddingTop: 22, paddingBottom: 6 }} aria-labelledby="muammo-h">
      <div className="wrap">
        <div className="loophead">
          <div className="head" style={{ marginBottom: 0 }}>
            <span className="chip">{problemsHead.chip}</span>
            <h2 className="h2 top-h" id="muammo-h">{problemsHead.title}</h2>
          </div>
          <button type="button" className="loopbtn" onClick={toggle}>
            <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>{paused ? loopText.play : loopText.pause}
          </button>
        </div>
      </div>
      <div className="loop" ref={loopRef}>
        <div className="ltrack" ref={trackRef}>
          {problems.map((p, i) => card(p, i, false))}
          {problems.map((p, i) => card(p, i, true))}
        </div>
      </div>
    </section>
  );
}
