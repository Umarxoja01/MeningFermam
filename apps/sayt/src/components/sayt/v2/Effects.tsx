"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Demo v12 effektlari (TZ v3.1 §8.3): o'qilish chizig'i, scroll'da paydo bo'lish, kursor halqasi, tilt, magnit tugmalar.
// prefers-reduced-motion: animatsiya yo'q, kontent darhol ko'rinadi. JS bo'lmasa ham kontent yashirin qolmaydi (.pre faqat JS qo'yadi).
export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const off: (() => void)[] = [];

    // o'qilish chizig'i
    const bar = document.getElementById("progress");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    off.push(() => removeEventListener("scroll", onScroll));

    // paydo bo'lish
    const items = Array.from(document.querySelectorAll<HTMLElement>(".rv"));
    const show = (el: Element) => { el.classList.remove("pre"); el.classList.add("shown"); };
    if ("IntersectionObserver" in window && !reduce) {
      const vh = innerHeight;
      for (const el of items) {
        if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add("pre");
        else show(el);
      }
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
      items.forEach((el) => io.observe(el));
      // xavfsizlik: ekrandagi hech narsa yashirin qolmasin
      const t = setTimeout(() => document.querySelectorAll(".pre").forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) show(el); }), 2500);
      off.push(() => { io.disconnect(); clearTimeout(t); });
    } else {
      items.forEach(show);
    }

    // sichqoncha effektlari: faqat kompyuterda
    if (matchMedia("(hover: hover)").matches && !reduce) {
      const cur = document.getElementById("cur");
      const dot = document.getElementById("dot");
      let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, raf = 0;
      const onMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        if (dot && cur) { dot.style.opacity = cur.style.opacity = "1"; dot.style.transform = `translate(${mx}px,${my}px)`; }
        const target = e.target as Element | null;
        // tilt
        const t = target?.closest<HTMLElement>(".tilt") ?? null;
        document.querySelectorAll<HTMLElement>(".tilt.act").forEach((o) => { if (o !== t) { o.classList.remove("act"); o.style.transform = ""; } });
        if (t) {
          const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          const k = t.classList.contains("soft-tilt") ? 3 : 9;
          t.classList.add("act");
          t.style.transform = `perspective(900px) rotateX(${(0.5 - py) * k}deg) rotateY(${(px - 0.5) * k}deg) translateY(-4px)`;
        }
        // magnit tugmalar
        const b = target?.closest<HTMLElement>(".btn") ?? null;
        document.querySelectorAll<HTMLElement>(".btn.mag").forEach((o) => { if (o !== b) { o.classList.remove("mag"); o.style.transform = ""; } });
        if (b && !b.closest("dialog")) {
          const r = b.getBoundingClientRect();
          b.classList.add("mag");
          b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
        }
      };
      const onOver = (e: MouseEvent) => cur?.classList.toggle("big", !!(e.target as Element | null)?.closest("a,button"));
      const loop = () => { cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; if (cur) cur.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      addEventListener("mousemove", onMove);
      document.addEventListener("mouseover", onOver);
      off.push(() => {
        cancelAnimationFrame(raf);
        removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseover", onOver);
      });
    }

    return () => off.forEach((f) => f());
  }, [pathname]);

  return (
    <>
      <div className="progress" id="progress" aria-hidden="true" />
      <div className="cur" id="cur" aria-hidden="true" />
      <div className="dot" id="dot" aria-hidden="true" />
    </>
  );
}
