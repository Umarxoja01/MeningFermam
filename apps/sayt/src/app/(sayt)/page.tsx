import { HomeContent } from "@/components/sayt/v2/HomeContent";
import { pageMetadata } from "@/lib/metadata";
import { CmsProvider } from "@/components/sayt/v2/CmsProvider";
import { SiteShell } from "@/components/sayt/v2/SiteShell";
import { getSiteContent } from "@/lib/cms";

export const generateMetadata = () => pageMetadata("/");

export default async function Home() {
  const content = await getSiteContent();
  return <CmsProvider value={content}><SiteShell><HomeContent /></SiteShell></CmsProvider>;
}
