"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/content/bosh";
import { NavLink } from "./NavLink";

// Telefon/planshet pastki menyusi (TZ v3.1 §6): joriy bo'lim belgilanadi, safe-area hisobga olinadi (CSS).
export function TabBar() {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (pathname !== "/") return;
    const onScroll = () => {
      let cur: string | null = null;
      for (const it of nav.tabbar) {
        const s = document.getElementById(it.id);
        if (s && s.getBoundingClientRect().top < innerHeight * 0.5) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      setActive(null);
    };
  }, [pathname]);
  return (
    <nav className="tabbar" aria-label="Tezkor menyu">
      {nav.tabbar.map((it) => {
        const on = active === it.id;
        return (
          <NavLink key={it.id} href={it.href} className={on ? "on" : it.sos ? "sos" : undefined} aria-current={on ? "location" : undefined}>
            <i aria-hidden="true">{it.icon}</i>{it.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
