import type { Metadata } from "next";
import "./admin.css";

// Admin sahifalari har so'rovda sessiyani tekshiradi: hech qachon statik yoki keshlangan bo'lmaydi.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MeningFermam — admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
