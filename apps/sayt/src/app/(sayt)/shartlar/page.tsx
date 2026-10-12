import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/shartlar");

export default function Page() {
  return <PublishedPage path="/shartlar" />;
}
