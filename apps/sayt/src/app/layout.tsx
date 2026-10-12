import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/content/seo";
import { getSiteContent } from "@/lib/cms";
import "./globals.css";

// Shrift (egasi qarori): iPhone/Mac'da tizimning SF shrifti, boshqa qurilmalarda Inter. Inter saytning o'zidan beriladi.
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { website: { home: { site }, seo } } = await getSiteContent();
  const home = seo["/"]!;
  return {
  metadataBase: new URL(SITE_URL),
  title: { default: home.title, template: `%s | ${site.name}` },
  description: home.description,
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "uz_UZ", type: "website" },
  formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { website: { design } } = await getSiteContent();
  const variables = {
    "--bg": design.background, "--card": design.surface, "--ink": design.text,
    "--green": design.primary, "--green-text": design.primaryDark,
    "--r": `${design.radius}px`, "--cms-font-size": `${design.fontSize}px`,
    "--cms-max-width": `${design.maxWidth}px`, "--cms-section-spacing": `${design.sectionSpacing}px`,
    "--cms-hero-height": `${design.heroHeight}px`,
    ...(design.font === "serif" ? { "--sans": 'Georgia, "Times New Roman", serif', "--display": 'Georgia, "Times New Roman", serif' } : {}),
  } as React.CSSProperties;
  return (
    <html lang="uz" className={inter.variable} style={variables}>
      <body>{children}</body>
    </html>
  );
}
