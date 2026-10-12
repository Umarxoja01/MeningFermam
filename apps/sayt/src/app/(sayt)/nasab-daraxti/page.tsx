import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/nasab-daraxti");

export default function Page() {
  return <PublishedPage path="/nasab-daraxti" />;
}
