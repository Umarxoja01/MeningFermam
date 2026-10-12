import { DemoStoreProvider } from "@/components/sayt/v2/DemoStore";
import { DrugStore } from "@/components/sayt/v2/DrugStore";
import { FeatureTabs } from "@/components/sayt/v2/FeatureTabs";
import { FeedCalculator } from "@/components/sayt/v2/FeedCalculator";
import { H2Words } from "@/components/sayt/v2/H2Words";
import { Hero } from "@/components/sayt/v2/Hero";
import { ProblemLoop } from "@/components/sayt/v2/ProblemLoop";
import { ReminderDemo } from "@/components/sayt/v2/ReminderDemo";
import { SickHelper } from "@/components/sayt/v2/SickHelper";
import { StartButton } from "@/components/sayt/v2/StartButton";
import { MilkCard, PedigreeCard } from "@/components/sayt/v2/StatsCards";
import { eslatma, statistika, yakun, yem } from "@/content/bosh";
import { holatHead } from "@/content/holat";
import { kasalText } from "@/content/kasallik";
import { omborText } from "@/content/ombor";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/");

// Asosiy tushuntirish birinchi ekranda; muammo kartochkalari undan keyin. Footer umumiy qobiqda.
export default function Home() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Muammo kartochkalari */}
      <ProblemLoop />

      {/* 3. Yem */}
      <section id="yem" aria-labelledby="yem-h">
        <div className="wrap block">
          <div className="rv">
            <p className="ask">{yem.ask}</p>
            <H2Words text={yem.title} id="yem-h" />
            <p className="sub">{yem.sub}</p>
          </div>
          <FeedCalculator />
        </div>
      </section>

      <DemoStoreProvider>
        {/* 4. Molim kasal */}
        <section id="kasal" aria-labelledby="kasal-h">
          <div className="wrap">
            <div className="head rv"><span className="chip">{kasalText.chip}</span><H2Words text={kasalText.title} id="kasal-h" /></div>
            <SickHelper />
          </div>
        </section>

        {/* 5. Dori ombori */}
        <section id="ombor" className="alt" aria-labelledby="ombor-h">
          <div className="wrap">
            <div className="head rv"><p className="ask">{omborText.ask}</p><H2Words text={omborText.title} id="ombor-h" /><p className="sub">{omborText.sub}</p></div>
            <DrugStore />
          </div>
        </section>
      </DemoStoreProvider>

      {/* 6. Eslatma */}
      <section id="eslatma" className="alt" aria-labelledby="eslatma-h">
        <div className="wrap block flip">
          <div className="rv">
            <p className="ask">{eslatma.ask}</p>
            <H2Words text={eslatma.title} id="eslatma-h" />
            <p className="sub">{eslatma.sub}</p>
          </div>
          <div className="rv"><ReminderDemo /></div>
        </div>
      </section>

      {/* 7. Statistika va juftlash */}
      <section id="statistika" className="alt" aria-labelledby="statistika-h">
        <div className="wrap">
          <div className="head rv"><span className="chip">{statistika.chip}</span><H2Words text={statistika.title} id="statistika-h" /></div>
          <div className="duo"><MilkCard /><PedigreeCard /></div>
        </div>
      </section>

      {/* 8. Funksiyalar holati */}
      <section id="holat" aria-labelledby="holat-h">
        <div className="wrap">
          <div className="head rv" style={{ textAlign: "center", justifyItems: "center" }}>
            <span className="chip">{holatHead.chip}</span><H2Words text={holatHead.title} id="holat-h" />
          </div>
          <FeatureTabs />
        </div>
      </section>

      {/* 9. Yakun */}
      <section id="oxiri" style={{ paddingTop: 0 }} aria-labelledby="oxiri-h">
        <div className="wrap">
          <div className="final rv">
            <h2 id="oxiri-h">{yakun.title}</h2>
            <p>{yakun.sub}</p>
            <StartButton className="btn" />
          </div>
        </div>
      </section>
    </>
  );
}
