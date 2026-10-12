import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { pageMetadata } from "@/lib/metadata";

export const generateMetadata = () => pageMetadata("/aloqa");

export default function Page() {
  return <PublishedPage path="/aloqa" />;
}
