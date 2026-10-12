import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/tez-orada");

export default function Page() {
  return <PublishedPage path="/tez-orada" />;
}
