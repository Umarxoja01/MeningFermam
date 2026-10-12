import { FaqList, PageView } from "@/components/sayt/v2/PageView";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/savollar");

export default function Page() {
  return <PageView path="/savollar"><FaqList /></PageView>;
}
