import { LanguageDetailPage } from "@/components/workspace/LanguagePages";

export default async function Page({ params }) {
  const { language } = await params;
  return <LanguageDetailPage languageId={language} />;
}
