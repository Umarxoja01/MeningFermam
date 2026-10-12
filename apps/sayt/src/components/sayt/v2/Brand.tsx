"use client";
import { useSiteContent } from "./CmsProvider";
import Link from "next/link";


export function Brand({ footer = false }: { footer?: boolean }) {
  const { home: { site }, design } = useSiteContent().website;
  return (
    <Link prefetch={false} className={footer ? "logo flogo-wrap" : "logo"} href="/">
      {/* eslint-disable-next-line @next/next/no-img-element -- kichik statik logo (22 KB), demo bilan bir xil o'lcham */}
      <img className={footer ? "flogo" : undefined} src={design.logoUrl || "/brand/logo.webp"} alt="" width={footer ? 84 : 44} height={footer ? 84 : 44} />
      {site.name}
    </Link>
  );
}
