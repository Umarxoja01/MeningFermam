import { CallFab } from "./CallFab";
import { Effects } from "./Effects";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { TabBar } from "./TabBar";

// Har sahifada bir xil menyu, footer va ranglar (TZ v3.1 §5, §6).
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#boshi">Asosiy qismga o‘tish</a>
      <SiteNav />
      <TabBar />
      <Effects />
      <main id="boshi" tabIndex={-1}>{children}</main>
      <SiteFooter />
      <CallFab />
    </>
  );
}
