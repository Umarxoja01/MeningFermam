import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/yem-rejasi");

export default function Page() {
  return <PublishedPage path="/yem-rejasi" />;
}
