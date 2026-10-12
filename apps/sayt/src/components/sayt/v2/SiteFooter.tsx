import Link from "next/link";
import { contacts } from "@/content/aloqa";
import { nav, site } from "@/content/bosh";
import { instagramHref, phoneText, telHref, telegramHref } from "@/lib/format";
import { Brand } from "./Brand";

// Footer (TZ v3.1 §4.9): faqat tasdiqlangan aloqa; yo'q qiymat ko'rsatilmaydi (F-07, Q18); /maxfiylik va /shartlar (F-08, Q19).
export function SiteFooter() {
  const c = contacts;
  return (
    <footer id="aloqa">
      <div className="wrap fgrid">
        <div>
          <Brand footer />
          <p className="fine" style={{ marginTop: 10, fontSize: 15 }}>{site.tagline}</p>
        </div>
        <div>
          <h2>Aloqa</h2>
          <ul>
            <li className="big-ph"><a href={telHref(c.phone)}>{phoneText(c.phone)}</a></li>
            <li>{c.hours}</li>
            {c.telegram && <li><a href={telegramHref(c.telegram)} target="_blank" rel="noopener">Telegram: @{c.telegram}</a></li>}
            {c.instagram && <li><a href={instagramHref(c.instagram)} target="_blank" rel="noopener">Instagram: @{c.instagram}</a></li>}
            {c.email && <li><a href={`mailto:${c.email}`}>{c.email}</a></li>}
            {c.address && <li>{c.address}</li>}
          </ul>
        </div>
        <div>
          <h2>Bo‘limlar</h2>
          <ul>
            {nav.footerSections.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </div>
        <nav className="footer-guides" aria-labelledby="footer-guides-heading">
          <h2 id="footer-guides-heading">Qo‘llanmalar va savollar</h2>
          <ul>
            {nav.footerGuides.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <h2>Veterinar</h2>
          <ul>
            {c.vets.map((v) => (
              <li key={v.phone} className="stack">
                {v.name && <span>{v.name}</span>}
                <a href={telHref(v.phone)}>{phoneText(v.phone)}</a>
                {v.telegram && <a href={telegramHref(v.telegram)} target="_blank" rel="noopener">Telegram: @{v.telegram}</a>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap legal">
        <span>© {new Date().getFullYear()} {site.name} · {site.legal}</span>
        <span><Link href="/maxfiylik">Maxfiylik</Link> · <Link href="/shartlar">Shartlar</Link> · <Link href="/aloqa">Aloqa</Link></span>
      </div>
    </footer>
  );
}
