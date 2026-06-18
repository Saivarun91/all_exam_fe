import ExamsPageContent from "@/components/exams/ExamsPageContent";
import { fetchExamsPageData } from "@/lib/fetchExamsPageData";

export default async function KeywordExamsPage({ params }) {
  const { keyword } = await params;

  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, " ");
  const keywordTitle =
    decodedKeyword.charAt(0).toUpperCase() + decodedKeyword.slice(1);

  const data = await fetchExamsPageData();

  return (
    <ExamsPageContent
      initialProvider={[]}
      initialKeyword={decodedKeyword}
      initialProvidersData={data.providers}
      initialCategoriesData={data.categories}
      initialExamsData={data.exams}
      initialTrustBarData={data.trustBarItems}
      initialAboutData={data.aboutSection}
      initialPageHeading={`Search: ${keywordTitle}`}
      usePathBasedRouting={true}
    />
  );
}
