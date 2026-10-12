"use client";

import { DemoStoreProvider } from "./DemoStore";
import { DrugStore } from "./DrugStore";
import { FeatureTabs } from "./FeatureTabs";
import { FeedCalculator } from "./FeedCalculator";
import { H2Words } from "./H2Words";
import { Hero } from "./Hero";
import { ProblemLoop } from "./ProblemLoop";
import { ReminderDemo } from "./ReminderDemo";
import { SickHelper } from "./SickHelper";
import { StartButton } from "./StartButton";
import { MilkCard, PedigreeCard } from "./StatsCards";
import { CustomCalculator } from "./CustomCalculator";
import { applyLabels, isSiteLinkAvailable, useSiteContent } from "./CmsProvider";
import { holatHead as defaultFeaturesHead } from "@/content/holat";
import { kasalText as defaultSickText } from "@/content/kasallik";
import { omborText as defaultStoreText } from "@/content/ombor";

/** Bo'limlarning tartibi, ko'rinishi va yangi bloklar adminning nashridan keladi. */
export function HomeContent() {
  const { website } = useSiteContent();
  const { home: { eslatma, statistika, yakun, yem }, layout, labels, tools } = website;
  const kasalText = applyLabels("kasalText", defaultSickText, labels);
  const omborText = applyLabels("omborText", defaultStoreText, labels);
  const holatHead = applyLabels("holatHead", defaultFeaturesHead, labels);
  return <DemoStoreProvider>{layout.filter((block) => block.enabled).map((block) => {
    const id = block.id;
    const heading = `${id}-h`;
    switch (block.type) {
      case "hero": return <Hero key={id} id={id} />;
      case "problems": return <ProblemLoop key={id} id={id} />;
      case "feed": return <section key={id} id={id} aria-labelledby={heading}><div className="wrap block"><div className="rv"><p className="ask">{yem.ask}</p><H2Words text={block.title || yem.title} id={heading} /><p className="sub">{block.text || yem.sub}</p></div><FeedCalculator /></div></section>;
      case "sick": return <section key={id} id={id} aria-labelledby={heading}><div className="wrap"><div className="head rv"><span className="chip">{kasalText.chip}</span><H2Words text={block.title || kasalText.title} id={heading} /></div><SickHelper /></div></section>;
      case "store": return <section key={id} id={id} className="alt" aria-labelledby={heading}><div className="wrap"><div className="head rv"><p className="ask">{omborText.ask}</p><H2Words text={block.title || omborText.title} id={heading} /><p className="sub">{block.text || omborText.sub}</p></div><DrugStore /></div></section>;
      case "reminder": return <section key={id} id={id} className="alt" aria-labelledby={heading}><div className="wrap block flip"><div className="rv"><p className="ask">{eslatma.ask}</p><H2Words text={block.title || eslatma.title} id={heading} /><p className="sub">{block.text || eslatma.sub}</p></div><div className="rv"><ReminderDemo /></div></div></section>;
      case "stats": return <section key={id} id={id} className="alt" aria-labelledby={heading}><div className="wrap"><div className="head rv"><span className="chip">{statistika.chip}</span><H2Words text={block.title || statistika.title} id={heading} /></div><div className="duo"><MilkCard /><PedigreeCard /></div></div></section>;
      case "features": return <section key={id} id={id} aria-labelledby={heading}><div className="wrap"><div className="head rv" style={{ textAlign: "center", justifyItems: "center" }}><span className="chip">{holatHead.chip}</span><H2Words text={block.title || holatHead.title} id={heading} /></div><FeatureTabs /></div></section>;
      case "final": return <section key={id} id={id} style={{ paddingTop: 0 }} aria-labelledby={heading}><div className="wrap"><div className="final rv"><h2 id={heading}>{block.title || yakun.title}</h2><p>{block.text || yakun.sub}</p>{block.button && isSiteLinkAvailable(block.button.href, website) ? <a className="btn" href={block.button.href}>{block.button.label}</a> : <StartButton className="btn" />}</div></div></section>;
      case "calculator": {
        const tool = tools.find((item) => item.id === block.toolId);
        return tool ? <section key={id} id={id}><div className="wrap"><CustomCalculator tool={tool} /></div></section> : null;
      }
      case "custom": return <section key={id} id={id} className="cms-section" aria-labelledby={block.title ? heading : undefined}><div className="wrap"><div className="card head rv">{block.title && <H2Words text={block.title} id={heading} />}{block.text && <p className="cms-text">{block.text}</p>}{block.image &&
        // eslint-disable-next-line @next/next/no-img-element -- CMS media URL serverda tekshiriladi
        <img className="cms-image" src={block.image} alt={block.title || ""} loading="lazy" />}{block.button && isSiteLinkAvailable(block.button.href, website) && <a className="btn" href={block.button.href}>{block.button.label}</a>}</div></div></section>;
    }
  })}</DemoStoreProvider>;
}
