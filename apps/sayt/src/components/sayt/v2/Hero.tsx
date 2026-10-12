import { hero } from "@/content/bosh";
import { heroSceneSvg, trustSealSvg } from "./hero-scene";
import { HeroVideo } from "./HeroVideo";
import { Parallax } from "./Parallax";

// Hero (TZ v3.1 §4.2). Video NEXT_PUBLIC_HERO_VIDEO bilan berilsa — ovozsiz, takroriy, playsInline; aks holda SVG yaylov.
// Yagona asosiy CTA: "Qanday qilib? ›" → #yem (D-25, Q03). Muhr, kartochkalar va ishonch lentasi demodagidek (egasi qarori).
export function Hero() {
  const video = process.env.NEXT_PUBLIC_HERO_VIDEO?.trim();
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="wrap">
        <div className="stage" id="stage">
          {video
            ? <HeroVideo src={video} />
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
            <div className="hbtns in"><a className="btn" href={hero.cta.href}>{hero.cta.label}</a></div>
          </div>
        </div>
        <div className="trust rv">
          <div className="tseal" dangerouslySetInnerHTML={{ __html: trustSealSvg }} />
          <div><b>{hero.trust.title}</b><p>{hero.trust.text}</p></div>
          <div className="tdocs">{hero.trust.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      </div>
      {!video && <Parallax stageId="stage" />}
    </section>
  );
}
