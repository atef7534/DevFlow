import { SearchResultsPage } from "@/components/workspace/NotesSearchPages";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <SearchResultsPage query={params?.q ?? ""} />;
}
