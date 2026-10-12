import { SiteShell } from "@/components/sayt/v2/SiteShell";
import "./sayt.css";

// Ommaviy sayt (TZ v3.1 §10): route group URL'da ko'rinmaydi.
export default function SaytLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
