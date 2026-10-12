import { nav } from "@/content/bosh";
import { Brand } from "./Brand";
import { NavLink } from "./NavLink";
import { StartButton } from "./StartButton";

// Tepa menyu (TZ v3.1 §6): ≥1020 px da to'liq, sticky.
export function SiteNav() {
  return (
    <header className="top">
      <nav className="nav" aria-label="Asosiy menyu">
        <Brand />
        <div className="links">
          {nav.links.map((l) => <NavLink key={l.href} href={l.href} className={l.vet ? "vet" : undefined}>{l.label}</NavLink>)}
        </div>
        <StartButton className="btn" />
      </nav>
    </header>
  );
}
