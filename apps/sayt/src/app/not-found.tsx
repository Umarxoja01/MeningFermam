import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/sayt/v2/SiteShell";
import { notFoundText as T } from "@/content/sahifalar";
import { CmsProvider } from "@/components/sayt/v2/CmsProvider";
import { getSiteContent } from "@/lib/cms";
import "./(sayt)/sayt.css";

export const metadata: Metadata = { title: T.h1 };

// 404 (TZ v3.1 §5): qisqa xabar + bosh sahifaga qaytish. Sayt menyusi va footeri bilan.
export default async function NotFound() {
  const content = await getSiteContent();
  const text = content.website.widgets.notFoundText;
  return (
    <CmsProvider value={content}><SiteShell>
      <section className="wrap nf">
        <h1>{text.h1}</h1>
        <p>{text.text}</p>
        <Link className="btn" href="/">{text.cta}</Link>
      </section>
    </SiteShell></CmsProvider>
  );
}
