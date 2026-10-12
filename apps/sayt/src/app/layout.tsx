import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/content/bosh";
import { SITE_URL, seo } from "@/content/seo";
import "./globals.css";

// Shrift (egasi qarori): iPhone/Mac'da tizimning SF shrifti, boshqa qurilmalarda Inter. Inter saytning o'zidan beriladi.
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: seo["/"].title, template: `%s | ${site.name}` },
  description: seo["/"].description,
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "uz_UZ", type: "website" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
