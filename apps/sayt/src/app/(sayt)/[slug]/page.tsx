import { PublishedPage } from "@/components/sayt/v2/PublishedPage";
import { defaultWebsite } from "@/content/cms-defaults";
import { pageMetadata } from "@/lib/metadata";

// Bazasiz eksportdagi placeholder 404 bo'ladi; server rejimida yangi URL darhol ochiladi.
export function generateStaticParams() {
  return Object.keys(defaultWebsite.pages).filter((path) => !["/yem-rejasi", "/davolash-rejasi", "/nasab-daraxti", "/statistika", "/daftardan-farqi", "/tez-orada", "/savollar", "/aloqa", "/maxfiylik", "/shartlar"].includes(path))
    .map((path) => ({ slug: path.slice(1) })).concat([{ slug: "cms-preview" }]);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return pageMetadata(`/${slug}`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublishedPage path={`/${slug}`} />;
}
