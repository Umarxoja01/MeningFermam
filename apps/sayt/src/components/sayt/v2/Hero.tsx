"use client";
import { isSiteLinkAvailable, useSiteContent } from "./CmsProvider";

import { heroSceneSvg, trustSealSvg } from "./hero-scene";
import { HeroVideo } from "./HeroVideo";
import { Parallax } from "./Parallax";

// Hero (TZ v3.1 §4.2). Video NEXT_PUBLIC_HERO_VIDEO bilan berilsa — ovozsiz, takroriy, playsInline; aks holda SVG yaylov.
// Yagona asosiy CTA: "Qanday qilib? ›" → #yem (D-25, Q03). Muhr, kartochkalar va ishonch lentasi demodagidek (egasi qarori).
export function Hero({ id }: { id?: string }) {
  const website = useSiteContent().website;
  const { home: { hero }, design } = website;
  const cta = isSiteLinkAvailable(hero.cta.href, website) ? hero.cta : { href: "#aloqa", label: "Biz bilan bog‘laning" };
  const video = design.heroVideoUrl || process.env.NEXT_PUBLIC_HERO_VIDEO?.trim();
  const image = design.heroImageUrl;
  return (
    <section className="hero" id={id} aria-labelledby="hero-h">
      <div className="wrap">
        <div className="stage" id="stage">
          {video
            ? <HeroVideo src={video} />
            : image
              // eslint-disable-next-line @next/next/no-img-element -- CMS rasm manzili foydalanuvchi nashridan olinadi
              ? <img className="scene cms-hero-image" src={image} alt="" />
              : <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: heroSceneSvg }} />}
          <div className="float" aria-hidden="true">
            {hero.floats.map((f) => (
              <div className="fc" key={f.title}><i>{f.icon}</i><span><b>{f.title}</b><small>{f.text}</small></span></div>
            ))}
          </div>
          <div className="hcopy">
            <span className="seal in"><i aria-hidden="true">✓</i>{hero.seal}</span>
            <h1 className="in" id="hero-h">{hero.h1} <em>{hero.h1em}</em></h1>
            <p className="in">{hero.sub}</p>
            <div className="hbtns in"><a className="btn" href={cta.href}>{cta.label}</a></div>
          </div>
        </div>
        <div className="trust rv">
          <div className="tseal" dangerouslySetInnerHTML={{ __html: trustSealSvg }} />
          <div><b>{hero.trust.title}</b><p>{hero.trust.text}</p></div>
          <div className="tdocs">{hero.trust.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      </div>
      {!video && !image && <Parallax stageId="stage" />}
    </section>
  );
}
