import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/maxfiylik");

export default function Page() {
  return <PublishedPage path="/maxfiylik" />;
}
