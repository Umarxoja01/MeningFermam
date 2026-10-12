"use client";
import { useEffect, useRef } from "react";

// Hero videosi (TZ v3.1 §4.2, §8.3; ERR-007): ovozsiz, takroriy, playsInline. HTML'da autoplay yo'q —
// faqat prefers-reduced-motion o'chiq bo'lsa o'ynatiladi; yoqilgan bo'lsa birinchi kadr turadi.
export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => { /* brauzer ruxsat bermasa — statik kadr qoladi */ });
  }, []);
  return <video ref={ref} muted loop playsInline preload="metadata" src={src} aria-hidden="true" />;
}
