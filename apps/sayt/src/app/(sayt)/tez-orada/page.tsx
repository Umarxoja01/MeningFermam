import { PageView } from "@/components/sayt/v2/PageView";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/tez-orada");

export default function Page() {
  return <PageView path="/tez-orada" />;
}
