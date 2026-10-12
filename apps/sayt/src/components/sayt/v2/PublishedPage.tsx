import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/cms";
import { PageView } from "./PageView";
import { CmsProvider } from "./CmsProvider";
import { SiteShell } from "./SiteShell";

export async function PublishedPage({ path, children }: { path: string; children?: React.ReactNode }) {
  const content = await getSiteContent();
  if (!content.website.pages[path]) notFound();
  return <CmsProvider value={content}><SiteShell><PageView path={path}>{children}</PageView></SiteShell></CmsProvider>;
}
