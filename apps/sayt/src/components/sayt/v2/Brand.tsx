import Link from "next/link";
import { site } from "@/content/bosh";

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link className={footer ? "logo flogo-wrap" : "logo"} href="/">
      {/* eslint-disable-next-line @next/next/no-img-element -- kichik statik logo (22 KB), demo bilan bir xil o'lcham */}
      <img className={footer ? "flogo" : undefined} src="/brand/logo.webp" alt="" width={footer ? 84 : 44} height={footer ? 84 : 44} />
      {site.name}
    </Link>
  );
}
