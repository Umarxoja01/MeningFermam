"use client";
import { useEffect } from "react";

// Hero sahnasi qatlamlari: sichqoncha va scroll parallaksi (demo v12). Reduced-motion'da statik.
export function Parallax({ stageId }: { stageId: string }) {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = document.getElementById(stageId);
    if (!stage) return;
    const layers = Array.from(stage.querySelectorAll<SVGGElement>(".layer"));
    const onMouse = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      for (const l of layers) { const d = Number(l.dataset.depth); l.style.transform = `translate(${-x * d}px,${-y * d * 0.4}px)`; }
    };
    const onScroll = () => {
      const s = Math.min(scrollY, 700);
      for (const l of layers) l.style.transform = `translateY(${(s * Number(l.dataset.depth)) / 220}px)`;
    };
    stage.addEventListener("mousemove", onMouse);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { stage.removeEventListener("mousemove", onMouse); removeEventListener("scroll", onScroll); };
  }, [stageId]);
  return null;
}
