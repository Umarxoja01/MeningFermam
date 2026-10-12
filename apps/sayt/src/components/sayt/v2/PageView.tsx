"use client";
import { applyLabels, isSiteLinkAvailable, useSiteContent } from "./CmsProvider";
import type { Contacts } from "@meningfermam/content";
import { CustomCalculator } from "./CustomCalculator";
import Link from "next/link";
import { statusLabels as defaultStatusLabels } from "@/content/holat";
import { animalCard as defaultAnimalCard, compareHead as defaultCompareHead, compareRows as defaultCompareRows, farmStats as defaultFarmStats, soonExtra as defaultSoonExtra, urgentVetText as defaultUrgentVetText, type Block, type WidgetName } from "@/content/sahifalar";
import { instagramHref, phoneText, telHref, telegramHref } from "@/lib/format";
import { DemoStoreProvider } from "./DemoStore";
import { DrugStore } from "./DrugStore";
import { FeedCalculator } from "./FeedCalculator";
import { SickHelper } from "./SickHelper";
import { MilkCard, PedigreeCard } from "./StatsCards";

// Ichki sahifa (TZ v3.1 §5): bitta H1, bitta asosiy vazifa, maqsadga mos yakuniy tugma. Matn src/content/sahifalar.ts da.

/** Matndagi {vet} va {telegram} o'rniga haqiqiy aloqa (aloqa.ts da o'zgarsa, hamma joyda o'zgaradi). */
function fill(text: string, contacts: Contacts) {
  const vet = contacts.vets[0];
  return text
    .replace("{vet}", vet ? phoneText(vet.phone) : "")
    .replace("{telegram}", contacts.telegram ? `@${contacts.telegram}` : "");
}

function ctaHref(href: string, contacts: Contacts) {
  if (href === "vet:tel") return contacts.vets[0] ? telHref(contacts.vets[0].phone) : "/aloqa";
  if (href === "telegram:") return contacts.telegram ? telegramHref(contacts.telegram) : "/aloqa";
  return href;
}

