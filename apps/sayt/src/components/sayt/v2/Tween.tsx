"use client";
import { useEffect, useRef } from "react";
import { money } from "@/lib/format";
import { useReducedMotion } from "@/lib/use-media";

// Sanaluvchi raqam (demo v12 "tween"): 0,5 s, 100 so'mlik qadam. Reduced-motion'da darhol yakuniy qiymat.
export function Tween({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = shown.current;
    const paint = (n: number) => {
      shown.current = n;
      el.textContent = `${prefix}${money(n)}${suffix}`;
    };
    // Harakat rejimi o'zgarsa ham ko'rinayotgan qiymat va keyingi animatsiya bir xil hisobdan boshlanadi.
    if (start === value || reduce) { paint(value); return; }
    paint(start);
    let raf = 0, t0 = 0;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min(1, (ts - t0) / 500);
      paint(p < 1 ? Math.round((start + (value - start) * p) / 100) * 100 : value);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce, prefix, suffix]);
  return <span ref={ref}>{`${prefix}${money(value)}${suffix}`}</span>;
}
