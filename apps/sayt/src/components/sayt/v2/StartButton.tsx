"use client";
import { useSiteContent } from "./CmsProvider";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";


import { phoneText, telHref, telegramHref } from "@/lib/format";

// "Boshlash" (TZ v3.1 §2.4, F-01): /kirish hali yo'q, shuning uchun "Tez kunda" oynasi. Hamma "Boshlash" shu komponent.
// <dialog>.showModal() bo'lmagan brauzerlarda (iOS Safari < 15.4) oyna oddiy qatlam sifatida ochiladi (ERR-001):
// Escape, "Yopish" va fon bosilganda yopiladi; fon vaqtincha yashiriladi, fokus oynada qoladi va keyin tugmaga qaytadi.
// Oyna portal orqali <body> ga chiziladi: sahifa ichidagi qatlamlar (yopishqoq menyu, pastki menyu) uni yopmasin.
export function StartButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { contacts, website: { home: { start } } } = useSiteContent();
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [fallbackOpen, setFallbackOpen] = useState(false);
  // portal faqat brauzerda (serverda document yo'q); hydration xavfsiz
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const open = () => {
    const d = ref.current;
    if (d && typeof d.showModal === "function") d.showModal();
    else setFallbackOpen(true);
  };
  const close = () => {
    const d = ref.current;
    if (d && typeof d.close === "function" && d.open) d.close();
    if (fallbackOpen) setFallbackOpen(false);
  };

  useEffect(() => {
    if (!fallbackOpen) return;
    const dialog = ref.current;
    if (!dialog) return;
    const returnFocus = trigger.current;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden");
    const focusFirst = () => (focusable()[0] ?? dialog).focus({ preventScroll: true });
    // Avval fokusni oynaga ko'chiramiz: fokuslangan tugmaning ota qismini aria-hidden qilish mumkin emas.
    focusFirst();
    const background = Array.from(document.body.children)
      .filter((el): el is HTMLElement => el instanceof HTMLElement && el !== dialog && !el.classList.contains("startdlg-backdrop"))
      .map((el) => ({ el, inert: el.getAttribute("inert"), hidden: el.getAttribute("aria-hidden") }));
    for (const { el } of background) { el.setAttribute("inert", ""); el.setAttribute("aria-hidden", "true"); }

    // Eski iOS'da overflow:hidden yolg'iz yetarli emas; fonni joyida ushlab, yopilganda aniq scroll holatini tiklaymiz.
    const body = document.body;
    const scroll = { x: scrollX, y: scrollY };
    const properties = ["overflow", "position", "top", "left", "right", "width"] as const;
    const styles = properties.map((name) => ({ name, value: body.style.getPropertyValue(name), priority: body.style.getPropertyPriority(name) }));
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `${-scroll.y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setFallbackOpen(false); return; }
      if (e.key !== "Tab") return;
      const items = focusable(), first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (!first || !last) { e.preventDefault(); dialog.focus({ preventScroll: true }); return; }
      if (!dialog.contains(active) || (e.shiftKey ? active === first : active === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus({ preventScroll: true });
      }
    };
    // inert atributini tushunmaydigan brauzerda yoki dasturiy fokusda ham fokus fon tomon ketmasin.
    const onFocus = (e: FocusEvent) => { if (!dialog.contains(e.target as Node)) focusFirst(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus, true);
      for (const { el, inert, hidden } of background) {
        if (inert === null) el.removeAttribute("inert"); else el.setAttribute("inert", inert);
        if (hidden === null) el.removeAttribute("aria-hidden"); else el.setAttribute("aria-hidden", hidden);
      }
      for (const { name, value, priority } of styles) {
        if (value) body.style.setProperty(name, value, priority); else body.style.removeProperty(name);
      }
      const html = document.documentElement;
      const behavior = html.style.getPropertyValue("scroll-behavior"), priority = html.style.getPropertyPriority("scroll-behavior");
      html.style.setProperty("scroll-behavior", "auto");
      window.scrollTo(scroll.x, scroll.y);
      if (behavior) html.style.setProperty("scroll-behavior", behavior, priority); else html.style.removeProperty("scroll-behavior");
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [fallbackOpen]);

  return (
    <>
      <button ref={trigger} type="button" className={className} style={style} aria-haspopup="dialog" onClick={open}>
        {start.label}
      </button>
      {isClient && createPortal(<>
      {fallbackOpen && <div className="startdlg-backdrop" onClick={close} aria-hidden="true" />}
      <dialog
        ref={ref}
        className={`startdlg${fallbackOpen ? " fallback" : ""}`}
        open={fallbackOpen || undefined}
        aria-modal={fallbackOpen || undefined}
        role="dialog"
        tabIndex={-1}
        aria-labelledby={`${id}-t`}
        onClose={() => trigger.current?.focus({ preventScroll: true })}
        onClick={(e) => { if (e.target === ref.current) close(); }}
      >
        <div className="in-dlg">
          <h2 id={`${id}-t`}>{start.title}</h2>
          <p>{start.text}</p>
          <ul>
            {contacts.telegram && <li><a href={telegramHref(contacts.telegram)} target="_blank" rel="noopener">Telegram: @{contacts.telegram}</a></li>}
            <li><a href={telHref(contacts.phone)}>Qo‘ng‘iroq qilish: {phoneText(contacts.phone)}</a></li>
          </ul>
          <button className="btn ghost" type="button" onClick={close}>{start.close}</button>
        </div>
      </dialog>
      </>, document.body)}
    </>
  );
}

const noopSubscribe = () => () => {};
