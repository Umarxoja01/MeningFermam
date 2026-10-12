import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/sayt/v2/SiteShell";
import { notFoundText as T } from "@/content/sahifalar";
import "./(sayt)/sayt.css";

export const metadata: Metadata = { title: T.h1 };

// 404 (TZ v3.1 §5): qisqa xabar + bosh sahifaga qaytish. Sayt menyusi va footeri bilan.
export default function NotFound() {
  return (
    <SiteShell>
      <section className="wrap nf">
        <h1>{T.h1}</h1>
        <p>{T.text}</p>
        <Link className="btn" href="/">{T.cta}</Link>
      </section>
    </SiteShell>
  );
}
