import { FaqList } from "@/components/sayt/v2/PageView";
import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/savollar");

export default function Page() {
  return <PublishedPage path="/savollar"><FaqList /></PublishedPage>;
}
