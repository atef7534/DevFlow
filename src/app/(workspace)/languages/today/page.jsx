import { DailyLanguagePage } from "@/components/workspace/LanguagePages";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <DailyLanguagePage initialLanguageId={params?.language ?? ""} />;
}
