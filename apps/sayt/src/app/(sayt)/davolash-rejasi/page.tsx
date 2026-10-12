import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/davolash-rejasi");

export default function Page() {
  return <PublishedPage path="/davolash-rejasi" />;
}