function Widget({ name }: { name: WidgetName }) {
  const { contacts, features, website: { widgets, labels } } = useSiteContent();
  const farmStats = (widgets.farmStats ?? defaultFarmStats) as typeof defaultFarmStats;
  const animalCard = (widgets.animalCard ?? defaultAnimalCard) as typeof defaultAnimalCard;
  const compareHead = (widgets.compareHead ?? defaultCompareHead) as typeof defaultCompareHead;
  const compareRows = (widgets.compareRows ?? defaultCompareRows) as unknown as typeof defaultCompareRows;
  const soonExtra = (widgets.soonExtra ?? defaultSoonExtra) as typeof defaultSoonExtra;
  const urgentVetText = typeof widgets.urgentVetText === "string" ? widgets.urgentVetText : defaultUrgentVetText;
  const statusLabels = applyLabels("statusLabels", defaultStatusLabels, labels);
  const vet = contacts.vets[0];
  switch (name) {
    case "feed":
      return <FeedCalculator />;
    case "sick":
      return <SickHelper />;
    case "store":
      return <div id="ombor"><h2 className="sr-only">Dori ombori</h2><DrugStore /></div>;
    case "urgentVet":
      return vet ? (
        <p className="callout warn">
          <span>{urgentVetText} <a className="tel-inline" href={telHref(vet.phone)}>{phoneText(vet.phone)}</a>.</span>
        </p>
      ) : null;
    case "pedigree":
      return <PedigreeCard />;
    case "farmStats":
      return (
        <div className="duo">
          <div className="card">
            <h2 style={{ fontSize: 24 }}>{farmStats.title}</h2>
            <dl className="kv">{farmStats.items.map((x) => <div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}</dl>
          </div>
          <MilkCard />
        </div>
      );
    case "animalCard":
      return (
        <div className="card">
          <h2 style={{ fontSize: 24 }}>{animalCard.title}</h2>
          <dl className="kv">{animalCard.rows.map((x) => <div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>)}</dl>
        </div>
      );
    case "compare":
      return (
        <table className="ctable">
          <thead><tr><th scope="col">{compareHead.job}</th><th scope="col">{compareHead.paper}</th><th scope="col">{compareHead.app}</th><th scope="col">{compareHead.status}</th></tr></thead>
          <tbody>
            {compareRows.map((r) => {
              const f = features.find((feature) => feature.id === r.feature);
              return (
                <tr key={r.job}>
                  <th scope="row">{r.job}</th>
                  <td data-label={compareHead.paper}>{r.paper}</td>
                  <td data-label={compareHead.app}>{r.app}</td>
                  <td data-label={compareHead.status}>{f && <span className={`badge ${f.kind}`}>{statusLabels[f.kind]}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    case "soonList":
      return (
        <ul className="blist">
          {features.filter((feature) => feature.kind === "soon").map((f) => <li key={f.id}><b><span aria-hidden="true">{f.emoji}</span> {f.title}</b>{f.note && <span>{f.note}</span>}</li>)}
          <li><b><span aria-hidden="true">{soonExtra.emoji}</span> {soonExtra.title}</b><span>{soonExtra.note}</span></li>
        </ul>
      );
    case "contacts":
      return (
        <div className="ccards">
          <div className="ccard">
            <h2>MeningFermam</h2>
            <p className="fine" style={{ fontSize: 15 }}>{contacts.hours}</p>
            <div className="line"><span>Telefon<b>{phoneText(contacts.phone)}</b></span><a className="btn" href={telHref(contacts.phone)}>Qo‘ng‘iroq qilish</a></div>
            {contacts.telegram && <div className="line"><span>Telegram<b>@{contacts.telegram}</b></span><a className="btn" href={telegramHref(contacts.telegram)} target="_blank" rel="noopener">Telegramda yozish</a></div>}
            {contacts.instagram && <div className="line"><span>Instagram<b>@{contacts.instagram}</b></span><a className="btn" href={instagramHref(contacts.instagram)} target="_blank" rel="noopener">Instagramda ochish</a></div>}
            {contacts.email && <div className="line"><span>Email<b>{contacts.email}</b></span><a className="btn" href={`mailto:${contacts.email}`}>Yozish</a></div>}
            {contacts.address && <div className="line"><span>Manzil<b>{contacts.address}</b></span></div>}
          </div>
          {contacts.vets.map((v) => (
            <div className="ccard" key={v.phone}>
              <h2>{v.title}{v.name ? `: ${v.name}` : ""}</h2>
              <div className="line"><span>Telefon<b>{phoneText(v.phone)}</b></span><a className="btn" href={telHref(v.phone)}>Qo‘ng‘iroq qilish</a></div>
              {v.telegram && <div className="line"><span>Telegram<b>@{v.telegram}</b></span><a className="btn" href={telegramHref(v.telegram)} target="_blank" rel="noopener">Telegramda yozish</a></div>}
            </div>
          ))}
        </div>
      );
  }
}

function BlockView({ b }: { b: Block }) {
  const { contacts, website } = useSiteContent();
  const { tools } = website;
  const fillText = (text: string) => fill(text, contacts);
  switch (b.type) {
    case "h2": return <h2>{b.text}</h2>;
    case "p": return <p>{fillText(b.text)}</p>;
    case "steps": return <ol className="steps">{b.items.map((x, i) => <li key={i}><span>{x.title && <b>{x.title}</b>}{fillText(x.text)}</span></li>)}</ol>;
    case "list": return <ul className="blist">{b.items.map((x, i) => <li key={i}>{x.title && <b>{x.title}</b>}<span>{fillText(x.text)}</span></li>)}</ul>;
    case "note": return <div className={`callout${b.tone === "warn" ? " warn" : ""}`}>{b.title && <b>{b.title}</b>}<span>{fillText(b.text)}</span></div>;
    case "widget": return <Widget name={b.name} />;
    case "image": return <figure>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin media manzili */}
      <img className="cms-image" src={b.src} alt={b.alt} loading="lazy" />
    </figure>;
    case "button": return isSiteLinkAvailable(b.href, website) ? <p><a className="btn" href={b.href}>{b.label}</a></p> : null;
    case "calculator": {
      const tool = tools.find((item) => item.id === b.toolId);
      return tool ? <CustomCalculator tool={tool} /> : null;
    }
  }
}

export function PageView({ path, children }: { path: string; children?: React.ReactNode }) {
  const { contacts, website } = useSiteContent();
  const p = website.pages[path];
  if (!p) return null;
  const blocks: readonly Block[] = p.blocks;
  const needsStore = blocks.some((b) => b.type === "widget" && (b.name === "sick" || b.name === "store"));
  const wide = blocks.some((b) => b.type === "widget" && ["sick", "store", "feed", "compare", "farmStats", "contacts"].includes(b.name));
  const body = (
    <div className={`prose${wide ? " wide" : ""}`}>
      {blocks.map((b, i) => <BlockView key={i} b={b} />)}
      {children}
    </div>
  );
  const href = ctaHref(p.cta.href, contacts);
  return (
    <section className="page">
      <div className="wrap">
        <header className="page-head">
          <h1>{p.h1}</h1>
          <p>{p.intro}</p>
        </header>
        {needsStore ? <DemoStoreProvider>{body}</DemoStoreProvider> : body}
        {isSiteLinkAvailable(href, website) && <div className="page-cta">
          {href.startsWith("/") ? <Link prefetch={false} className="btn" href={href}>{p.cta.label}</Link> : <a className="btn" href={href}>{p.cta.label}</a>}
        </div>}
      </div>
    </section>
  );
}

export function FaqList() {
  const { contacts, faqGroups } = useSiteContent();
  return (
    <>
      {faqGroups.map((g) => (
        <div key={g.title} style={{ display: "grid", gap: 10 }}>
          <h2>{g.title}</h2>
          <div className="faq">
            {g.items.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{fill(f.a, contacts)}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
