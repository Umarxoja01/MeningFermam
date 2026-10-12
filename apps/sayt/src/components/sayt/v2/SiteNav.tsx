"use client";
import { isSiteLinkAvailable, useSiteContent } from "./CmsProvider";

import { Brand } from "./Brand";
import { NavLink } from "./NavLink";
import { StartButton } from "./StartButton";

// Tepa menyu (TZ v3.1 §6): ≥1020 px da to'liq, sticky.
export function SiteNav() {
  const website = useSiteContent().website;
  const { home: { nav } } = website;
  return (
    <header className="top">
      <nav className="nav" aria-label="Asosiy menyu">
        <Brand />
        <div className="links">
          {nav.links.filter((l) => isSiteLinkAvailable(l.href, website)).map((l) => <NavLink key={l.href} href={l.href} className={l.vet ? "vet" : undefined}>{l.label}</NavLink>)}
        </div>
        <StartButton className="btn" />
      </nav>
    </header>
  );
}
